/**
 * Created by jbx on 2018/5/11.
 */
import $ from 'jquery'

function Move (colHeight, collision) {

    this.colHeight = colHeight;

    this.collision = collision;

    this.mouseDowntime = 0;

    this.smPos = {smx: null, smy: null};

    this.lmPos = {lmx: null, lmy: null};

    this.startPos = {left: null, top: null};

    this.fixOffsetTop = 0;

    this.dragOption = null;

    this.target = null;

    this.curentItem = null;

    // 方法
    this.onStart = (obj, dragObj) => {
        let draggable;

        this.fixOffsetTop = 0;
        this.mouseDowntime = new Date().getTime();
        this.target = obj.target;
        this.curentItem = obj.item;
        this.dragOption = dragObj;
        this.smPos = {
            smx: obj.e.clientX || 0,
            smy: obj.e.clientY || 0
        };

        draggable = {
            target: obj.target,
            item: obj.item,
            phase: 'start',
            x: this.smPos.smx,
            y:  this.smPos.smy
        };

        $(document).on('mousemove', this.onMove).one('mouseup', this.onEnd);

        this.onDrag(draggable);

    }

    this.onMove = (e) => {
        let draggable;

        this.lmPos = {
            lmx: e.clientX || 0,
            lmy: e.clientY || 0
        };

        draggable = {
            target: this.target,
            item: this.curentItem,
            phase: 'move',
            x: this.lmPos.lmx,
            y: this.lmPos.lmy,
            realDy:Number(this.lmPos.lmy) - Number(this.smPos.smy),
            dx: Number(this.lmPos.lmx) - Number(this.smPos.smx),
            dy: Number(this.lmPos.lmy) - Number(this.smPos.smy) + Number(this.fixOffsetTop)
        };

        this.onDrag(draggable);
    }

    this.onEnd = (e) => {
        e.preventDefault();

        $(document).off('mousemove', this.onMove);

        let time;
        // let draggable = {item: this.curentItem, phase: 'end'};
        let draggable = {item: this.curentItem, phase: 'end',
            x: this.lmPos.lmx,
            y: this.lmPos.lmy,
            realDy:Number(this.lmPos.lmy) - Number(this.smPos.smy),
            dx: Number(this.lmPos.lmx) - Number(this.smPos.smx),
            dy: Number(this.lmPos.lmy) - Number(this.smPos.smy) + Number(this.fixOffsetTop)
        };
        time = new Date() - this.mouseDowntime;

        time > 100
            ? this.onDrag(draggable)
            : this.dragOption.endEles && this.dragOption.endEles();

        this.destroy();
    };

    this.onDrag = (draggable) => {
        let target = draggable.target;

        if (draggable.phase === 'start') {
            this.startPos = {
                left: target.position().left,
                top: target.position().top
            };
            this.dragOption.onDragStart && this.dragOption.onDragStart(this.curentItem);
        }

        if (draggable.phase === 'move') {
            this.curentItem.left = this.startPos.left + draggable.dx;
            this.curentItem.top = this.startPos.top + draggable.dy;
            // let jumpMachineNum = this.judgeMachine(this.startPos.top + this.collision, draggable.realDy);
            let jumpMachineNum = this.judgeMachineByEnd(this.startPos.top + this.collision, draggable.dy);
            // let jumpMachineNum = 0;

            this.dragOption.onDragMove && this.dragOption.onDragMove(this.curentItem, (temp) => {
                this.curentItem = temp;
            },jumpMachineNum);
        }

        if (draggable.phase === 'end') {
            this.curentItem.left = this.startPos.left + draggable.dx;
            this.curentItem.top = this.startPos.top + draggable.dy;
            // let jumpMachineNum = this.judgeMachine(this.startPos.top + this.collision, draggable.realDy);
            let jumpMachineNum = this.judgeMachineByEnd(this.startPos.top + this.collision, draggable.dy);

            this.dragOption.onDragEnd && this.dragOption.onDragEnd(jumpMachineNum);
        }
    };

    this.judgeMachine = (startY, shiftY) => {
        let cp = startY + shiftY, n = 0;
        if(cp <= 0){
            n = Math.ceil(Math.abs(cp) / this.colHeight);
        } else if(cp >= this.colHeight + this.collision){  // todo cp >= 140
            // n = Math.ceil(Math.abs(cp- collision) / colHeight);
            n = Math.ceil(Math.abs(cp- this.colHeight) / this.colHeight);
        } else{
            n = 0;
        }
        n = cp > 0 ? n : -n;

        this.fixOffsetTop = -n * this.colHeight;

        return n;
    };
    this.judgeMachineByEnd = (startY, shiftY) => {
        let cp = startY + shiftY, n = 0;
        if(cp <= 0){
            n = Math.ceil(Math.abs(cp) / this.colHeight);
        } else if(cp >= this.colHeight + this.collision){  // todo cp >= 140
            // n = Math.ceil(Math.abs(cp- collision) / colHeight);
            n = Math.ceil(Math.abs(cp- this.colHeight) / this.colHeight);
        } else{
            n = 0;
        }
        n = cp > 0 ? n : -n;

        // this.fixOffsetTop = -n * this.colHeight;

        return n;
    };

    this.destroy = () => {
        Move = null;
    }

}

export default Move;
