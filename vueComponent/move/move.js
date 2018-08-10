/**
 * Created by jbx on 2018/6/23.
 */

class MoveHandler {

    constructor ($, target, callbackObj) {

        this.$ = $;

        this.smPos = {smx: null, smy: null};

        this.lmPos = {lmx: null, lmy: null};

        this.target = target;

        this.startPos = {left: null, top: null};

        this.callbackObj = callbackObj;

        this._onMove = onMove.bind(this);

        this._onEnd = onEnd.bind(this);
    }

    onStart (e) {
        // 开始按下位置
        this.smPos = {
            smx: e.clientX || 0,
            smy: e.clientY || 0
        };

        let draggable = {
            target: this.target,
            phase: 'start',
            event: e,
            x: this.smPos.smx,
            y: this.smPos.smy
        };

        // 利用 bind 将 指向 document 的 this 改为 指向类的实例
        // 但是 事件还是 移除不了 原因就是 this.bind() 每次调用 都会返回一个新的函数
        // this.$(document).on('mousemove', this.onMove.bind(this)).one('mouseup', this.onEnd.bind(this));

        this.$(document).on('mousemove', this._onMove).one('mouseup', this._onEnd);

        this.onDrag(draggable, this);
    }

    onDrag (draggable, that) {

        if (draggable.phase === 'start') {
            this.callbackObj.startHandler && this.callbackObj.startHandler(draggable, that);
        }

        if (draggable.phase === 'move') {
            this.callbackObj.moveHandler && this.callbackObj.moveHandler(draggable, that);
        }

        if (draggable.phase === 'end') {
            this.callbackObj.endHandler && this.callbackObj.endHandler(draggable, that);
        }

    }

    destroy () {
        MoveHandler = null;
    }
}

function onMove (e) {
    e.preventDefault();

    // 这里的 this 本该指向了绑定事件的 document
    // 当前位置
    this.lmPos = {
        lmx: e.clientX || 0,
        lmy: e.clientY || 0
    };

    let draggable = {
        target: this.target,
        phase: 'move',
        event: e,
        x: this.lmPos.lmx,
        y: this.lmPos.lmy,
        dx: Number(this.lmPos.lmx) - Number(this.smPos.smx),
        dy: Number(this.lmPos.lmy) - Number(this.smPos.smy)
    };

    this.onDrag(draggable, this);
}

function onEnd (e) {
    e.preventDefault();

    // 再次改变 this 的 指向
    this.$(document).off('mousemove', this._onMove);

    let draggable = {
        target: this.target,
        phase: 'end',
        event: e,
        x: this.lmPos.lmx,
        y: this.lmPos.lmy,
        dx: Number(this.lmPos.lmx) - Number(this.smPos.smx),
        dy: Number(this.lmPos.lmy) - Number(this.smPos.smy)
    };

    this.onDrag(draggable, this);
}

export default MoveHandler;
