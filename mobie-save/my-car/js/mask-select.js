var domTemp = ' <div class="mask-select">\n' +
    '        <div class="mask-content">\n' +
    '            <ul class="simple-select">\n' +
    '                <li>5座以下非运营车辆</li>\n' +
    '                <li>5座以上非运营车辆</li>\n' +
    '                <li class="operation">取消</li>\n' +
    '            </ul>\n' +
    '            <div class="complex-select">\n' +
    '                <div class="complex-select-top">\n' +
    '                    <div class="complex-select-title">\n' +
    '                        2018年12月19日\n' +
    '                    </div>\n' +
    '                    <div class="complex-select-content flex">\n' +
    '\n' +
    '                        <div class="swiper-container" id="container1">\n' +
    '                            <div class="swiper-wrapper">\n' +
    '                                <div class="swiper-slide">\n' +
    '                                    2019\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                        </div>\n' +
    '\n' +
    '                        <div class="swiper-container" id="container2">\n' +
    '                            <div class="swiper-wrapper">\n' +
    '                                <div class="swiper-slide">\n' +
    '                                    1\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                        </div>\n' +
    '\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '\n' +
    '                <div class="complex-select-bto flex">\n' +
    '                    <div class="cancel">取消</div>\n' +
    '                    <div class="confirm">确认</div>\n' +
    '                </div>\n' +
    '\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>';


var timeConfigMap = {
    '年': {
        name: 'year',
        method: 'initYear'
    },
    '月': {
        name: 'month',
        method: 'initMonth'
    },
    '日': {
        name: 'day',
        method: 'initDay'
    }
};

function MaskSelect (value, type, options) {

    this.value = value;

    this.type = type;

    this.options = options;

    this.titleVal = '';

    this.valueMap = {};

    this.content = {};

    this.contentDom = {};

    this.timeDom = '';

    this.currencyDom = '';

    this.init();
}

MaskSelect.prototype.init = function () {
    // 如果是选择时间类型
    if (this.type === 'time') {
        this.initTime();
    } else if (this.type === 'currency') {
        this.initCurrency();
    }
};

MaskSelect.prototype.initTime = function () {

    var that = this;

    // 传入的时间格式处理
    var timeConfig = this.options.timeConfig || ['年', '月', '日'];

    if (!timeConfig.length) {
        console.log('timeConfig必须配置一个参数');
        return;
    }

    // 目前只支持 xxxx-xx-xx 的格式
    var timeList = this.value.split('-');

    if (this.value) {
        if (timeList.length === 1) {
            timeList.push(1, 1);
        } else if (timeList.length === 2) {
            timeList.push(1);
        }
    }

    var time = timeList.join('/');

    time = time
        ? new Date(time)
        : new Date();

    timeConfig.forEach(function (item) {
        if (timeConfigMap[item]) {
            that[timeConfigMap[item].method](time);
        }
    });

    this.initTimeDom();

    this.appendTimeDom();

    this.eventClick('confirmHandle', this.options.confirmHandle);
    this.eventClick('cancelHandle', this.options.cancelHandle);
};

MaskSelect.prototype.initYear = function (time) {
    // 初始化年
    var timeYear = time.getFullYear();

    this.valueMap.year = timeYear;

    this.content['year'] = resetYear(timeYear);

    this.initSwipe('year', 'yearDom');
};

MaskSelect.prototype.initMonth = function (time) {
    // 初始化月
    this.valueMap.month = time.getMonth() + 1;

    this.content['month'] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    this.initSwipe('month', 'monthDom');
};

MaskSelect.prototype.initDay = function (time) {
    // 初始化日
    this.valueMap.day = time.getDate();

    this.content['day'] = resetDay(this.valueMap.year, this.valueMap.month);

    this.initSwipe('day', 'dayDom');
};

