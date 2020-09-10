<template lang="pug">
div(style="display:flex;")
	transition(name="fade")
		//- TODO : valueModel is not real percentage of slider
		.timeSilder(
			v-if="DATES.length > 1" ref="timeSilder" key="timeSilder"
			:class="valueModel<50 ? 'timeSilder__start' : 'timeSilder__end'"
		)
			VueSlider(
				ref="slider"
				v-model="valueModel"
				v-bind="options"
			)
				template(v-slot:dot)
					div(v-if="loading" v-loading="true" style="width:1rem;height:1rem;")
		.legend(
			v-if="legendVisible"
			ref="legend"
			key="legend"
		) 
			small.legend__title(v-if="legend.label") {{legend.label}}
			.legend__row(
				v-for="scale in legendColor" 
				:key="scale.label"
			)
				.legend__row__color(:style="`background-color:${scale.value};`")
				.legend__row__text {{isNaN(scale.label)?scale.label:Number(scale.label)}}

</template>

<script>

/** TEST MAP DATES */
// const DATES = ["2020-07-25T23:00:00+08:00", "2020-07-26T02:00:00+08:00", "2020-07-26T05:00:00+08:00", "2020-07-26T08:00:00+08:00", "2020-07-26T11:00:00+08:00", "2020-07-26T14:00:00+08:00", "2020-07-26T17:00:00+08:00", "2020-07-26T20:00:00+08:00", "2020-07-26T23:00:00+08:00", "2020-07-27T02:00:00+08:00", "2020-07-27T05:00:00+08:00", "2020-07-27T08:00:00+08:00", "2020-07-27T11:00:00+08:00", "2020-07-27T14:00:00+08:00", "2020-07-27T17:00:00+08:00", "2020-07-27T20:00:00+08:00", "2020-07-27T23:00:00+08:00", "2020-07-28T02:00:00+08:00", "2020-07-28T05:00:00+08:00", "2020-07-28T08:00:00+08:00", "2020-07-28T11:00:00+08:00", "2020-07-28T14:00:00+08:00", "2020-07-28T17:00:00+08:00", "2020-07-28T20:00:00+08:00", "2020-07-28T23:00:00+08:00", "2020-07-29T02:00:00+08:00", "2020-07-29T05:00:00+08:00", "2020-07-29T08:00:00+08:00", "2020-07-29T11:00:00+08:00", "2020-07-29T14:00:00+08:00", "2020-07-29T17:00:00+08:00", "2020-07-29T20:00:00+08:00", "2020-07-29T23:00:00+08:00", "2020-07-30T02:00:00+08:00", "2020-07-30T05:00:00+08:00", "2020-07-30T08:00:00+08:00", "2020-07-30T11:00:00+08:00", "2020-07-30T14:00:00+08:00", "2020-07-30T17:00:00+08:00", "2020-07-30T20:00:00+08:00", "2020-07-30T23:00:00+08:00", "2020-07-31T02:00:00+08:00", "2020-07-31T05:00:00+08:00", "2020-07-31T08:00:00+08:00", "2020-07-31T11:00:00+08:00", "2020-07-31T14:00:00+08:00", "2020-07-31T17:00:00+08:00", "2020-07-31T20:00:00+08:00", "2020-07-31T23:00:00+08:00", "2020-08-01T02:00:00+08:00", "2020-08-01T05:00:00+08:00", "2020-08-01T08:00:00+08:00", "2020-08-01T11:00:00+08:00", "2020-08-01T14:00:00+08:00", "2020-08-01T17:00:00+08:00", "2020-08-01T20:00:00+08:00", "2020-08-01T23:00:00+08:00", "2020-08-02T02:00:00+08:00", "2020-08-02T05:00:00+08:00", "2020-08-02T08:00:00+08:00", "2020-08-02T11:00:00+08:00", "2020-08-02T14:00:00+08:00"]
// console.time("[Map mark of timeline]")
// let lastAddedDate = null
// let test = {}
// const DDS = DATES.forEach((dStr,index)=>{
//     const D = new Date(dStr)
//     const yy = D.getFullYear()
//     const mm = D.getMonth()+1
//     const dd = D.getDate()
//     if(!lastAddedDate){
//         lastAddedDate = D
//     }else if(D-lastAddedDate>24*60*60*1000 || dd>new Date(lastAddedDate).getDate()){
//         lastAddedDate = D
//         test[index] = {
//             label:`${mm}/${dd}`
//         }
//     }
// })
// console.timeEnd("[Map mark of timeline]")

import { mapGetters, mapMutations } from 'vuex'

/** @see https://nightcatsama.github.io/vue-slider-component/#/zh-CN/advanced/components-slots */
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'

