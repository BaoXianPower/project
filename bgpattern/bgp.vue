<template>

    <div class="bg-pattern">

        <button class="mg-r20" @click="add">增加</button>
        <button class="mg-r20" @click="sub">减少</button>
        <button @click="change">改变</button>

        <bgcpattern
            v-model="patternList"
            :rotateFlag="false"
        ></bgcpattern>

    </div>

</template>

<script type="text/ecmascript-6">

    import bgcpattern from './bgcpattern.vue'

    export default {

        components: { bgcpattern },

        data () {
            return {
                patternList: {
                    _focused: null,
                    color: [89, 89, 89, 1],
                    scale: 1,
                    width: 500,
                    height: 800,
                    images: [
                        {
                            _clr: null,
                            left: 0,
                            top: 0,
                            rotate:0,
                            scale: 1,
                            width: 120,
                            height: 194,
                            url: '/static/party/party-6.png',
                            complete: false
                        },
                    ]
                },

                list: [

                    {
                        _clr: null,
                        left: -100,
                        top: 300,
                        rotate: 0,
                        width: 200,
                        height: 301,
                        scale:1,
                        url: '/static/party/party-2.png',
                        complete: false
                    }
                ]
            }
        },

        methods: {
            add () {
                let item = this.$com.mix(true, {}, this.list[0]);
                this.patternList.images.push(item);
            },

            sub () {
                this.patternList.images.splice(this.patternList.images.length - 1, 1)
            },

            change () {
                this.patternList.color = this.$com.mix(true, [], [120, 120, 120, .3]);
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
    .bg-pattern {
        width: 520px;
        height: 820px;
        border: 1px solid #CCCCCC;
        margin: 50px auto;
    }

</style>
