<template>

    <div
        class="toast-mask"
        v-if="is_show">

        <div class="toast-content">
            {{content}}
        </div>

    </div>

</template>

<script type="text/ecmascript-6">

    export default {
        data () {
            return {
                is_show: false,
                duration: 1500, //停留的时间
                content: "",  //显示的内容
                callback: null
            }
        }
    }

</script>

<style
    lang="less"
    type="text/less"
    rel="stylesheet/less"
>
    .toast-mask {
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99999;
        background-color: rgba(0, 0, 0, .2);
        .toast-content {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            line-height: 50px;
            padding: 0 30px;
            background-color: #fff;
            color: #000000;
            border-radius: 5px;
        }
    }

</style>
