let common = {
    getSmallPic(url) { //限宽400
        let thumbUrl = "";
        if (url) {
            thumbUrl = url + '?x-oss-process=style/resize';
        }
        return thumbUrl;
    },

    /**
     * 获取图片信息
     * @param {*} url
     * @returns
     */
    getImageInfo(url) {
        if (url) {
            url += '?x-oss-process=image/info';
        }
        return url
    },

    formatTime(date) {
        date = new Date(date);
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()

        const formatNumber = n => {
            n = n.toString()
            return n[1] ? n : '0' + n
        }

        return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
    },

    bezier(pots, amount) {
        var pot;
        var lines;
        var ret = [];
        var points;
        for (var i = 0; i <= amount; i++) {
            points = pots.slice(0);
            lines = [];
            while (pot = points.shift()) {
                if (points.length) {
                    lines.push(pointLine([pot, points[0]], i / amount));
                } else if (lines.length > 1) {
                    points = lines;
                    lines = [];
                } else {
                    break;
                }
            }
            ret.push(lines[0]);
        }

        function pointLine(points, rate) {
            var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
            var ret = [];
            pointA = points[0]; //点击
            pointB = points[1]; //中间
            xDistance = Math.abs(pointB.x - pointA.x);
            yDistance = pointB.y - pointA.y;
            pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
            tan = yDistance / xDistance;
            radian = Math.atan(tan);
            tmpPointDistance = pointDistance * rate;
            if (pointB.x > pointA.x) {
                ret = {
                    x: pointA.x + tmpPointDistance * Math.cos(radian),
                    y: pointA.y + tmpPointDistance * Math.sin(radian)
                };
            } else {
                ret = {
                    x: pointA.x - tmpPointDistance * Math.cos(radian),
                    y: pointA.y + tmpPointDistance * Math.sin(radian)
                };
            }
            return ret;
        }
        return {
            'bezier_points': ret
        };
    },

    getTagList() {
        let tagList = [{
                name: '迷彩'
            },
            {
                name: '动物纹理'
            },
            {
                name: '海洋风'
            },
            {
                name: '抽象艺术'
            },
            {
                name: '民族风'
            },
            {
                name: '几何图形'
            },
            {
                name: '动物花组合'
            },
            {
                name: '人物类'
            },
            {
                name: '组合类花卉'
            },
            {
                name: '丛林'
            },
            {
                name: '水果与花'
            },
            {
                name: '卡通'
            },
            {
                name: '佩兹利纹样'
            },
            {
                name: '豹纹'
            },
            {
                name: '超大花朵'
            },
            {
                name: '格子'
            },
            {
                name: '大花朵'
            },
            {
                name: '条纹'
            },
            {
                name: '小碎花'
            },
            {
                name: '波点'
            },
            {
                name: '热带风情'
            },
            {
                name: '叶子'
            },
            {
                name: '动物'
            },
            {
                name: '其它'
            }
        ];
        return tagList;
    },

};

export default common;