/**
 * gulp构建 
 * gulpfile.js 配置文件
 * 宜湃网资产管理平台 2017-12-8
 * create by hanlin
 */

/**
 * 路径配置文件
 */
var config = require('./config');              

/**
 * node模块 和 gulp插件
 */
var fs               = require('fs'),               // node fs模块处理文件         
    path             = require('path'),             // node path模块处理路径
    del              = require('del'),              // 删除文件
    zip              = require('gulp-zip'),         // 自动打包并按时间重命名
    gulp             = require('gulp'),             // gulp核心
    uglify           = require('gulp-uglify'),      // 压缩js代码
    less             = require('gulp-less'),        // 编译less
    minifycss        = require('gulp-minify-css'),  // 压缩css一行
    imagemin         = require('gulp-imagemin'),    // 图片压缩
    pngquant         = require('imagemin-pngquant'),// 图片无损压缩
    gulpplumber      = require('gulp-plumber'),     // 监控错误
    gulphtmlmin      = require('gulp-htmlmin'),     // 压缩html
    clean            = require('gulp-clean'),       // 清理文件
    cache            = require('gulp-cache'),       // 检测文件是否更改
    notify           = require('gulp-notify'),      // 加控制台文字描述用的
    spritesmith      = require('gulp.spritesmith'), // 生成雪碧图
    gulpsequence     = require('gulp-sequence'),    // 顺序执行
    gulpautoprefixer = require('gulp-autoprefixer'),// 自动添加css前缀
    include          = require("gulp-file-include"),// include文件
    replace          = require("gulp-replace"),     // 字符串替换
    browserSync      = require('browser-sync'),     // 使用Browser Sync自动刷新 Browser Sync 帮助我们搭建简单的本地服务器并能实时刷新浏览器，它还能 同时刷新多个设备
    reload           = browserSync.reload,          // 刷新方法
    gutil            = require('gulp-util'),        // gulp工具 只用到了打印日志的功能
    gulpif           = require('gulp-if'),          // 条件判断
    changed          = require('gulp-changed');
    spriteObject     = {};                          // 雪碧图css映射对象


/**
 * NODE_ENV
 */
var env       = (process.env.NODE_ENV || 'development').replace(/^\s*|\s*$/g, '');
var condition = env === 'production';


/**
 * 错误输出
 * @param {any} error 
 */
var onError = function(error){
  var title = error.plugin + ' ' + error.name;
  var msg   = error.message;
  var errContent = msg.replace(/\n/g, '\\A '); 

  // 系统通知
  notify.onError({
      title: title,
      message: errContent, 
      sound: true
  })(error);
  
  // 防止中途退出
  this.emit('end');
};

/**
 * 压缩js
 */
gulp.task('minifyjs',['sprites'],function() {
  return gulp.src(config.dev.script)
    .pipe(changed(config.build.script, {extension: '.js'}))
    .pipe(gulpplumber(onError))
    .pipe(gulpif(condition, uglify()))
    .pipe(gulp.dest(config.build.script))
    .pipe(reload({ stream: true }));
})

/**
 * 编译less 压缩css
 */
gulp.task('minifycss',['sprites'],function() {
  var AUTOPREFIXER_BROWSERS = [
    'last 6 version',
    'ie >= 6',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.0',
    'bb >= 10'
  ];
  return gulp.src(config.dev.styles)
    .pipe(gulpplumber(onError))
    // background: url('../../images/icon_sprite/sprite_27.png?__sprite') no-repeat center;
    // background: url('../../images/icon_sprite/sprite_46.png') no-repeat no-repeat center center;
    // background: url(../static/images/icon_sprite/sprite_11.png?__sprite) no-repeat center;
    .pipe(replace(/background: url\(\'?(\.\.\/)*images\/icon\_sprite\/(\w+)\.png(\?\_\_sprite)*\'?\)([\sa-z\-]+)\;/g, function(a, b, c) {
      return spriteObject[c];
    } ))
    .pipe(less())
    .pipe(gulpautoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulpif(condition, minifycss()))
    .pipe(gulp.dest(config.build.styles))
    .pipe(reload({ stream: true }));
})

/**
 * 拷贝字体图标
 */
gulp.task('copyfont', ['sprites'],function() {
  gulp.src(config.dev.font)
    .pipe(gulp.dest(config.build.font))
})

/**
 * 替换编译以后的components下面所有css引用的雪碧图路径
 */
gulp.task('replacespriteurl', ['minifycss'],function() {
  gulp.src('dist/static/styles/components/*.css')
  .pipe(replace(/background: url\(\'?(\.\.\/)*static\/images\/icon\_sprite\/(\w+)\.png(\?\_\_sprite)*\'?\)([\sa-z\-]+)\;/g, function(a, b, c) {
    return spriteObject[c];
  }))
  .pipe(gulp.dest('dist/static/styles/components'))
})

