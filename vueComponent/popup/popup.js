/**
 * Created by jbx on 2018/3/19.
 */
import Vue from 'vue'
import popup from './popup.vue'

// popup 实例
let instance;

let PopupConstructor = Vue.extend(popup);

let initInstance = () => {
    instance = new PopupConstructor({
        el: document.createElement('div')
    });

    document.body.appendChild(instance.$el);
}


let Popup = (obj) => {

    initInstance();

    instance.mask = true;

    instance.title = obj.title || '提示信息';

    instance.content = obj.content || '';

    instance.titleStlye = obj.titleStlye || {width: '300px', height: '142px'};

    instance.popupBodyStyle = obj.popupBodyStyle || {textAlign: 'center', lineHeight: '35px'};

    instance.okHandler = () => {
        instance.mask = false;
        obj.okHandler && obj.okHandler(instance);
    };

    instance.cancelHandler = () => {
        instance.mask = false;
        obj.cancelHandler && obj.cancelHandler(instance);
    };
}


export default Popup