MaskSelect.prototype.initSwipe = function (contentType, contentDomType) {
    var domSlide = '';
    this.content[contentType].forEach(function(item) {
        domSlide += '<div class="swiper-slide">' + item + '</div>';
    });

    this.contentDom[contentDomType] = '<div class="swiper-container" id="' + contentDomType +'">' +
        '                   <div class="swiper-wrapper">' +
        domSlide +
        '                   </div>' +
        '               </div>';
};

MaskSelect.prototype.initTimeDom = function() {
    this.timeDom = '<div class="mask-content">\n' +
        '            <div class="complex-select">\n' +
        '                <div class="complex-select-top">\n' +
        '                    <div class="complex-select-title" id="titleValue">\n' +
        '                    </div>\n' +
        '                    <div class="complex-select-content flex">\n' +
        (this.contentDom['yearDom'] || '') + (this.contentDom['monthDom'] || '') + (this.contentDom['dayDom'] || '') +
        '                    </div>\n' +
        '                </div>\n' +
        '                <div class="complex-select-bto flex">\n' +
        '                    <div class="cancel" id="cancelHandle">取消</div>' +
        '                    <div class="confirm" id="confirmHandle">确认</div>' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n';
}

MaskSelect.prototype.appendTimeDom = function () {
    var div = document.createElement('div');
    div.className = 'mask-select';
    div.id = 'maskSelect';
    div.innerHTML = this.timeDom;

    $(document.body).append(div);

    this.eventStop();

    this.initSwipeSlide();
};

MaskSelect.prototype.initSwipeSlide = function () {

    var swiperDay = this.initSwipeDay();

    var swiperMonth = this.initSwipeMonth(swiperDay);

    this.initSwipeYear(swiperMonth, swiperDay);

    this.updateTitleValue();

}

MaskSelect.prototype.initSwipeYear = function (swiperMonth, swiperDay) {

    var that = this;

    var swiperYear = new Swiper('#yearDom', {
        autoplay: false,
        direction : 'vertical',
        setWrapperSize: true,
        slidesPerView: 3,
        centeredSlides: true,
        observer: true,
        on: {
            init: function() {
                var index = getCurIndex(this.slides, that.valueMap.year);
                this.slideTo(index, 0, false);
            },
            slideChangeTransitionEnd: function() {
                /** 每次滑动结束要做的事
                 * 1. 跟新 title 的值
                 * 2. 增加 sildes 的值
                 * 3. 重新计算 当前时间 所属月有多少天
                 */

                // 1. 跟新 title 的值
                var activeIndex = this.activeIndex;
                that.valueMap.year = $(this.slides[activeIndex]).html();

                // 2. 增加 sildes 的值
                if (activeIndex < 10) {
                    var firstValue = $(this.slides[0]).html();
                    this.addSlide(0, updateYear(firstValue, 'before'));
                }
                else if (activeIndex > this.slides.length - 1 - 10) {
                    var lastValue = $(this.slides[this.slides.length - 2]).html();
                    this.addSlide(this.slides.length - 1, updateYear(lastValue, 'after'));
                }

                // 3. 重新计算当前时间的 月份 有多少天
                that.updateSwipeDay(swiperDay);

                that.updateTitleValue();
            }
        }
    });

    return swiperYear;
};

MaskSelect.prototype.initSwipeMonth = function (swiperDay) {

    var that = this;

    var swiperMonth = new Swiper('#monthDom', {
        autoplay: false,
        direction : 'vertical',
        setWrapperSize: true,
        slidesPerView: 3,
        centeredSlides: true,
        // observer: true,
        loop: true,
        loopAdditionalSlides: 0,
        loopedSlides: 5,
        on: {
            init: function () {
                var index = getCurIndex(this.slides, that.valueMap.month);
                this.slideTo(index, 0, false);

                this.on('slideChangeTransitionEnd', function() {
                    // 获取当前值
                    var activeIndex = this.activeIndex;
                    that.valueMap.month = $(this.slides[activeIndex]).html();

                    // 3. 重新计算当前时间的 月份 有多少天
                    that.updateSwipeDay(swiperDay);

                    that.updateTitleValue();
                });
            },
        }
    });

    return swiperMonth;
};

