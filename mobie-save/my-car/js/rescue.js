
/* 救援类型 */
var rescueTypeChildren = {
    trailer: '<div class="rescue-btn rescue-btn-active">非事故拖车</div>' +
        '<div class="rescue-btn">事故拖车</div>',
    rescue: '<div class="rescue-btn rescue-btn-active">非吊车救援</div>' +
    '<div class="rescue-btn">吊车救援</div>'
}

function selectRescueType(e, that) {
    if (e.target.className !== 'rescue-btn') {
        return;
    }

    $(that).children('.rescue-btn').removeClass('rescue-btn-active');

    $(e.target).addClass('rescue-btn-active');

    if (that.id === 'rescueTypeChildren') {
        return;
    }

    if ($(e.target).html() === '拖车' ||
        $(e.target).html() === '困境救援') {
        $('#rescueTypeChildren').show().html(
            $(e.target).html() === '拖车'
                ? rescueTypeChildren.trailer
                : rescueTypeChildren.rescue
        );
    } else {
        $('#rescueTypeChildren').hide();
    }
}

/* 救援信息 */
var verifyList = [
    {
        domId: 'plateNum',
        content: '请输入车牌号'
    },
    {
        domId: 'frameNum',
        content: '请输入车架号'
    },
    {
        domId: 'contacts',
        content: '请输入联系人姓名'
    },
    {
        domId: 'phoneNum',
        content: '请输入手机号'
    },
    {
        domId: 'verCode',
        content: '请输入验证码'
    }
];

function checkInputInfo() {
    var bool = verifyList.some(function(item) {
        return !($('#' + item.domId).val())
    });
    $('.rescue-next-btn > span').toggleClass('disabled', bool);
}
