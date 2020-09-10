<template lang="pug">
div
    //- 海域遊憩活動一站式資訊平臺
    div(style="margin-bottom:1rem;" v-if="!isMobile")
        strong(style="white-space: nowrap;font-size:1.2rem;color:#fff;text-shadow: 2px 2px 9px rgba(0,0,0,1);") 海域遊憩活動一站式資訊平臺
        
    .col(:class="{'col--mobile':isMobile}")
        el-button(
            @click="$parent.$emit('openDrawer','相關連結')" 
            title="相關連結"
            size="mini"
            circle
            style="box-shadow: 0 0 4px 2px rgba(0, 0, 0, .25);margin:0 0 0.5rem 0;"
        )
            strong(v-if="!isMobile" style="color:#fff;position:absolute;right:130%;text-shadow: 2px 2px 9px rgba(0,0,0,1);") 相關連結
            div
                font-awesome-icon(icon="link" fixed-width)
        el-button(
            @click="$parent.$emit('openDrawer','活動申請')" 
            title="活動申請"
            size="mini"
            circle
            style="box-shadow: 0 0 4px 2px rgba(0, 0, 0, .25);margin:0 0 0.5rem 0;"
        )
            strong(v-if="!isMobile" style="color:#fff;position:absolute;right:130%;text-shadow: 2px 2px 9px rgba(0,0,0,1);") 活動申請
            div
                font-awesome-icon(icon="concierge-bell" fixed-width)
        el-button(
            @click="$parent.$emit('openDrawer','使用條約')" 
            title="使用條約"
            size="mini"
            circle
            style="box-shadow: 0 0 4px 2px rgba(0, 0, 0, .25);margin:0 0 0.5rem 0;"
        )
            strong(v-if="!isMobile" style="color:#fff;position:absolute;right:130%;text-shadow: 2px 2px 9px rgba(0,0,0,1);") 使用條約
            div
                font-awesome-icon(icon="info" fixed-width)
        el-button(
            v-if="isAndroid||isIOS"
            @click="openAddToHomeScreen" 
            title="安裝說明"
            size="mini"
            circle
            style="box-shadow: 0 0 4px 2px rgba(0, 0, 0, .25);margin:0 0 0.5rem 0;"
        )
            strong(v-if="!isMobile" style="color:#fff;position:absolute;right:130%;text-shadow: 2px 2px 9px rgba(0,0,0,1);") 安裝說明
            div
                font-awesome-icon(icon="mobile-alt" fixed-width)
        el-button(
            @click="$openLink('https://docs.google.com/forms/d/e/1FAIpQLScf7at41snW4-ZczKN3p2hR8M9VKj_Af82BWEsZg6uPfwnY3Q/viewform')" 
            title="意見回饋"
            size="mini"
            circle
            style="box-shadow: 0 0 4px 2px rgba(0, 0, 0, .25);margin:0 0 0.5rem 0;"
        )
            strong(v-if="!isMobile" style="color:#fff;position:absolute;right:130%;text-shadow: 2px 2px 9px rgba(0,0,0,1);") 意見回饋
            div
                font-awesome-icon(icon="envelope" fixed-width)
        
        //- 海象/海情
        layerWeather(style="margin:0 0 0.5rem 0;")

</template>

<script>

import layerWeather from "@/components/layer/layerWeather"
import {mapGetters} from 'vuex'

export default {
    name:"navbar",
    components:{
        layerWeather
    },
    computed:{
        ...mapGetters({
            isAndroid:"common/common/isAndroid",
            isIOS:"common/common/isIOS",
            isMobile:"common/common/isMobile"
        })
    },
    data:()=>({
    }),
    methods:{
		openAddToHomeScreen(){
            localStorage.setItem("neverShowAddToScreen", false)
			this.$parent.$emit('openDialog','加至主畫面說明')
        },
    }
}
</script>

<style lang="scss" scoped>
.col{
    position:absolute;right:0;position: absolute;right: 0px;display: flex;flex-direction: column;
    &--mobile{
        flex-flow: column-reverse;
    }
}
</style>