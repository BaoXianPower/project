/**
 * Created by jbx on 2018/3/7.
 */
import Vue from 'vue'
import toast from './toast.vue'

// 标记
let showing = false;

// toast构造函数
let ToastConstructor = Vue.extend(toast)

let initInstace = () => {
    let instanceCase = new ToastConstructor({
        el: document.createElement('div')
    })

    document.body.appendChild(instanceCase.$el);

    return instanceCase;
}

// TODO 解决 实例创建多次的 bug
// 显示
let Toast = (content, callback, duration = 1500) => {

    if (!showing) {
        let instance = initInstace();
        instance.is_show = true;
        instance.content = content;
        instance.duration = duration;
        instance.callback = callback || null;

        setTimeout(() => {
            showing = false;
            instance.is_show = false;

            callback && instance.callback();

        }, instance.duration)
    }
}

export default Toast
