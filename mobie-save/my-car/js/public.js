(function () {
    var desW = 750, docEl = document.documentElement || document.body;
    resize = "orientationchange" in window ? 'orientationchange' : 'resize';
    var setRem = function () {
        var screenWidth = docEl.clientWidth || window.screen.width;
        fontS = screenWidth < 750 ? 100 * screenWidth / desW : 100;
        docEl.style.fontSize = fontS + 'px';
    };
    setRem();
    window.addEventListener(resize, setRem, false);
})();

function toast(txt) {
    $('.toast').fadeIn().html(txt);
    setTimeout(function () {
        $('.toast').fadeOut()
    }, 2000);
}

// 补0函数
function tuDou(n) {
    return n >= 0 && n < 10 ? "0" + n : "" + n;
}

/*倒计时*/
function getCountTime(time,other) {
    var hour, minute, second;
    hour = Math.floor(time / (60 * 60));
    time = time - hour * (60 * 60);
    minute = Math.floor(time / 60);
    time = time - minute * 60;
    second = time;
    if(other){
        return tuDou(hour) + ":" + tuDou(minute) + ":" + tuDou(second);
    }else{
        return tuDou(hour) + "时" + tuDou(minute) + "分" + tuDou(second) + "秒";
    }
    return tuDou(hour) + "时" + tuDou(minute) + "分" + tuDou(second) + "秒";
}
function countDown(time,$dom,other) {
    var timer = setInterval(function () {
        if(time === 0){
            clearInterval(timer);
            return
        }
        time = time - 1;
        $dom.text(getCountTime(time,other));
    },1000)
}