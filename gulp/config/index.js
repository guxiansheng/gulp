/**
 * pathconfig.js
 * create by hanlin 
 * 2017-12-13
 */

const path = require('path')

function resolveDev(dir) {
  return path.join(__dirname, '../src/', dir)
}

function resolveBuild(dir) {
  return path.join(__dirname, '../dist/', dir)
}

module.exports = {
  dev: {

    html  :  resolveDev('views/**/*.html'),

    styles: resolveDev('static/styles/**/*.less'),

    script: resolveDev('static/scripts/**/*.js'),

    images: resolveDev('static/images/**/*.{png,jpg,gif,ico}'),

    font  : resolveDev('static/styles/font/**'),

    sprite: resolveDev('static/images/icon_sprite'),

    activity : resolveDev('views/activity/*.html')

  },

  build: {

    html  : resolveBuild('views'),

    styles: resolveBuild('static/styles'),

    script: resolveBuild('static/scripts'),

    images: resolveBuild('static/images'),

    font  : resolveBuild('static/styles/font'),

    sprite: resolveDev('static/images'),  /*****/

    activity : resolveBuild('views/activity')

  },

  watch : {

    html  : 'src/views/**/*.html',

    styles: 'src/static/styles/**/*.less',

    script: 'src/static/scripts/**/*.js',

    images: 'src/static/images/**/*.{png,jpg,gif,ico}'

  },

  clean : {

    dist  : 'dist',

    icon  : 'src/static/images/icon',

    spriteless : 'src/static/images/spriteless'

  },

  zip    : 'dist/**/*',

  server : './dist'

}