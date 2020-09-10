<template lang="pug">
//- 天氣
div(:class="isMobile?'layerWeather--mobile':'layerWeather'")
    .col(v-if="!isMobile")
        el-button(
            style="margin: 0 0 0.5rem 0;color: #fff;"
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

    //- mobile only show actived
    div(v-if="isMobile")
        //- Exsist actived layer condition
        el-button(
            v-if="activedLayer"
            :title="activedLayer.title"
            type="primary"
            :class="getGroupBtnClassName()"
            @click="$parent.$parent.$emit('openDrawer','海情/海象資訊')"
            size="mini"
            circle
        )
            div(style="display: flex;align-items: center;")
                strong.layerWeather__label.layerWeather__label--actived {{activedLayer.title}}
                font-awesome-icon(:icon="activedLayer.icon" fixed-width)
        el-button(
            v-else
            plain
            title="選擇海情/海象資訊"
            type="primary"
            :class="getGroupBtnClassName()"
            @click="$parent.$parent.$emit('openDrawer','海情/海象資訊')"
            size="mini"
            circle
        )   
            div(style="display: flex;align-items: center;")
                strong.layerWeather__label 選擇海情/海象資訊
                font-awesome-icon(icon="cloud" fixed-width)

    //- dektop show all
    transition-group(v-else name='slide-fade-up' class="col" mode="out-in")
        //- grouped parent 
        template(v-for="group in normalWLyrGroupModel")
            el-button(
                v-if="group.name"
                :class="getGroupBtnClassName(group.name)"
                @click="activedGroupName === group.name ? activedGroupName = '' :activedGroupName = group.name"
                :type="activedGroupName&&activedGroupName === group.name?'danger':''"
                :title="group.name"
                :key="group.name"
                size="mini"
                circle
            )
                div(style="display: flex;align-items: center;")
                    strong.layerWeather__label(v-if="textLabelVisible") {{group.name}}*
                    font-awesome-icon(:icon="activedGroupName&&activedGroupName === group.name?'chevron-up':group.icon" fixed-width)
            //- child layers in group
            template(v-if="activedGroupName === group.name || !group.name" )
                el-button(
                    v-for="lyr in group.data"
                    :class="getGroupBtnClassName(group.name)"
                    @click="openNormalLyr(lyr.id,group.name)"
                    :key="lyr.title"
                    :title="lyr.title"
                    :type="activedLayer && activedLayer.id === lyr.id?'primary':''"
                    size="mini"
                    circle
                )
                    div(style="display: flex;align-items: center;")
                        transition(name="fade")
                            strong.layerWeather__label(
                                v-if="textLabelVisible"
                                :class="{'layerWeather__label--actived': activedLayer && activedLayer.id === lyr.id}"
                            )
                                template(v-if="loadingLayerId===lyr.id")
                                    i.el-icon-loading
                                    |   載入中
                                template(v-else)
                                    | {{lyr.title}}
                        font-awesome-icon(:icon="lyr.icon" fixed-width)
    //- others
    .col(v-if="!isMobile")
        //- other
        el-button(
            style="margin: 0 0 0.5rem 0;color: #fff;"
            @click="textLabelVisible=!textLabelVisible"
            title="文字顯示與否"
            size="mini"
            circle
            type="text"
        )
            div
                font-awesome-icon(:icon="textLabelVisible?'chevron-circle-right':'chevron-circle-left'" fixed-width )
        //- detail
        el-button(
            style="margin: 0 0 0.5rem 0;color: #fff;"
            title="詳細資料"
            size="mini"
            circle
            type="text"
            @click="$parent.$parent.$emit('openDrawer','海情/海象資訊')"
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
        textLabelVisible:true,
		loadingLayerId:""
	}),
	props:{
		// isMobile:{
		// 	type:Boolean,
		// 	default:true		
		// }
	},
	components:{
    },
    watch:{
        activedGroupName:{
            handler(v){
                !v && this.closeAllNormalLyr()
            }
        },
        activedLayer:{
            handler(lyr){
                if(!lyr) return
                const activedLayerInGroup = this.normalWLyrGroupModel.find(g=>g.data.indexOf(lyr)>-1)
                if(activedLayerInGroup){
                    this.activedGroupName = activedLayerInGroup.name
                }
            }
        }
    },
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			layerState:"layer/layer/state",
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
        activedLayer(){
            const {id} = this.layerState('activedWeatherLyr')
            return this.normalWLyr.find(l=>l.id === id)
        },
        normalWLyrGroupModel(){
            const lyrs = this.normalWLyr
            return [
                {
                    name:"",
                    data: lyrs.filter(i=>!(/OCM|巡防艇|巡護船|交通船|海域預報|海域預報|異常波浪|動力小船/g.test(i.title)))
                },
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
        getGroupBtnClassName(groupMame){
			let name = this.isMobile?'layerWeather--mobile__btn':'layerWeather__btn'
            if(this.activedGroupName && this.activedGroupName !== groupMame){
				name+=` ${name}--unfocus`
			}
			return name
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
		async openNormalLyr(id,groupName){
			if(this.loadingLayerId) return
            try{
                
                const activedLyr = this.$LayerIns.normalLayerCollection.find(l=>l.id === id)
                console.log("[activedWLyr Ins]",activedLyr)
                this.loadingLayerId = activedLyr.id
                
                if(this.activedLayer && this.activedLayer.id === activedLyr.id){// self then close all
                    this.closeAllNormalLyr()
                    return
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

                let payload = {id}
                // 取得 legend 、保存到狀態、重設圖層實例
                const legend = DUMMY_LEGEND.find(l=> new RegExp(l.layerName,"g").test(activedLyr.title))
                console.log("[activedWLyr legend]",legend)
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

                // 完全建構後提交到狀態保存
                await new Promise(res=>activedLyr.once("loaded",()=>res()))
                payload.times = activedLyr.times
                this.SET_ACTIVED_WEATHER_DATA(payload)
                
            }catch(e){
                console.error("openNormalLyr() err"+e)
            }finally{
                this.loadingLayerId = ""
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
        transition: 0.2s ease all;
        max-width: 200px;
    }

    .col{
        display:flex;
        flex-direction:column;
        overflow: hidden;
    }
    
	.layerWeather--mobile{
        &__btn,&__label{
            @include boxShadow;
        }
    }

	.layerWeather{
        
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
            color: darken($info, 20);
            background: lighten($info,20);
            position:absolute;
            right:130%;
            // text-shadow: 2px 2px 9px rgba(0,0,0,0.8);
            padding: 0.25rem 0.5rem;
            border-radius: 0.5rem;
            
            max-width: 120px;
            text-overflow: ellipsis;
            overflow: hidden;
            text-align: left;
            &--actived {
                @include activeStyle;
            }

        }
	}

</style>