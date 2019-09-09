import API from '../config/api'
import TOOL from '../config/utils'
import $ from 'zepto-webpack'
import html2canvas from 'html2canvas'
import '../less/reset.less'
import '../less/pay.less'

$(function() {

    // 设置高度
    var screenHeight = $(window).height();
    var contentHeight = $('#content').height();
    if (contentHeight < screenHeight) {
        $(document.body).height(screenHeight);
        $('#content').height(screenHeight)
    }

    // 设置电话号码
    var phoneNumber = window.sessionStorage.getItem('phoneNumber');
    $('#phoneNumber').html(phoneNumber);

    // 截图
    var cnv = document.createElement('canvas'),
        width = $(document.body).width(),
        height = $(document.body).height(),
        scale = 2;

    cnv.width = width * scale;
    cnv.height = height * scale;
    cnv.style.width = width * scale + 'px';
    cnv.style.height = height * scale + 'px';
    cnv.getContext("2d").scale(scale, scale);

    var opt = {
        scale: scale,
        canvas: cnv,
        width: width,
        height: height,
        useCORS: true,
        logging: false,
    };


    html2canvas(document.body, opt)
        .then(function(canvas) {
            var img = new Image();
            img.src = canvas.toDataURL();
            img.style.position = 'absolute';
            img.style.top = '0px';
            img.style.left = '0px';
            img.onload = function() {
                document.body.appendChild(img);
            }
        });
});
