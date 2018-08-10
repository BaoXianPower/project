
<template>

    <div class="mask-popup"
         v-if="mask">

        <div class="popup" :style="titleStlye">

            <div class="popup-head clearfix">
                <span class="fl">{{title}}</span>
                <span class="iconfont icon-guanbi fr"
                      @click="cancelHandler"></span>
            </div>

            <div class="popup-body"
                :style="popupBodyStyle">
                {{content}}
            </div>

            <!-- 保存 -->
            <div class="popup-foot">
                <span class="new-btn-delete mg-r10"
                      @click="cancelHandler">取消</span>
                <span class="new-btn-save"
                      @click="okHandler">确定</span>
            </div>

        </div>

    </div>

</template>

<script type="text/ecmascript-6">
    export default {

        data () {
            return {
                popupBodyStyle: null,
                titleStlye: null,
                mask: false,
                title: '',
                content: ''
            }
        },

        methods: {
            cancelHandler () {
            },
            okHandler () {

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

</style>
