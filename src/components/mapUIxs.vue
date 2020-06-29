<template lang="pug">

div
    pullup(
        v-if="!layerVisibility"
        ref='pullup'
        :reservedHeight='0'
        style="z-index:10;position: absolute;bottom: 0;" 
        v-model="pullupStatus"
        @move="toggleUIFade(1-$event)"
    ) 
        result(v-if="resultVisibility")
        
    transition(name="slide-fade-up")
        layerMobile(
            style="z-index:1;"
            v-if="layerVisibility"
            @close="SET_CARD_VISIBLE({key:'layer',bool:false})"
        )

    //- CUSTOM CONER UI
    .tr
        navbar(:isMobile="isMobile")
        layerWeather
    .tl
        tools
    .br
    .bl

</template> 

<script>

import Vue from 'vue'

import navbar from "@/components/navbar"
import tools from "@/components/tools"
import pullup from "@/components/pullup"

import result from "@/components/result/result"
import layerMobile from "@/components/layer/layerMobile"
import layerWeather from "@/components/layer/layerWeather"
import pageHeader from '@/components/common/pageHeader'

import {mapGetters,mapActions, mapMutations} from 'vuex'

export default {
    name:"mapuixs",
    props:{},
    data:()=>({
        layerToolVisible:false,
        //- pullup 目前所處位置
        pullupStatus:"close",
        //- uiDoms - pullup 以外的 DOM
        uiDoms: null
    }),
    components:{
        navbar,
        result,
        pageHeader,
        pullup,
        tools,
        layerMobile,
        layerWeather
    },
    watch:{},
    computed:{
        ...mapGetters({
            isMobile:"common/common/isMobile",
            allResultLength:"result/result/allResultLength",
            commonState:"common/common/state",
            freezedLayer:"layer/layer/freezedLayer"
        }),
        layerVisibility(){
            let bool = this.commonState("layerCardVisible")
            this.toggleUIFade(!bool) 
            return bool
        },
        resultVisibility(){
            let bool = this.commonState("resultCardVisible")
            this.pullupStatus = bool && this.allResultLength ? 'top': 'close'
            return bool
        }
    },
    methods:{
        ...mapMutations({
            SET_CARD_VISIBLE:"common/common/SET_CARD_VISIBLE",
        }),
        /** UI 隨資訊卡片上下拉動 淡出、入 @overload +1 */
        toggleUIFade(boolOrNumber){
            if(!this.uiDoms) return
            this.uiDoms.forEach(el=>{
                if(typeof boolOrNumber === "number"){ // 依據 pull 高度變動(比例)回傳的透明度 
                    const opacity = boolOrNumber
                    el.style.opacity = opacity
                    el.style.visibility = opacity ? 'visible' : 'hidden'
                }else if(typeof boolOrNumber === "boolean"){ // 依據 指定布林
                    const bool = boolOrNumber
                    this._fadeTransition(el,bool)
                }
            })
        },
        /** UI 淡出、入 */
        _fadeTransition(element,bool){
            let nativeFade = target=>{
                let op = 1
                let inc = -0.15
                if(bool){ op=0;inc=0.1 }
                let timer = setInterval(()=>{
                    op += inc
                    target.opacity = op
                    if(bool && op>0){
                        target.visibility = 'visible'
                        op>=1 && clearInterval(timer)
                    }else if(!bool && op<=0){
                        target.visibility = 'hidden'
                        clearInterval(timer)
                    }else{
                        inc += inc
                    }
                },25)
            }
            nativeFade(element.style)
        },
    },
    mounted(){
        this.uiDoms = document.querySelectorAll(".tr,.tl,.br,.bl,.t,.b")
    }
}
</script>

<style lang="scss" scoped>

    /deep/{
		.el-button{
			margin: 0;
		}
		.vc-chrome{
			width: auto;
			padding: 1rem 0;
			box-shadow: none;
			background: transparent;
		}
		.vc-chrome-saturation-wrap {
			width: 100%;
			padding-bottom: 25%;
		}
		.el-input__inner{
			padding-left: 3rem;
			border-radius:1rem;
		}
	}
	
    /**
    .content-card 
    */
    .content-card{
        border-top-right-radius: 1rem !important;
        border-bottom-right-radius: 1rem !important;
        will-change:width;
        position: fixed;
        z-index: 999;
        top: 0;
        left: 0;    
        bottom: auto;
        right: auto;  
        width: 450px;
        height: 100%;
        overflow-y:auto !important;
        /deep/ {
            &>.el-card__body{ 
                //- for layer sorting
                height: 100%;
                display:flex;
                flex-direction: column;
                box-sizing: border-box;
            }
        }
    }

    .tr,.tl,.br,.bl{
        position:  absolute;
        z-index: 1;
        &>*{
            position: relative;
        }
    }

    .tr,.tl{top: 1rem;bottom: auto;}
    .br,.bl{top: auto;bottom: 1rem;}
    .tl,.bl{left: 1rem;right: auto;}
    .tr,.br{left: auto;right: 1rem;}

    
    .result{
        position: relative;
        &__num{
            position:absolute;
            right: -2%;
            top: 1%;
            background-color:darken($info,10);
            color: #fff;
            width:1.1rem;
            height:1.1rem;
            text-align: center;
            border-radius: 100%;

            font-size: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;

            &--active{
                background-color:darken($danger,10);
                color: #fff;
            }
        }
    }

	.layerTool{
        width: 100%;
        height: 10vh;
        border-top-right-radius: 1rem;
        border-top-left-radius: 1rem;
        padding-bottom: 2rem;
        pointer-events: auto;
        background-color: rgba($black,0.7);
        color:#fff;
        transition: all 0.2s ease;
		&__item{
            margin:0 1rem; 
			display: flex;
            align-items: space-between;
            flex-direction: column;
			justify-content: center;
		}
    }
    
</style>
