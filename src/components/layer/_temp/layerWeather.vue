<template lang="pug">

div(:class="isMobile?'layerWeather--mobile':'layerWeather'")
    .col(v-if="!isMobile")
        el-button.layerWeather__btn(
            @click="SET_WINDY_OPTION({visible:true})"
            size="mini"
            circle
        )
            strong.layerWeather__label(style="position:absolute;right:130%;") Windy 地圖
            div
                img(src="@/assets/windy_icon.png" style="max-width:1rem;")
        el-button.layerWeather__btn(
            @click="$openLink('https://safesee.cwb.gov.tw/V2/')"
            size="mini"
            circle
        )
            strong.layerWeather__label(style="position:absolute;right:130%;") 台灣海象災防平台
            div
                img(src="@/assets/safesee.png" style="max-width:1rem;")
    
    //- mobile only show actived
    div(v-if="isMobile||xsStyle")
        //- Exsist actived layer condition
        el-button.layerWeather__btn(
            v-if="activedLyr"
            :title="activedLyr.title"
            type="primary"
            @click="$.openDrawer('海情/海象資訊')"
            circle
        )
            div(style="display: flex;align-items: center;")
                strong.layerWeather__label.layerWeather__label--actived {{activedLyr.title}}
                font-awesome-icon(:icon="activedLyr.icon" fixed-width)
        el-button.layerWeather__btn(
            v-else
            title="海情海象資訊"
            @click="$.openDrawer('海情/海象資訊')"
            circle
        )   
            div(style="display: flex;align-items: center;")
                strong.layerWeather__label 海情海象資訊
                font-awesome-icon(icon="cloud" fixed-width)

    //- Dektop list all (contains all group)
    .col(v-else ref="desktopCol")
        el-button.layerWeather__btn(
            v-for="lyr in normalWLyrInGroupModel"
            @click="openNormalLyr(lyr.id)"
            :key="lyr.title"
            :title="lyr.title"
            :type="activedLyr && activedLyr.id === lyr.id?'primary':''"
            size="mini"
            circle
        )
            div(style="display: flex;align-items: center;")
                transition(name="fade")
                    strong.layerWeather__label(
                        :class="{'layerWeather__label--actived': activedLyr && activedLyr.id === lyr.id}"
                    )
                        template(v-if="loadingLayerId===lyr.id")
                            i.el-icon-loading
                            |   載入中
                        template(v-else)
                            | {{lyr.title}}
                font-awesome-icon(:icon="lyr.icon" fixed-width)

    //- others
    .col(v-if="!isMobile")
        el-button(
            style="margin: 0 0 0.5rem 0;color: #fff;"
            title="詳細資料"
            size="mini"
            circle
            type="text"
            @click="$.openDrawer('海情/海象資訊')"
        )
            div
                font-awesome-icon(icon="bars" fixed-width )

</template>

<script>

import { mapGetters, mapMutations } from 'vuex'

