/* 
 * 首页  
 * @version: 0.0.1 
 * @date: 2017-09-28 11:45:45 
 * @author: zzf@zhaozhifeng@yidai.com 
 * @description: 首页控制器 
 * @depend: @jquery
 *          @unslider   http://idiot.github.io/unslider/
 */

require(['jquery'], function ($) {

    require(['bxslider'],function() {
        
        $(function(){
            $('#banner').bxSlider({
                mode: 'fade',
                speed: 1000,
                tickerHover: true,
                controls: false,
                auto: true,
                pause: 7000,
                preloadImages: 'all'
            }); 
            $('#notice').bxSlider({
                mode: 'vertical',
                speed: 800,
                tickerHover: true,
                auto: true,
                pause: 5000,
                controls: false,
                pager: false
            }); 
        })
    })
});