#  前端自动化构建环境的搭建

#  为了UED前端团队更好的协作开发同时提高项目编码质量，我们需要将Web前端使用工程化方式构建；

#  功能：

#  1. 压缩HTML模板
#  2. 编译LESS文件
#  3. 压缩图片
#  4. 压缩编译后的CSS
#  5. 压缩Javascript
#  6. 制作雪碧图
#  7. 启动开发环境 和 生产环境
#  8. 启动服务器和热跟新
#  9. 打包项目且生成压缩包
<!-- #  编译es6语法 -->
<!-- #  结合webpack使用（选用） -->


#  插件

#  gulp-less:            less的编译
#  gulp-autoprefixer:    自动添加css前缀
#  gulp-minify-css:      压缩css一行
#  gulp-uglify:          压缩js代码
#  gulp-notify:          加控制台文字描述用的
#  gulp-clean:           清理文件
#  gulp-file-include:    include 文件用
#  gulp.spritesmith:     生成雪碧图
#  gulp-imagemin:        图片压缩
#  imagemin-pngquant:    图片无损压缩
#  gulp-cache:           检测文件是否更改
#  gulp-zip:             自动打包并按时间重命名
#  gulp-htmlmin:         压缩html
#  merge-stream:         合并多个 stream
#  gulp-util:            打印日志 log
#  gulp-plumber:         监控错误
#  gulp-babel:           编译ES6
#  gulp-if:              条件判断
#  gulp-sequence:        顺序执行
#  gulp-eslint:          代码风格检测工具
#  browser-sync:         使用Browser Sync自动刷新
#  del:                  删除文件


#  项目目录结构

│  
│  config.js         // 路径配置文件 (暂时没配置)
│  gulpfile.js       // gulp配置文件
│  package.json      // 依赖模块json文件,npm install会安装项目所有的依赖模块
│  README.MD         // 项目说明
│  
├─dist               // 打包生成后的文件 
|
├─node_modules       // 依赖模块包目录
│      
└─src                // 开发环境项目
    │  
    ├─static         // 静态资源
    │  ├─styles      // 样式文件
    │  ├─images      // 图片文件
    │  ├─scripts     // js文件
    │  
    └─views          // 页面模板


#  项目任务命令
#  Build Setup

#  开发环境： npm run dev    (代码不会压缩 方便调试)
#  生产环境： npm run build  (代码压缩打包成zip)

#  删除生成的文件夹:   gulp clean
#  编译压缩js代码:     gulp minifyjs
#  编译压缩css代码:    gulp minifycss
#  编译压缩html代码:   gulp minifyhtml
#  编译压缩图片:       gulp minifyimage
#  监听所有文件:       gulp watch

注意 ：

1 . "所有新增加文件必须放到指定目录下( 按照之前的一样放置就OK )"
2 . "所有新增雪碧图的css背景图片路径，( 按照之前src文件下less中的写法复制并替换图片名字就OK )"
3 . "新增雪碧图的名字按照之前的顺序( 依次递增 )就OK"