const DUMMY_LEGEND = require("@/assets/legend")
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
    name:"layerWeather",
	data:()=>({
        activedGroupName:"",
        loadingLayerId:"",
        xsStyle:false
	}),
	props:{
	},
	components:{
    },
    watch:{
        "screenHeight":{
            handler(h){ //!TODO : better
                const a = this.$refs.desktopCol ? this.$refs.desktopCol.clientHeight : 0
                console.log("screenHeight",h)
                console.log("dom height",a)
                this.xsStyle = h<500 || h<a+100
            }
        }
    },
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			commonState:"common/common/state",
			layerState:"layer/layer/state",
			weatherLayer:"layer/layer/weatherLayer"
        }),
        screenHeight(){
            return this.commonState('screenHeight')
        },
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
        normalWLyrInGroupModel(){
            let result = []
            this.normalWLyrGroupModel.forEach(g=>{
                result.splice(result.length-1,0,...g.data)
            })
            return result
        },
        normalWLyrGroupModel(){
            const lyrs = this.normalWLyr
            return [
                {
                    name:"海象",
                    icon:"wave-square",
                    data:lyrs.filter(i=>/OCM模式|臺灣海域預報/g.test(i.title))
                },
                {
                    name:"氣象",
                    icon:"cloud",
                    data:lyrs.filter(i=>/10米風資料_WIFI/g.test(i.title))
                }
            ]
        },
        // normalWLyrGroupModel(){
        //     const lyrs = this.normalWLyr
        //     return [
        //         {
        //             name:"",
        //             data: lyrs.filter(i=>!(/OCM|巡防艇|巡護船|交通船|海域預報|海域預報|異常波浪|動力小船/g.test(i.title)))
        //         },
        //         {
        //             name:"OCM 預報",
        //             icon:"tachometer-alt",
        //             data: lyrs.filter(i=>/OCM/g.test(i.title))
        //         },
        //         {
        //             name:"船級作業風險",
        //             icon:"ship",
        //             data: lyrs.filter(i=>/巡防艇|巡護船|動力小船/g.test(i.title))
        //         },
        //         {
        //             name:"船級舒適度",
        //             icon:"ship",
        //             data: lyrs.filter(i=>/交通船/g.test(i.title))
        //         },
        //         {
        //             name:"波浪",
        //             icon:"wave-square",
        //             data: lyrs.filter(i=>/海域預報|異常波浪/g.test(i.title))
        //         }
        //     ]
        // }
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS",
			SET_ACTIVED_WEATHER_DATA:"layer/layer/SET_ACTIVED_WEATHER_DATA",
			SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION",
        }),
        toggleGroup(gName){
            if(this.activedGroupName === gName){
                this.closeAllNormalLyr()
                this.activedGroupName = ''
            }else{
                this.activedGroupName = gName
            }
        },
		closeAllNormalLyr(){
			this.normalWLyr.forEach(l=>{
				this.$LayerIns.setVisible(l.id,false)
				this.UPDATE_LAYER_OPTIONS({
					id:l.id,
					payload:{visible:false}
				})
				this.SET_ACTIVED_WEATHER_DATA({
					id:'',
					times:[]
				}) 
            })
		},
		async openNormalLyr(id){
			if(this.loadingLayerId) return
            try{
                
                const lyrAwaitToActive = this.$LayerIns.normalLayerCollection.find(l=>l.id === id)
                console.log("[lyrAwaitToActive Ins]",lyrAwaitToActive)
                this.loadingLayerId = lyrAwaitToActive.id

                // handle actived layer
                if(this.activedLyr && this.activedLyr.id === lyrAwaitToActive.id){// self then close all
                    this.closeAllNormalLyr()
                    this.activedGroupName = ''
                    return
                }

                // handle groupname
                const lyrAwaitToActiveInGroup = this.normalWLyrGroupModel.find(g=>g.data.some(l=>l.id === lyrAwaitToActive.id))
                this.activedGroupName = lyrAwaitToActiveInGroup?lyrAwaitToActiveInGroup.name:''

                // 更新狀態及實例
                this.normalWLyr.forEach(l=>{  
                    const visible = l.id === lyrAwaitToActive.id
                    this.$LayerIns.setVisible(l.id,visible)
                    this.UPDATE_LAYER_OPTIONS({
                        id:l.id,
                        payload:{visible}
                    })
                })

                let payload = {id}
                // 取得 legend 、保存到狀態、重設圖層實例
                const legend = DUMMY_LEGEND.find(l=> new RegExp(l.layerName,"g").test(lyrAwaitToActive.title))
                console.log("[activedWLyr legend]",legend)
                if(legend){
                    const new_legend = {
                        label:legend.label,
                        colorScaleLabel:legend.colorScaleLabel,
                        colorScaleValue:legend.colorScaleValue
                    }

                    // 重新設定 顏色尺度
                    lyrAwaitToActive.setOption({
                        minIntensity:Number(legend.colorScaleLabel[0]),
                        maxIntensity:Number(legend.colorScaleLabel[legend.colorScaleLabel.length-1]),
                        colorScale:legend.colorScaleValue
                    })

                    // legend.colorScaleLabel -> 轉成文字
                    if(legend.type==="text"){ 
                        new_legend.colorScaleLabel = legend.colorScaleLabel.map(i => legend.colorScaleLabelName[i])
                    }

                    payload.legend = new_legend
                }

                // 完全建構後提交到狀態保存
                await new Promise(res=>lyrAwaitToActive.once("loaded",()=>res()))
                payload.times = lyrAwaitToActive.times
                this.SET_ACTIVED_WEATHER_DATA(payload)
                
            }catch(e){
                console.error("openNormalLyr() "+e)
            }finally{
                this.loadingLayerId = ""
            }
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

    .col{
        display:flex;
        flex-direction:column;
    }

	.layerWeather{
        
        background:rgba(0,0,0,0.5);
        border-radius:2rem;
        position: relative;

        &__btn{
            margin: 0 0 0.5rem 0 !important;
            &:hover{
                .layerWeather__label{
                    @include activeStyle;
                    visibility: visible;    
                }
            }
            &--unfocus{
                opacity: 0.7;
                .layerWeather__label{
                    visibility: hidden;    
                }
            }
        }
        
        &__label{
            color: darken($info, 30);
            background: lighten($info,20);
            position:absolute;
            right:130%;
            padding: 0.25rem 0.5rem;
            border-radius: 0.5rem;
            &--actived {
                @include activeStyle;
            }
        }
	}

</style>
