(function(){
    var desW = 750, docEl = document.documentElement || document.body;
    resize = "orientationchange" in window ? 'orientationchange' : 'resize';
    var setRem = function (){
        var screenWidth = docEl.clientWidth || window.screen.width;
        fontS = 100 * screenWidth/desW;
        docEl.style.fontSize = fontS + 'px';
    };
    setRem();
    window.addEventListener(resize,setRem,false);
})();

function toast(txt){
    $('.toast').fadeIn().html(txt);
    setTimeout(function (){
        $('.toast').fadeOut()
    },2000);
}