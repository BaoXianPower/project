<template>

    <div
        class="bgp-pattern"
        :style="{'width': width + 'px', 'height': height + 'px'}"
    >
        <img class="bgp-image"
             v-for="(image, index) in pattern.images"
             :key="index"
             :src="image.url"
             @load.once="imageLoad(image, $event)"
        />

        <canvas
            class="bgp-canvas-preview"
            ref="canvasOne"
            :width="width"
            :height="height"
        ></canvas>

        <canvas
            class="bgp-canvas-overlay"
            ref="canvasTwo"
            :width="width"
            :height="height"
            @mousemove="focus($event)"
            @click="select"
            :class="{'bgp-canvas-overlay-target': bgpCanvasOverlayTarget}"
        ></canvas>

        <div class="bgp-transform-box"
             :style="elCss"
             ref="bgpTransformBox"
             v-if="pattern._focused">

            <div class="bgp-tbox-cr"
                 :class="{'dragging': draggingClass}"
                 :style="elCircleCss"
                 @mousedown="onBeforeStart($event)"
                 v-if="moveFlag"
            ></div>
            <span class="bgp-tbox-rs"
                  ref="elHandle"
                  :style="elHandleCss"
                  @mousedown="onBeforeStart($event)"
                  v-if="rotateFlag"
            ></span>

        </div>

    </div>

</template>

