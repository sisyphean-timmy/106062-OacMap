<template lang="pug">
div
    strong(style="margin-bottom:1rem;display:block;font-size:1.2rem;white-space:nowrap;color:rgb(255 255 255);text-shadow:rgb(0 0 0) 1px 1px 1px;") 海域遊憩活動一站式資訊平臺

    transition-group(name="slide-fade-up" tag="div" class="tool")
        el-button(
            :title="activedLyr?activedLyr.title:'海情海象資訊'"
            :type="activedLyr?'primary':''"
            key="海情/海象資訊"
            @click="$openDrawer('海情/海象資訊')"
            circle
        )
            .tool__btn
                strong.tool__label.tool__label--actived(v-if="activedLyr") {{activedLyr.title}}
                strong.tool__label(v-else) 海情海象資訊
                font-awesome-icon(:icon="activedLyr?activedLyr.icon:'bars'" fixed-width)
        
        template(v-if="!isMobile||collapse")
            el-button(
                @click="$openDrawer('相關連結')" 
                key="相關連結"
                title="相關連結"
                circle
            )
                .tool__btn
                    strong.tool__label 相關連結
                    font-awesome-icon(icon="link" fixed-width)

            el-button(
                @click="$openDrawer('活動申請')" 
                key="活動申請"
                title="活動申請"
                circle
            )
                .tool__btn
                    strong.tool__label 活動申請
                    font-awesome-icon(icon="concierge-bell" fixed-width)

            el-button(
                @click="$openDrawer('使用條約')" 
                key="使用條約"
                title="使用條約"
                circle
            )
                .tool__btn
                    strong.tool__label 使用條約
                    font-awesome-icon(icon="info" fixed-width)

            el-button(
                v-if="isAndroid||isIOS"
                @click="openAddToHomeScreen" 
                key="安裝說明"
                title="安裝說明"
                circle
            )
                .tool__btn
                    strong.tool__label 安裝說明
                    font-awesome-icon(icon="mobile-alt" fixed-width)

            el-button(
                @click="$openLink('https://docs.google.com/forms/d/e/1FAIpQLScf7at41snW4-ZczKN3p2hR8M9VKj_Af82BWEsZg6uPfwnY3Q/viewform')" 
                key="意見回饋"
                title="意見回饋"
                circle
            )
                .tool__btn
                    strong.tool__label 意見回饋
                    font-awesome-icon(icon="envelope" fixed-width)
        el-button(
            v-if="isMobile"
            @click="collapse=!collapse" 
            style="color:#fff;"
            key="collapse"
            type="text"
        )
            font-awesome-icon(:icon="collapse?'chevron-up':'chevron-down'" fixed-width)

</template>

<script>

import { mapGetters, mapMutations } from 'vuex'

const ICON_ENUM = {
    "風":"wind",
    "海":"water",
    "船":"ship",
    "波浪":"wave-square",
    "溫度":"thermometer-quarter",
    "高度":"ruler-vertical",
    "風險|潛勢":"exclamation-triangle",
    "鹽度":"tachometer-alt"
}

export default {
    name:"toolTopRight",
	data:()=>({
        collapse:false
	}),
	props:{
	},
	components:{
    },
	computed:{
		...mapGetters({
			layerState:"layer/layer/state",
            weatherLayer:"layer/layer/weatherLayer",
			isAndroid:"common/common/isAndroid",
			isIOS:"common/common/isIOS",
			isMobile:"common/common/isMobile"
        }),
        normalWLyr(){
            // 增加圖示
            return this.weatherLayer.map(l=>{
                let icon = "cloud-sun-rain"
                Object.keys(ICON_ENUM).forEach(k=>{
                    if(new RegExp(k,"g").test(l.title)){
                        icon = ICON_ENUM[k]
                    }
                })
                return {...l,...{icon}}
            })
        },
        activedLyr(){
            const {id} = this.layerState('activedWeatherLyr')
            return this.normalWLyr.find(l=>l.id === id)
        },
	},
	methods:{
		// ...mapMutations({
        // }),
        openAddToHomeScreen(){
			localStorage.setItem("neverShowAddToScreen", false)
			this.$openDialog('加至主畫面說明')
		}
	}
}
</script>

<style lang="scss" scoped >


    @mixin activeStyle{
        color:#fff;
        background: $primary;
        text-shadow: none;
        transition: 0.2s ease all;
        max-width: 200px;
    }

	.tool{
        
        background:rgba(0,0,0,0.5);
        border-radius:2rem;
        position: absolute;
        right: 0;
        left: auto;
        
		display:flex;
        flex-direction:column;        
        width: 1.5rem;
        align-items: center;
        justify-content: center;
        
        &>*{
            padding: 0.5rem !important;
            margin: 0 !important;
            &:not(:nth-last-of-type(1)){
                box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
                margin-bottom: 0.5rem !important;
            }
		}
        &__btn{
            display: flex;
			align-items: center;
			justify-content: center;
			width:1rem;
			height:1rem;
            &:hover{
                .tool__label{
                    @include activeStyle;
                    visibility: visible;    
                }
            }
            &--unfocus{
                opacity: 0.7;
                .tool__label{
                    visibility: hidden;    
                }
            }
        }
        
        &__label{
            color: darken($info, 30);
            background: lighten($info,20);
            position: absolute;
            right: 150%;
            padding: 0.25rem 0.5rem;
            border-radius: 1rem;
            box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
            font-size: 0.8rem;
            &--actived {
                @include activeStyle;
            }
        }
	}

</style>
