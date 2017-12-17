/**
 * Created by hanlin on 2017-12-12.
 * require config
 */
!(function() {
  var BaseUrl = '../static/scripts/';   //指向scripts工程目录
  var mod = {
    baseUrl: BaseUrl,
    paths: {
      'jquery'   : 'lib/jquery-1.12.4.min',
      'bxslider' : 'lib/jquery.bxslider.min' 
    }
    // urlArgs: "v="+ 1.0
  };
  requirejs.config(mod);
})()
window.jQuery&&define("jquery",[],function(){return window.jQuery});