<script type="text/ecmascript-6">
    /* * * * * * * * *
     * relyOn:       *
     * jquery,       *
     * this.$com.mix *
     * * * * * * * * */

    import $ from 'jquery'

    // 移动全局变量
    let lmx, lmy, smx, smy,startPos;

    // 缩放全局变量
    let startTrsn, sScale, dScale, center = {left: 0, top: 0};

    export default {
        props: {

            /**
             * 默认值
             */
            value: {},

            width: {
                Number, default: 500
            },
            height: {
                Number, default: 800
            },
            moveFlag: {
                Boolean, default: true
            },
            rotateFlag: {
                Boolean, default: true
            }

        },

        data () {
            return {
                // pattern: this.$com.mix(true, {}, this.value),
                pattern: this.value,

                // 图片像素点
                snapshots: [],

                // hover操作层状态
                bgpCanvasOverlayTarget: false,

                // 被选择元素
                target: null,

                // canvas的位置
                offset: null,

                // 大圆圈样式
                elCss: null,

                // 移动盒子样式
                elCircleCss: null,

                // 小圆圈样式
                elHandleCss: null,

                // 移动中样式
                draggingClass: null,

                // 移动或者旋转触发目标
                elTarget: '',

                // 鼠标移动最大位置
                mouseMove: null
            }
        },

        computed: {
        },

        methods: {
            /** com **/
            rgbaFilter (color) {
                color = color || [0, 0, 0, 0];
                return 'rgba(' + color.join(',') + ')';
            },

            /** 图片加载 **/
            imageLoad (image, e) {
                let img = e.target,
                    clrCanvas = document.createElement('canvas'),
                    colorize = this.colorize.bind(this.colorize, clrCanvas, e.target);

                image._clr = () => {
                    return clrCanvas;

                };

                clrCanvas.width = Math.round(img.width); // 变为整数 四舍五入
                clrCanvas.height = Math.round(img.height);

                if (img.complete) {
                    image.complete = true;
                    image._clrUrl = colorize(); // base64位
                }
            },
            colorize(canvas, img) {
                canvas = canvas || (function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        return canvas;
                    }());

                var ctx = canvas.getContext('2d');

                ctx.clearRect(0, 0, img.width, img.height); // 在给定的矩形内清除指定的像素
                ctx.drawImage(img, 0, 0, img.width, img.height); // 向画布上绘制图像、画布或视频

                // 保存当前环境的状态
                ctx.save();

                return canvas.toDataURL(); // 返回一个包含图片展示的 dataURL 默认为 png
            },

            /** 展示层 canvas 初始化 **/
            postLink () {
                let canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    preview = this.$refs.canvasOne,
                    previewCtx = preview.getContext('2d');

                let x, y, i, params, img, steps, destWidth, destHeight, snapshots, order = [-1, 0, 1];

                return () => {

                    snapshots = [];

                    canvas.width = this.pattern.width * this.pattern.scale;
                    canvas.height = this.pattern.height * this.pattern.scale;

                    ctx.fillStyle = this.rgbaFilter(this.pattern.color);
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据
                    snapshots.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

                    // 每个子图片的
                    for (i = 0; i < this.pattern.images.length; i++) {
                        params = this.pattern.images[i];

                        img = params._clr && params._clr();

                        // Math.log(x) 返回一个数的自然对数
                        steps = Math.ceil(Math.log(1 / params.scale) / Math.log(2));

                        destWidth = Math.ceil(params.width * params.scale);
                        destHeight = Math.ceil(params.height * params.scale);


                        while (--steps > 0) {
                            // 返回一个canvas 对象, 并且不断的裁剪
                            img = this.downscale(img);
                        }

                        for (x = 0; x < order.length; x++) {

                            for (y = 0; y < order.length; y++) {

                                ctx.save();

                                // 重新映射画布上的 (0,0) 位置
                                ctx.translate(
                                    Math.round(canvas.width * order[x] + (params.left % canvas.width) + params.width/2),
                                    Math.round(canvas.height * order[y] + (params.top % canvas.height) + params.height/2)
                                );

                                // 旋转当前绘图
                                ctx.rotate(params.rotate * Math.PI / 180);

                                // 在画布上定位图像，并规定图像的宽度和高度：
                                ctx.drawImage(
                                    img,
                                    -destWidth/2,
                                    -destHeight/2,
                                    destWidth,
                                    destHeight
                                );

                                // 返回之前保存过的路径状态和属性
                                ctx.restore();
                            }

                        }
                        // 将画布 从新复制一份 添加到 snapshots
                        snapshots.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                    }

                    // 缓存  每个image 的 ImageData 对象
                    this.index(snapshots);

                    // 清除第一层主画布
                    previewCtx.clearRect(0, 0, preview.width, preview.height);

                    // 保存好
                    previewCtx.save();

                    // 用每个image创建出来的canvas 不断重复 '填充' 到第一层主画布上
                    previewCtx.fillStyle = previewCtx.createPattern(canvas, 'repeat');

                    // 绘制 '填充' 的矩形
                    previewCtx.fillRect(0, 0, preview.width, preview.height);

                    // 返回之前保存过的路径状态和属性
                    previewCtx.restore();

                };

            },
            index (data) {
                this.snapshots = data;
            },
            downscale (img) {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = Math.ceil(img.width / 2);
                canvas.height = Math.ceil(img.height / 2);
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height); // 剪切图像，并在画布上定位被剪切的部分
                return canvas;
            },

            /** 操作层 canvas **/
            // 寻找事件
            focus (e) {
                this.target = this.imageAt(e.clientX, e.clientY);
                this.clear();
                if (this.target) {
                    this.highlight(this.target.image, this.target.offsetX, this.target.offsetY);
                    this.bgpCanvasOverlayTarget = true;
                } else {
                    this.bgpCanvasOverlayTarget = false;
                }
            },
            offsetCanvas () {
                this.offset = $(this.$refs.canvasTwo).offset();
            },
            highlight (params, offsetX, offsetY) {
                let canvas = this.$refs.canvasTwo,
                    ctx = canvas.getContext('2d');

                let img = params._clr && params._clr();
                ctx.save();

                /* ------- draw image ------- */
                // 重新映射画布上的 (0,0) 位置
                ctx.translate(
                    Math.round((offsetX * this.pattern.width + params.left) * this.pattern.scale + img.width/2),
                    Math.round((offsetY * this.pattern.height + params.top) * this.pattern.scale + img.height/2)
                );

                // 缩放画布
                ctx.scale(params.scale, params.scale);

                // 旋转画布 -> 参数: 旋转角度，以弧度计。
                ctx.rotate(params.rotate * Math.PI / 180);

                // 在画布上定位图像，并规定图像的宽度和高度
                ctx.drawImage(
                    img,
                    -img.width/2,
                    -img.height/2,
                    img.width,
                    img.height
                );

                // 返回保存之前的状态
                ctx.restore();

                /* ------- colorize ------- */

                ctx.save();
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = this.rgbaFilter([0, 0, 0, 0.5]);
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            },
            imageAt (x, y) {

                x -= Math.round(this.offset.left);
                y -= Math.round(this.offset.top);

                var image, bounds, loc, dist,
                    count = this.pattern.images.length,
                    width = Math.round(this.pattern.width * this.pattern.scale),
                    height = Math.round(this.pattern.height * this.pattern.scale),
                    offsetX = Math.floor(x / width),
                    offsetY = Math.floor(y / height),
                    locations = [[0, 0], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];

                x %= width;
                y %= height;


                // TODO x,y是相对于P0(x,y)的坐标, 应该获取 canvasTwo 的位置
                // 循环条件
                while (!image && count) {
                    if (!this.colorEq(this.colorAt(x, y, count), this.colorAt(x, y, count - 1))) {
                        image = this.pattern.images[count - 1];
                    }
                    count--;
                }

                while (image && locations.length) {
                    // 单个图片的 长宽一半的第三边, 以及中心位置
                    bounds = this.getBounds(image);
                    loc = locations.shift();
                    dist = this.distance(bounds.cx + width * loc[0], bounds.cy + height * loc[1], x, y);

                    if (dist < bounds.radius) {
                        return {
                            image: image,
                            offsetX: offsetX + loc[0],
                            offsetY: offsetY + loc[1]
                        };
                    }
                }

                return null;
            },
            colorAt (x, y, i) {
                var pos = (this.snapshots[i].width * y + x) * 4;
                return [
                    this.snapshots[i].data[pos],
                    this.snapshots[i].data[pos + 1],
                    this.snapshots[i].data[pos + 2],
                    this.snapshots[i].data[pos + 3]
                ];
            },
            colorEq (a, b) {
                return (
                    a[0] === b[0] &&
                    a[1] === b[1] &&
                    a[2] === b[2] &&
                    a[3] === b[3]
                );
            },
            distance (x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            },
            getBounds (image) {
                var img = image._clr(),
                    scale = 1,
                    width = img.width * scale,
                    height = img.height * scale,
                    radius = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)) * image.scale;

                return {
                    cx: Math.round(image.left * this.pattern.scale + width / 2),
                    cy: Math.round(image.top * this.pattern.scale + height / 2),
                    radius: radius
                };
            },
            clear () {
                let canvas = this.$refs.canvasTwo,
                    ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.rgbaFilter([255, 255, 255, 0]);
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },

            // 选择事件
            select () {
                if (this.target) {
                    this.onFocus({
                        target: {
                            image: this.target.image,
                            offsetX: this.target.offsetX,
                            offsetY: this.target.offsetY
                        }
                    });
                } else {
                    this.pattern._focused = null;
                }
            },
            onFocus (target) {
                this.pattern._focused = target
            },

            /** 操作盒子 **/
            bgpTransformBox () {
                let target = this.pattern._focused;

                if (target) {
                    target = target.target;
                    let image = target.image,
                        bounds = this.getBounds(image),
                        angle = image.rotate * Math.PI / 180;

                    this.elCss = {
                        left:  target.offsetX * this.pattern.width * this.pattern.scale + bounds.cx + 'px',
                        top: target.offsetY * this.pattern.height * this.pattern.scale + bounds.cy + 'px'
                    }

                    this.elCircleCss = {
                        left: -bounds.radius + 'px',
                        top: -bounds.radius + 'px',
                        width: 2 * bounds.radius + 'px',
                        height: 2 * bounds.radius + 'px',
                        borderColor: this.rgbaFilter(image.color)
                    };

                    this.elHandleCss = {
                        left: Math.cos(angle) * bounds.radius - 12 + 'px',
                        top: Math.sin(angle) * bounds.radius - 12 + 'px',
                        borderColor: this.rgbaFilter(image.color)
                    }
                }
            },

            onBeforeStart (e) {
                if (e.which !== 1 && e.which !== 0) {
                    return;
                }

                this.elTarget = e.target.className;

                this.onStart(e);
            },
            onStart (e) {
                this.draggingClass = true;

                smx = e.clientX || e.touches[0].clientX;
                smy = e.clientY || e.touches[0].clientY;

                var draggable = {
                    element: e.target,
                    phase: 'start',
                    data: null, // todo 应该是 getData(scope)
                    x: smx,
                    y: smy,
                    alt: e.altKey
                };

                this.clear();

                $(document).on('mousemove', this.onMove).one('mouseup', this.onEnd);

                this.elTarget === 'bgp-tbox-rs'
                    ? this.onHandleDrag(draggable)
                    : this.onDrag(draggable);

            },
            onMove (e) {
                e.preventDefault();
                e.stopPropagation();

                this.clear();

                // lmx 鼠标相对于窗口的位置
                // smx 鼠标按下位置
                lmx = e.clientX || 0;
                lmy = e.clientY || 0;

                let draggable = {
                    element: e.target,
                    phase: 'move',
                    data: null, // todo 应该是getData(scope)
                    x: lmx,
                    y: lmy,
                    dx: lmx - smx,
                    dy: lmy - smy,
                    alt: e.altKey
                };

                this.elTarget === 'bgp-tbox-rs'
                    ? this.onHandleDrag(draggable)
                    : this.onDrag(draggable);
            },
            onEnd (e) {
                e.preventDefault();
                e.stopPropagation();

                this.draggingClass = false;

                $(document).off('mousemove', this.onMove);

                lmx = e.clientX || (e.touches.length && e.touches[0].clientX) || 0;
                lmy = e.clientY || (e.touches.length && e.touches[0].clientY) || 0;


                let draggable = {
                    element: e.target,
                    phase: 'end',
                    data: null, // todo 应该是 getData(scope)
                    x: lmx,
                    y: lmy,
                    dx: lmx - smx,
                    dy: lmy - smy,
                    alt: e.altKey
                };

                this.elTarget === 'bgp-tbox-rs'
                    ? this.onHandleDrag(draggable)
                    : this.onDrag(draggable);
            },

            // 移动框框
            onDrag (draggable) {
                let target = this.pattern._focused;
                target = target.target;
                if (draggable.phase === 'start') {
                    if (draggable.alt) { // clone the target
                        var image = this.$com.mix(true, {}, target.image),
                            pos = this.pattern.images.indexOf(target.image);
                        this.pattern.images.splice(pos, 0, image);
                    }

                    startPos = {
                        left: target.image.left,
                        top: target.image.top
                    };

                }

                if (draggable.phase === 'move') {
                    target.image.left = startPos.left + draggable.dx;
                    target.image.top = startPos.top + draggable.dy;
                }

                if(draggable.phase === 'end'){
                    // TODO 重置花型在九宫格中的坐标
                    // TODO fix 花型拖拽出九宫格 无法选中的bug
                    target.image.left = target.image.left%(this.pattern.width * this.pattern.scale);
                    target.image.top = target.image.top%(this.pattern.height * this.pattern.scale);
                }
            },

            // 旋转框框
            onHandleDrag (draggable) {
                let target = this.pattern._focused;
                target = target.target;

                let el = $(this.$refs.bgpTransformBox);
                let elHandle = $(this.$refs.elHandle);

                if (draggable.phase === 'start') {
                    center = el.offset();

                    startTrsn = this.local(draggable);
                    startTrsn.hx = parseFloat(elHandle.css('left'));
                    startTrsn.hy = parseFloat(elHandle.css('top'));

                    sScale = target.image.scale;

                }
                else if (draggable.phase === 'move') {
                    draggable = this.local(draggable);
                    let hx = startTrsn.hx + draggable.dx,
                        hy = startTrsn.hy + draggable.dy,
                        radius = Math.sqrt(Math.pow(hx + 12, 2) + Math.pow(hy + 12, 2));


                    this.elHandleCss = {
                        left: hx + 'px',
                        top: hy + 'px'
                    }

                    var rStart = Math.sqrt(Math.pow(startTrsn.y, 2) + Math.pow(startTrsn.x, 2)),
                        rCurr = Math.sqrt(Math.pow(draggable.y, 2) + Math.pow(draggable.x, 2));

                    dScale = rCurr / rStart;

                    this.elCircleCss = {
                        left: -radius + 'px',
                        top: -radius + 'px',
                        width: 2 * radius + 'px',
                        height: 2 * radius + 'px'
                    }

                    target.image.scale = sScale * dScale;
                    target.image.rotate = Math.atan2(draggable.y, draggable.x) *
                        180 / Math.PI +
                        (draggable.y < 0 ? 360 : 0);
                }
            },
            local (obj) {
                obj.x = obj.x - center.left;
                obj.y = obj.y - center.top;
                return obj;
            },
        },

        mounted () {
            this.offsetCanvas();
        },

        watch: {
            'pattern': {
                handler (cur) {
                    let bool = cur.images.some(x => {
                        return !x.complete;
                    });
                    if (!bool) {
                        this.postLink()();
                    }
                    this.bgpTransformBox();
                },
                deep: true
            }
        }

    }