export default {
	name:"timeSilder",
	components:{
		VueSlider
	},
	data:()=>({
		value: 0,
		timer:null,
		loading:false,
		errDateCollection:[]
	}),
	props:{
	},
	mounted(){
	},
	computed:{
		...mapGetters({
			layerState:"layer/layer/state"
		}),
		//** legend */
		legendColor(){
			return this.legend.colorScaleValue.map((c,i)=>({
				label:this.legend.colorScaleLabel[i],
				value:c
			}))
		},
		legend(){
			return this.layerState('legend')
		},
		legendVisible(){
			return this.legend.colorScaleLabel.length && this.legend.colorScaleValue.length
		},
		//** timeSlider */
		valueModel:{
			get(){
				return this.value
			},
			set(index){
				this.loading = true
				if (this.timer) clearTimeout(this.timer)
				this.timer = setTimeout(async () => {
					const TIME_STR = this.DATES[index]
					const activedLyr = this.$LayerIns.normalLayerCollection.find(l=>l.id === this.activedWeatherLyr.id)
					console.log("%s[set layer time]","background:red;",this.DATES[index])
					try{
						await activedLyr.setTimeData(TIME_STR)
					}catch(e){// 蒐集發生錯誤的日期紀錄，在 tootip 中顯示
						this.errDateCollection.push(this.DATES[index])
					}finally{
						this.loading = false
					}
					this.value = index
				}, 300)
			}
		},
		activedWeatherLyr(){
			return this.layerState("activedWeatherLyr")
		},
		DATES(){
			return this.activedWeatherLyr.times
		},
		MARKS(){
			let bucket = {}
			if(new Date().getHours()<21){
				bucket = {"0":"今天"}
			}
			this.DATES.forEach((dStr,index)=>{
				const D = new Date(dStr)
				const yy = D.getFullYear()
				const mm = D.getMonth()+1
				const dd = D.getDate()

				const lD = new Date(this.DATES[index-1])
				const lyy = lD.getFullYear()
				const lmm = lD.getMonth()+1
				const ldd = lD.getDate()
				
				if(dd>ldd || mm>lmm ||yy>lyy){
					bucket[index] = {
						label:`${mm}/${dd}`
					}
				}
			})
			return bucket
		},
		options(){
			return {
				// dotSize: 5,
				width: 'auto',
				height: 10,
				// contained: true,
				direction: 'ltr',
				// data: DATES,
				// min: 0,
				max: this.DATES.length ? (this.DATES.length-1) : 0,
				// interval: 1,
				// disabled: false,
				// clickable: true,
				// duration: 0.5,
				// adsorb: false,
				// lazy: true,
				tooltip: 'always',
				tooltipPlacement: 'top',
				tooltipFormatter: i=>{
					const dStr = this.DATES[i]
					if(this.errDateCollection.indexOf()>-1){
						return "發生錯誤"
					}else{
						return new Date(dStr).toLocaleString()
					}
				},
				// tooltipStyle: void 0,
				// useKeyboard: false,
				// keydownHook: null,
				// dragOnClick: false,
				// enableCross: true,
				// fixed: false,
				// minRange: void 0,
				// maxRange: void 0,
				// order: true,
				included:false,
				marks: this.MARKS,
				// dotOptions: void 0,
				// process: true,
				// dotStyle: void 0,
				// railStyle: void 0,
				// processStyle: void 0,
				// stepStyle: void 0,
				// stepActiveStyle: void 0,
				// labelStyle: void 0
				// labelActiveStyle: void 0,
			}
		}
	}
}

</script>

<style lang="scss" scoped>

/** legend */
.legend{
	width: 100%;
	background-color: rgba(0,0,0,0.45);
	color:#fff;
	display: flex;
	align-items:center;
	&__title{
		white-space: nowrap;
		padding: 0 1rem;
		z-index: 1;
	}
	&__row {
		display: flex;
		align-items:center;
		&__text{
			position: relative;
			padding: 0.25rem 0.5rem;
			text-shadow: 1px 1px 0px rgba(0,0,0,1);
		}
		&__color{
			position: absolute;
			width: 100vw;
			height: 100%;
		}
	}
}

/** timeSlider */

.timeSilder{
	position: absolute;
	width: 70vw;
	max-width: 700px;
	right: 0;
	left: auto;
	top: auto;
	z-index: 2;
	bottom: 0;
	
	@media screen and (max-width:768px){
		width: 100vw;
		bottom: 0;
		/deep/ .vue-slider{
			padding: 0 0 1.5rem 0 !important
		}
	}

	/** x and left */
	&__start /deep/{
		.vue-slider-dot-tooltip-top{
			transform: translate(-5%,-100%);
		}
		.vue-slider-dot-tooltip-inner-top::after{
			left: 5%;
		}
	}
	&__end /deep/{
		.vue-slider-dot-tooltip-top{
			transform: translate(-90%,-100%);
		}
		.vue-slider-dot-tooltip-inner-top::after{
			left: 90%;
		}
	}
}

/deep/ {

	//- ----
	.el-loading-spinner .circular{
		width: 15px !important;
		height: 15px !important;
		.path{
			stroke: #fff !important;
			stroke-width: 5px !important;
		}
	}
	.el-loading-mask{
		background-color: transparent;
	}
	
	//- ----
	.vue-slider{
		padding: 0 1rem 2rem 1rem !important;
	}
	.vue-slider-process {
		background-color: $primary !important;
		border-radius: 0 !important;
	}
	.vue-slider-rail {
		border-radius: 0;
		background-color: $info !important; // rgba(0, 0, 0, 0.3) 
		&::after{
			content:"";
			position: absolute;
			background-color: $info !important; // rgba(0, 0, 0, 0.3) 
			width: 100vw;
			height: 100%;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
		}
	}
	.vue-slider-mark{
		width: 0 !important;
	}
	.vue-slider-mark-label {
		padding: 0.15rem 0.25rem;
		background-color: rgba(0,0,0,0.3);
		margin-top: 0 !important;
		transform:translateX(0) !important;
		color: #ffffff;
		width: 100vw;
	}
	.vue-slider-mark-step {
		box-shadow: none !important;
		background-color: #ffffff !important;
		width: 3px;
		border-radius: 0;
	}

}

</style>