/**
 * 压缩图片
 */
gulp.task('minifyimage',['sprites'],function() {
  return gulp.src(config.dev.images)
    .pipe(gulpplumber(onError))
    .pipe(cache(imagemin({
      progressive: true,
      svgoPlugins: [{
          removeViewBox: false
      }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest(config.build.images))
    // .pipe(reload({ stream: true }));
})

/**
 * 压缩html模板
 */
gulp.task('minifyhtml',['sprites'],function() {
  return gulp.src(config.dev.html)
    .pipe(gulpplumber(onError))
    .pipe(replace(/<!--{include file=\"common\/(\w+).html\"}-->/g, '@@include("./common/$1.html")'))
    .pipe(include({
      prefix: '@@',
      basepath: '@file'}))
    .pipe(gulpif(condition, replace(/(src|href)\=\"(\.\.\/)+static\//g, '$1="/Resource/static_new/static/') ))
    .pipe(gulpif(condition, replace(/require\(\[\'\/static/g, 'require([\'/Resource/static_new/static')))
    // .pipe(gulphtmlmin({collapseWhitespace: true})) // 不压缩 方便后端套用
    .pipe(gulp.dest(config.build.html))
    .pipe(reload({ stream: true }));
})

/**
 * 删除活动文件html模板
 * 等待 minifyhtml2 任务重新编译压缩
 */
gulp.task('deletehtml',['minifyhtml','minifycss'], function() {
  del(['dist/views/activity/*.html']).then(function() {
    console.log('删除活动文件完毕！')
  })
  // 用不到的雪碧图less文件 删除掉
  del(['src/static/images/spriteless']).then(function() {
    console.log('删除雪碧图less！')
  })
})

/**
 * 压缩活动文件html模板
 */
gulp.task('minifyhtml2',['deletehtml'],function() {
  return gulp.src(config.dev.activity)
    .pipe(gulpplumber(onError))
    .pipe(replace(/<!--{include file=\"\.\.\/common\/(\w+).html\"}-->/g, '@@include("../common/$1.html")'))
    .pipe(include({
      prefix: '@@',
      basepath: '@file'}))
    .pipe(gulpif(condition, replace(/(src|href)\=\"(\.\.\/)+static\//g, '$1="/Resource/static_new/static/') ))
    .pipe(gulpif(condition, replace(/require\(\[\'\/static/g, 'require([\'/Resource/static_new/static')))
    // .pipe(gulphtmlmin({collapseWhitespace: true}))  // 不压缩 方便后端套用
    .pipe(gulp.dest(config.build.activity))
    .pipe(reload({ stream: true }));
})

/**
 *   制作雪碧图 (支持同时制作多个)
 *   规定如下
 *   在src/static/images/icon_sprite中，icon_sprite是作为需要制作雪碧图的文件夹
 *   在icon_sprite文件夹下，必须新建一个文件夹，例如user文件夹，me文件，存放你的图标
 *   执行gulp sprites任务
 *   任务完成，在src/static/images中就会生成一个icon文件夹，里面就是生成的雪碧图，在src/static/styles会生成雪碧图的less样式文件
 */

var srcDir = path.resolve(process.cwd(), config.dev.sprite);
/**
 * 获取获取文件名字和路径
 */
var iconFolder = function() {
    var filesSrc = []; // 文件路径
    var filesName = []; // 文件名字
    
    // 遍历获取文件名字和路径
    fs.readdirSync(srcDir).forEach(function(file, i){
        var reg = /\.(png|jpg|gif|ico)/g;
        var isImg = file.match(reg);

        // 判读是  file.indexOf('sprite') != -1
        if(!isImg){
            filesName.push(file);
            filesSrc.push(path.resolve(srcDir, file, '*.{png,jpg}'));
        }
    });
    // 返回文件名字和路径
    return {
        'name': filesName,
        'src' : filesSrc
    };
}

/**
 * 支持多个文件夹编译生成雪碧图
 * 雪碧图制作规定要求
 * 在images文件夹下icon文件夹,新建一个文件夹就可以
 */
var csssPrites = function() {
  var folder = iconFolder();
  var folderName = folder.name;
  var folderSrc = folder.src;
  var spritresult;

  folderSrc.forEach(function (item, i) {
    var imgName = `icon/icon_${folderName[i]}.png`;
    var cssName = `spriteless/icon_${folderName[i]}.less`;
    spritresult = gulp.src(item) // 需要合并的图片地址
      .pipe(spritesmith({
        imgName: imgName, // 保存合并后图片的地址
        cssName: cssName, // 保存合并后对于css样式的地址
        padding: 10,  // 合并时两个图片的间距
        cssFormat: 'less',
        algorithm: 'binary-tree', // 注释1
        // cssTemplate: './cssTemplate.tpl' // 模板
        cssTemplate: function (data) {
            var arr=[];
            var imageUrl = "";
            data.sprites.forEach(function (sprite) {
                arr.push(".icon-"+sprite.name+
                "{" +
                "background-image: url('"+sprite.escaped_image+"');"+
                "background-position: "+sprite.px.offset_x+"px "+sprite.px.offset_y+"px;"+
                "width:"+sprite.px.width+";"+
                "height:"+sprite.px.height+";"+
                "}\n");
                imageUrl = (sprite.escaped_image + '').replace('../', '../../images/')
                spriteObject[sprite.name] = "background-image: url('"+imageUrl+"'); background-position: "+sprite.px.offset_x+" "+sprite.px.offset_y+";"
            });
            return arr.join("");
        }
      }))
      .pipe(gulp.dest(config.build.sprite))
      .pipe(reload({ stream: true }));
  })
  return spritresult;
}

/**
 * 生成雪碧图 
 */ 
gulp.task('sprites', function () {
  // 执行任务
  return csssPrites();
});

/**
 * watch 文件
 */
gulp.task('watch',['sprites'], function() {
  // 监听所有.html文件
  gulp.watch(config.watch.html, ['minifyhtml'])
  // 监听所有.less文件
  gulp.watch(config.watch.styles, ['minifycss'])
  // 监听所有.js文件
  gulp.watch(config.watch.script, ['minifyjs'])
  // 监听所有图片文件
  gulp.watch(config.watch.images, ['minifyimage'])
});

/**
 * clean 清除
 */
gulp.task('clean', function() {
  del([config.clean.dist, config.clean.icon, config.clean.spriteless]).then(function() {
    console.log('dist 和 src 下所有生成的文件已删除完毕！')
  });
});

/**
 * 执行build命令构建静态资源
 * default
 */
// gulp.task('build',['sprites','minifycss','minifyimage','minifyjs','minifyhtml','deletehtml','minifyhtml2','watch'], function() {
//   console.log('构建完毕！')
// });

/**
 * build 打包项目
 */
gulp.task('build', function() {
  cnEnvironment(function(){
      gulp.start('zip', function(){
         gutil.log(gutil.colors.green('Message：Project package is complete'));
      });
  })
});

/**
 * 打包资源
 * zip 压缩包 
 */
gulp.task('zip', function() {
  /**
   * 补零
   */
  function checkTime(i) {
    if (i < 10) { i = '0' + i; }
    return i;
  }

  var d = new Date();
  var year = d.getFullYear();
  var month = checkTime(d.getMonth() + 1);
  var day = checkTime(d.getDate());
  var hour = checkTime(d.getHours());
  var minute = checkTime(d.getMinutes());

  var time = String(year) + String(month) + String(day) + String(hour) + String(minute);
  var build = 'dist-' + time + '.zip';
  
  return gulp
    .src(config.zip)
    .pipe(gulpplumber(onError))
    .pipe(zip(build))
    .pipe(gulp.dest('zip'))
    .pipe(notify({ message: 'Zip task complete' }));
});

/**
 * 开发环境和生产环境
 * 先清空原先文件夹，在执行编译或者打包
 * @param {any} cb 回调
 */
var cnEnvironment = function(cb) {
  // 先执行清空文件夹内容
  del('dist').then(paths => {
    // 通知信息
    gutil.log(gutil.colors.green('Message：Delete complete!'));
    gutil.log(gutil.colors.green('Message：Deleted files and folders:', paths.join('\n')));
    
    // 执行项目打包
    gulpsequence([
        'sprites', 'minifycss', 'minifyimage', 'minifyjs', 'minifyhtml','deletehtml','minifyhtml2','copyfont','replacespriteurl'
    ], function() {
        gutil.log(gutil.colors.green('Message：Compile finished!'));
        // 执行回调
        cb &&　cb();
    });
  });
}

/**
 * 启动 server 服务器和热更新
 */
gulp.task('server', function() {
  cnEnvironment(function(){
    browserSync.init({ // 初始化 BrowserSync
      injectChanges: true, // 插入更改
      files: [
        '*.html', '*.css', '*.js', '*.png', 'jpg', 'gif'
      ], // 监听文件类型来自动刷新
      server: {
        baseDir: config.server, // 目录位置
      },
      ghostMode: { // 是否开启多端同步
        click: true, // 同步点击
        scroll: true // 同步滚动
      },
      logPrefix: 'browserSync in gulp', // 再控制台打印前缀
      browser: ["chrome"], // 运行后自动打开的；浏览器 （不填默认则是系统设置的默认浏览器）
      open: true,  // 自动打开浏览器
      port: 3000   // 使用端口
    });
    // 启动监听 watch任务
    gulp.start('watch');
  })
});