MaskSelect.prototype.initSwipeDay = function () {

    var that = this;

    var swiperDay = new Swiper('#dayDom', {
        autoplay: false,
        direction : 'vertical',
        setWrapperSize: true,
        slidesPerView: 3,
        centeredSlides: true,
        // observer: true,
        loop: true,
        loopAdditionalSlides: 0,
        loopedSlides: 5,
        on: {
            init: function () {
                var index = getCurIndex(this.slides, that.valueMap.day);
                this.slideTo(index, 0, false);

                this.on('slideChangeTransitionEnd', function () {
                    console.log(789);
                    // 获取当前值
                    var activeIndex = this.activeIndex;
                    that.valueMap.day = $(this.slides[activeIndex]).html();
                    that.updateTitleValue();
                })

            }
        }
    });

    return swiperDay
};

MaskSelect.prototype.updateSwipeDay = function (swiperDay) {

    if (!swiperDay.$el) {
        return;
    }

    var days = resetDay(this.valueMap.year,  this.valueMap.month);

    this.valueMap.day = days[0];

    swiperDay.removeAllSlides();

    swiperDay.addSlide(0, updateDay(days));

    var dayIndex = getCurIndex(swiperDay.slides, this.valueMap.day);

    swiperDay.slideTo(dayIndex, 0, false);
}

MaskSelect.prototype.updateTitleValue = function () {
    if (this.type === 'time') {
        var htmlVal = '';
        var titleValList = [];
        var that = this;
        this.options.timeConfig.forEach(function (item) {
            if (timeConfigMap[item]) {
                titleValList.push(that.valueMap[timeConfigMap[item].name]);
                htmlVal += that.valueMap[timeConfigMap[item].name] + item;
            }
        });

        that.titleVal = titleValList.join('-');

        $('#titleValue').html(htmlVal);
    }
};

MaskSelect.prototype.removeMask = function () {
    $('#maskSelect').remove();
};

MaskSelect.prototype.eventClick = function (domID, callback) {
    var that = this;
    $('#' + domID).on('click', function (e) {
        callback && callback(that);
        that.removeMask();
    });
};

MaskSelect.prototype.eventStop = function () {
    $("#maskSelect").on("touchmove", function(event){
        event.preventDefault();
    });
}

/* 普通类型 */
MaskSelect.prototype.initCurrency = function () {

    this.valueMap.currency = this.value;

    var currencyList = this.options.currencyList || [];

    if (!currencyList.length) {
        console.log('currencyList 是必须的值');
        return;
    }

    this.titleVal = this.valueMap.currency = currencyList[0];

    var domSlide = '';
    currencyList.forEach(function(item) {
        domSlide += '<div class="swiper-slide swiper-slide-currency" style="width: 100%;">' + item + '</div>';
    });

    this.contentDom['currencyDom'] = '<div class="swiper-container" id="currencyDom">' +
        '                   <div class="swiper-wrapper">' +
        domSlide +
        '                   </div>' +
        '               </div>';

    this.initCurrencyDom();

    this.appendCurrencyDom();

    this.eventClick('confirmHandle', this.options.confirmHandle);
    this.eventClick('cancelHandle', this.options.cancelHandle);
};

MaskSelect.prototype.initCurrencyDom = function () {
    this.currencyDom = '<div class="mask-content">\n' +
        '            <div class="complex-select">\n' +
        '                <div class="complex-select-top">\n' +
        '                    <div class="complex-select-title" id="titleValue">\n' +
        '                    </div>\n' +
        '                    <div class="complex-select-content flex">\n' +
        (this.contentDom['currencyDom'] || '') +
        '                    </div>\n' +
        '                </div>\n' +
        '                <div class="complex-select-bto flex">\n' +
        '                    <div class="cancel" id="cancelHandle">取消</div>' +
        '                    <div class="confirm" id="confirmHandle">确认</div>' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n';
}