</script>

<style
    lang="less"
    type="text/less"
    rel="stylesheet/less"
    scoped
>
    .bgp-pattern {
        position: relative;

        .bgp-image {
            position: absolute;
            left: 0;
            top: 0;
            visibility: hidden;
        }

        .bgp-canvas-preview, .bgp-canvas-overlay {
            position: absolute;
            left: 0;
            top: 0;
        }

        .bgp-canvas-overlay-target {
            cursor: pointer;
        }

        .bgp-transform-box {
            position: absolute;
            left: 0;
            top: 0;
            width: 1px;
            height: 1px;

            &:before {
                content: "";
                position: absolute;
                top: 0;
                left: -5px;
                border-top: 1px solid #000;
                width: 11px;
                height: 1px;
            }

            &:after {
                content: "";
                position: absolute;
                top: -5px;
                left: 0;
                border-left: 1px solid #000;
                width: 1px;
                height: 11px
            }

            .bgp-tbox-cr {
                position: absolute;
                left: 0;
                top: 0;
                display: block;
                border-radius: 50%;
                box-shadow: inset 0 0 1px 1px rgba(255, 255, 255, 0.7), 0 0 1px 1px rgba(0, 0, 0, 0.4);
                cursor: move;

                &.dragging {
                    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.5), 0 0 0 5px rgba(255, 255, 255, 0.5);
                }

            }

            .bgp-tbox-rs {
                position: absolute;
                display: block;
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 50%;
                box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.5);
                cursor: move;

                &:hover {
                    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.5), 0 0 0 5px rgba(255, 255, 255, 0.5);
                }

            }

        }

    }



</style>
