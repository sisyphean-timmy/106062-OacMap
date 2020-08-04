<template lang="pug">
//- 天氣
.layerWeather
    transition-group(name='slide-fade-up' class="col" mode="out-in")
        //- grouped parent
        template(v-for="group in normalWLyrGroupModel")
            el-button.layerWeather__btn(
                v-if="group.name"
                :class="getGroupClassName(group.name)"
                @click="activedGroupName === group.name ? activedGroupName = '' :activedGroupName = group.name"
                :type="activedGroupName&&activedGroupName === group.name?'danger':''"
                :title="group.name"
                :key="group.name"
                size="mini"
                circle
            )
                strong.layerWeather__label(v-if="textLabelVisible") {{group.name}}*
                div
                    font-awesome-icon(:icon="activedGroupName&&activedGroupName === group.name?'chevron-up':group.icon" fixed-width)
            //- child layers in group
            template(v-if="activedGroupName === group.name || !group.name" )
                el-button.layerWeather__btn(
                    v-for="lyr in group.data"
                    :class="getGroupClassName(group.name)"
                    @click="openNormalLyr(lyr.id,group.name)"
                    :key="lyr.title"
                    :title="lyr.title"
                    :type="activedLayerId === lyr.id?'primary':''"
                    size="mini"
                    circle
                )
                    transition(name="fade")
                        strong.layerWeather__label(
                            v-if="textLabelVisible"
                            :class="{'layerWeather__label--actived': activedLayerId === lyr.id}"
                        )
                            template(v-if="activedLayerId === lyr.id && loading")
                                i.el-icon-loading
                                | 載入中
                            template(v-else)
                                | {{lyr.title}}
                    div
                        font-awesome-icon(:icon="lyr.icon" fixed-width)
    .col
        //- fixed : windy
        el-button(
            style="margin: 0 0 0.5rem 0;"
            @click="SET_WINDY_OPTION({visible:true})"
            size="mini"
            circle
        )
            strong.layerWeather__label(
                v-if="textLabelVisible"
                style="position:absolute;right:130%;"
            ) Windy 地圖
            div
                img(src="@/assets/windy_icon.png" style="max-width:1rem;")

        //- other
        el-button(
            style="margin: 0 0 0.5rem 0;"
            @click="textLabelVisible=!textLabelVisible"
            title="文字顯示與否"
            size="mini"
            circle
            type="text"
        )
            div
                font-awesome-icon(:icon="textLabelVisible?'chevron-circle-right':'chevron-circle-left'" fixed-width )

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
        activedLayerId:"",
        activedGroupName:"",
        textLabelVisible:true,
		loading:false
	}),
	components:{
    },
    watch:{
        activedGroupName:{
            handler(v){
                !v && this.closeAllNormalLyr()
            }
        }
    },
	computed:{
		...mapGetters({
			weatherLayer:"layer/layer/weatherLayer"
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
        // this.weatherLayer.filter(l=>this.baseWLyr.indexOf(l)===-1)
        // this.weatherLayer.filter(l=>/gradient/ig.test(l.type))
        normalWLyrGroupModel(){
            const lyrs = this.normalWLyr
            return [
                {
                    name:"OCM 預報",
                    icon:"tachometer-alt",
                    data: lyrs.filter(i=>/OCM/g.test(i.title))
                },
                {
                    name:"船級作業風險",
                    icon:"ship",
                    data: lyrs.filter(i=>/巡防艇|巡護船|動力小船/g.test(i.title))
                },
                {
                    name:"船級舒適度",
                    icon:"ship",
                    data: lyrs.filter(i=>/交通船/g.test(i.title))
                },
                {
                    name:"波浪",
                    icon:"wave-square",
                    data: lyrs.filter(i=>/海域預報|異常波浪/g.test(i.title))
                },
                {
                    name:"",
                    data: lyrs.filter(i=>!(/OCM|巡防艇|巡護船|交通船|海域預報|海域預報|異常波浪|動力小船/g.test(i.title)))
                }
            ]
        }
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS",
			SET_ACTIVED_WEATHER_DATA:"layer/layer/SET_ACTIVED_WEATHER_DATA",
			SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION",
        }),
        getGroupClassName(groupMame){
            if(!this.activedGroupName){
                return ""
            }else if(this.activedGroupName !== groupMame){
                return 'layerWeather__btn--unfocus'
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
					id:l.id,
					times:[]
				}) 
            })
            this.activedLayerId = ""
		},
		async openNormalLyr(id,groupName){
			if(this.loading) return
            try{
                this.loading = true

                const activedLyr = this.$LayerIns.normalLayerCollection.find(l=>l.id === id)
                console.log("[activedWLyr Ins]",activedLyr)

                if(!activedLyr){
                    this.activedLayerId = ""
                    return
                }else if(this.activedLayerId === activedLyr.id){// self then close all
                    this.closeAllNormalLyr()
                    return
                }else{
                    this.activedLayerId = id
                }
                
                if(!groupName) this.activedGroupName = ''

                // 更新狀態及實例
                this.normalWLyr.forEach(l=>{  
                    const visible = l.id === activedLyr.id
                    this.$LayerIns.setVisible(l.id,visible)
                    this.UPDATE_LAYER_OPTIONS({
                        id:l.id,
                        payload:{visible}
                    })
                })

                // 取得 legend 
                const legend = DUMMY_LEGEND.find(l=> new RegExp(l.layerName,"g").test(activedLyr.title))
                console.log("[activedWLyr legend]",legend)

                let payload = {id}
                
                // 若要啟用的圖層包含圖例，取得圖例保存到狀態、重設圖層實例
                if(legend){
                    const new_legend = {
                        label:legend.label,
                        colorScaleLabel:legend.colorScaleLabel,
                        colorScaleValue:legend.colorScaleValue
                    }

                    // 重新設定 顏色尺度
                    activedLyr.setOption({
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

                // 等待實例完全建構、若有時間資訊提交到狀態保存
                await new Promise(res=>activedLyr.once("loaded",()=>res()))
                payload.times = activedLyr.times
                this.SET_ACTIVED_WEATHER_DATA(payload)
                
            }catch(e){
                console.error("openNormalLyr() err"+e)
            }finally{
                this.loading = false
            }
		}
	}
}
</script>

<style lang="scss" scoped >

	/deep/ {
    }

    @mixin activeStyle{
        color:#fff;
        background: $primary;
        text-shadow: none;
        font-size: 1rem;
        transition: 0.2s ease all;
    }

    .col{
        display:flex;
        flex-direction:column;
        overflow: hidden;
    }
	.layerWeather{
        
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
        &::-webkit-scrollbar {/* Hide scrollbar for Chrome, Safari and Opera */
            display: none;
        }

        background:rgba(0,0,0,0.5);
        border-radius:2rem;

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
            color: darken($info, 10);
            background: lighten($info,20);
            position:absolute;
            right:130%;
            // text-shadow: 2px 2px 9px rgba(0,0,0,0.8);
            padding: 0.2rem 0.4rem;
            border-radius: 0.5rem;
            &--actived {
                @include activeStyle;
            }

        }
	}

</style>