MaskSelect.prototype.appendCurrencyDom = function () {
    var div = document.createElement('div');
    div.className = 'mask-select';
    div.id = 'maskSelect';
    div.innerHTML = this.currencyDom;

    $(document.body).append(div);

    this.eventStop();

    this.initCurrencySwipe();
};

MaskSelect.prototype.initCurrencySwipe = function () {
    var that = this;

    new Swiper('#currencyDom', {
        autoplay: false,
        direction : 'vertical',
        setWrapperSize: true,
        slidesPerView: 3,
        centeredSlides: true,
        observer: true,
        on: {
            init: function() {
                var index = getCurIndex(this.slides, that.valueMap.currency);
                this.slideTo(index, 0, false);
            },
            slideChangeTransitionEnd: function() {
                var activeIndex = this.activeIndex;
                that.titleVal = that.valueMap.currency = $(this.slides[activeIndex]).html();
                // that.titleVal = that.valueMap.currency;
                // console.log(that.titleVal);
            }
        }
    });
};

/**
 * 重置 year 的值
 * @param year
 * @returns {Array}
 */
function resetYear(year) {
    // 根据当前时间 取得 前后十年
    var list = [];

    var lastYear = year - 10;

    var i = 21;

    while (i--) {
        lastYear++;
        list.push(lastYear);
    }

    return list;
};

/**
 * 更新year 的值
 * @param curValue
 * @param type
 * @returns {Array}
 */
function updateYear(curValue, type) {

    curValue = Number(curValue);

    var i = 10;
    var list = [];

    while (i--) {
        type === 'before'
            ? curValue--
            : curValue++;
        list.push('<div class="swiper-slide">' + curValue + '</div>')
    };

    return list;
};

/**
 * 更新天数
 * @param list
 * @returns {*}
 */
function updateDay(list) {
    return list.map(function (item) {
       return '<div class="swiper-slide">' + item + '</div>';
    });
}

/**
 * 重置天
 * @param year
 * @param month
 * @returns {Array}
 */
function resetDay(year, month) {
    var temp = new Date(year, month, 0);
    var day = temp.getDate();
    var list = [];

    while (day) {
        list.unshift(day);
        day--;
    }

    return list;
};

/**
 * 获取指定 index
 * @param list
 * @param value
 * @returns {number}
 */
function getCurIndex(list, value) {
    var curIndex = 0;

    var bool = false;

    list.each(function (index, item) {
        if (bool) {
            return;
        }
        if ($(item).html() === value.toString()) {
            curIndex = index;
            bool = true;
        }
    });

    return curIndex;
}


//
function SelectDom(selectDom, config) {

    this.valueDom = $(selectDom).find('.value');

    this.placeDom = $(selectDom).find('.place');

    this.value = config.value || '';

    this.place = config.place || '请选择';

    this.type = config.type || 'time';

    this.timeConfig = config.timeConfig || ['年', '月', '日'];

    this.currencyList = config.currencyList || [];

    this.init(selectDom, config);
}

SelectDom.prototype.init = function init(selectDom, config) {

    if (this.value) {
        this.placeDom.hide();
        this.valueDom.html(this.value).show();
    } else {
        this.placeDom.show().html(this.place);
        this.valueDom.hide();
    }

    var that = this;

    $(selectDom).on('click', function (e) {
        var mask = new MaskSelect(that.value, that.type, {
            timeConfig: that.timeConfig,
            currencyList: that.currencyList,
            confirmHandle: function () {
                that.value = mask.titleVal;
                that.placeDom.hide();
                that.valueDom.html(mask.titleVal).show();

                config.confirmHandle && config.confirmHandle();
            },
            cancelHandle: function () {
                if (that.value) {
                    that.placeDom.hide();
                    that.valueDom.html(that.value).show();
                } else {
                    that.placeDom.show().html(that.place);
                    that.valueDom.hide();
                }

                config.cancelHandle && config.cancelHandle();
            }
        });
    });
};


