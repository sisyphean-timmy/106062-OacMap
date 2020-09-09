<template lang="pug">

.layerWeatherDetail(v-loading="loading")
    .col
        el-button(
            @click="SET_WINDY_OPTION({visible:true});$parent.$emit('close')"
            size="mini"
            round
        )
            div(style="display: flex;align-items: center;")
                img(src="@/assets/windy_icon.png" style="max-width:1.2rem;margin-right:0.5rem;")
                strong Windy 地圖

        el-button(
            @click="$openLink('https://safesee.cwb.gov.tw/V2/')"
            size="mini"
            round
        )
            div(style="display: flex;align-items: center;")
                img(src="@/assets/safesee.png" style="max-width:1.2rem;margin-right:0.5rem;")
                strong 台灣海象災防平台
                
    transition-group(name='slide-fade-up' class="col" mode="out-in")
        //- grouped parent
        template(v-for="group in normalWLyrGroupModel")
            h3(v-if="group.name" :key="group.name") {{group.name}}
            el-button(
                v-for="lyr in group.data"
                @click="openNormalLyr(lyr.id)"
                :key="lyr.title"
                :title="lyr.title"
                :type="activedLayer && activedLayer.id === lyr.id?'primary':''"
                size="mini"
                round
            )
                div(style="display: flex;align-items: center;")
                    font-awesome-icon(:icon="lyr.icon" fixed-width style="margin-right:0.5rem;")
                    span {{lyr.title}}
    

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
    name:"layerWeatherDetail",
	data:()=>({
		loading:false,
	}),
	props:{
	},
	components:{
    },
	computed:{
		...mapGetters({
			layerState:"layer/layer/state",
			weatherLayer:"layer/layer/weatherLayer"
        }),
        activedLayer(){
            const {id} = this.layerState('activedWeatherLyr')
            return this.normalWLyr.find(l=>l.id === id)
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
        normalWLyrGroupModel(){
            const lyrs = this.normalWLyr
            return [
                {
                    name:"海象",
                    data:lyrs.filter(i=>/OCM模式|臺灣海域預報/g.test(i.title))
                }
                // {
                //     name:"氣象",
                //     data:lyrs.filter(i=>/10米風資料_WIFI/g.test(i.title))
                // }
            ]
        }
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
			if(this.loading) return
            try{
                this.loading = true

                const lyrAwaitToActive = this.$LayerIns.normalLayerCollection.find(l=>l.id === id)
                console.log("[lyrAwaitToActive Ins]",lyrAwaitToActive)

                if(this.activedLayer && this.activedLayer.id === lyrAwaitToActive.id){// self then close all
                    this.closeAllNormalLyr()
                    return
                }
                
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
                    
                    const { colorScaleLabel,colorScaleValue } = legend

                    // 重新設定 顏色尺度
                    lyrAwaitToActive.setOption({
                        maxIntensity:Number(colorScaleLabel[0]),
                        minIntensity:Number(colorScaleLabel[colorScaleLabel.length-1]),
                        colorScale:Object.assign([],colorScaleValue).reverse()
                    })

                    // get text lable from colorScaleLabelName
                    if(legend.type==="text"){ 
                        const {colorScaleLabelName} = legend
                        colorScaleLabel = colorScaleLabel.map(i => colorScaleLabelName[i])
                    }

                    // mix original propers
                    payload.legend = legend

                }

                // 等待完全建構、提交到狀態保存
                await new Promise(res=>lyrAwaitToActive.once("loaded",()=>res()))
                payload.times = lyrAwaitToActive.times
                this.SET_ACTIVED_WEATHER_DATA(payload)

                this.$parent.$emit('close')

            }catch(e){
                console.error("openNormalLyr()"+e)
            }finally{
                this.loading = false
            }
		}
	}
}
</script>

<style lang="scss" scoped >

    .col{
        display:flex;
        flex-direction:column;
        overflow: hidden;
    }
    /deep/ {
        .el-button{
            margin: 0.5rem 0 !important;
        }
    }

</style>