<template lang='pug'>
	.layer-mobile(:class="{'layer-mobile--accessable':layerActivedId}")
		.layer-mobile__wrapper
			
			.layer-mobile__header
				el-button(
					type="danger"
					plain
					@click="canClose ? $emit('close') : layerActivedId = '' ; currentView= ''"
				) 	
					font-awesome-icon(icon="chevron-left" fixed-width tansform="left-2")
					strong 回{{canClose ? '地圖' : '列表'}}
			
			.layer-mobile__filter
				el-alert(type="success" style="margin-bottom:0.5rem;")
					h3 
						font-awesome-icon(icon="exclamation-circle" size="lg" fixed-width)
						| 您想找 ? 
					
					//- el-button(type="primary" round size="mini") 衝浪
					//- el-button(type="primary" round size="mini") 法令與管制規定
					//- el-button(type="primary" round size="mini") 海象

					p
						span 點擊地圖上的色塊，來查詢您想知道的資訊，下方的圖層可以控制資訊色塊開關與透明度 。
						
				el-input(
					clearable 
					size="small" 
					slot='reference'
					v-model="layerKeywordModel" 
					placeholder="輸入關鍵字搜尋圖資名稱" 
				)
					font-awesome-icon(icon="search" fixed-width slot="prefix")

			.fixedTopList
				.fixedTopList__collapse(:class="{'fixedTopList__collapse--hide':hideFixedTopList}")
					layerItemFixedCard.slickList__card(
						v-for="layer in layerFixedTop"
						:key="layer.title"
						:class="getStatusClassName(layer)"
						:layer="layer"
						:dragging="dragging"
						:useDragger="!isIE"
						@switch="handleLayerVisibility(layer.id,$event)"
						@opacitySlide="handleLayerOpacity(layer.id,$event)"
					)

				div(style="display:flex;justify-content:center;position:absolute;left:0;right:0;bottom:-0.8rem;z-index: 9;")
					el-button(
						round 
						type="primary"
						size="mini" 
						style="padding:0.15rem 0.3rem;"
						@click="hideFixedTopList=!hideFixedTopList"
					) 
						font-awesome-icon(:icon="hideFixedTopList ? 'chevron-down' : 'chevron-up'" fixed-width style="margin-right:0.25rem;")
						small {{hideFixedTopList ? '展開' : '收折'}}

			transition(name="slide-fade-up")
				//- see : https://github.com/Jexordexan/vue-slicksort
				SlickList.slickList(
					ref="slickList"
					v-model="layerListModel"
					@sort-end="handleTouchEnd"
					@sort-start="handleTouchStart"
					appendTo="body"
					:pressDelay=" !isIE ? 0 : 500 "
					:useDragHandle="!isIE"
					helperClass="dragging"
					:transitionDuration="300"
				)
					//- use tabindex for search focus | scrollIntoView
					SlickItem(
						v-for="layer,index in layerListModel"
						:key="`${layer.id}`"
						:index="index"
					)
						layerItemCard.slickList__card(
							:layer="layer" 
							:class="getStatusClassName(layer)"
							:status="layer.status"
							:dragging="dragging"
							:useDragger="!isIE"
							@switch="handleLayerVisibility(layer.id,$event)"
							@opacitySlide="handleLayerOpacity(layer.id,$event)"
						)

			.layer-mobile__footer
				layerBaseMap(style="padding:0;z-index:10;")

</template>



<script>

import layerItemFixedCard from "./layerItemFixedCard"
import layerItemCard from "./layerItemCard"
import layerBaseMap from "./layerBaseMap"

import { SlickList, SlickItem,HandleDirective } from 'vue-slicksort'
import {mapGetters,mapActions, mapMutations} from 'vuex'


export default {
	directives: { handle: HandleDirective },
	name:'layerMobile',
	components:{
		SlickList,
		SlickItem,
		layerItemCard,
		layerBaseMap,
		layerItemFixedCard
	},
	data:()=>({
		dragging:false,
		lastDraggingLyrPtr:'',
		// 
		currentView:"",
		// control show detail or not
		layerActivedId:"",
		//
		layerKeyword:"",
		matchKeywordLayers:[],
		//
		hideFixedTopList: false
	}),
	computed:{
		canClose(){
			return !this.layerActivedId && !this.currentView
		},
		isIE(){
			return Boolean(document.documentMode)
		},
		...mapGetters({
			state:'layer/layer/state',
			rootState: 'common/common/state',
			sortableLayer: 'layer/layer/sortableLayer',
			freezedLayer: 'layer/layer/freezedLayer'
		}),
		layerKeywordModel:{
			get(){
				return this.layerKeyword
			},
			set(str){
				this.matchKeywordLayers = str ? this.layerListModel.filter(lyr=>lyr.title.match(new RegExp(str,"g"))) : []
				if(this.matchKeywordLayers.length > 0){ //- matched keyword
					this.$refs.slickList.$children.forEach(comp=>{
						if(comp.$vnode.elm.innerText === this.matchKeywordLayers[0].title){ // first one
							document.documentElement.scrollIntoView ? comp.$el.scrollIntoView({behavior: "smooth"}) : c.$el.focus()
						}
					})
				}
				this.layerKeyword = str
			}
		},
		layerListModel:{
			get(){
				return  this.sortableLayer.filter(l=> /geojson/ig.test(l.type) )
			},
			set(newSortedLayerArr){
				this.SNAPSHOT_RAW_LAYER({
					type:'layer', 
					payload:[...this.freezedLayer,...this.layerFixedTop,...newSortedLayerArr]
				})
			}
		},
		layerFixedTop(){
			return  this.sortableLayer.filter(l=> /clusterMark/ig.test(l.type) )
		},
		/** 不排序的圖層 */
		freezedLayerCount(){
			return this.freezedLayer.length + this.layerFixedTop.length
		}
	},
	methods:{
		...mapMutations({
			UPDATE_LAYER_OPTIONS:'layer/layer/UPDATE_LAYER_OPTIONS',
			SNAPSHOT_RAW_LAYER:'layer/layer/SNAPSHOT_RAW_LAYER',
		}),		
		_toggleLayerWiggle(bool){
			this.$nextTick(()=>{
				this.$refs['slickList'].$el.childNodes.forEach(node => {
					node.children[0].classList.toggle('wiggle',bool)
					if(bool) node.children[0].style.animationDuration = `${Math.random() * (2000 - 1000) + 1000}ms`
				})
			})
		},
		handleTouchEnd(evt){

			const oi = evt.oldIndex 
			const ni = evt.newIndex 

			//- 地圖實例順序更新
			console.log("順序移動 : 索引 " + oi + " 至 " + ni,this.layerListModel[oi])

			/** 加上不可排序的長度 來偏移 */
			const offset_oi = oi + this.freezedLayerCount
			const offset_ni = ni + this.freezedLayerCount
			this.$LayerIns.reorderNormalLayer(this.layerListModel[oi].id,offset_oi,offset_ni)
			
			this.dragging = false
			this._toggleLayerWiggle(false) //- dom wiggle effect
		},
		handleTouchStart(evt){
			this.dragging = true
			this._toggleLayerWiggle(true) //- dom wiggle effect
			this.lastDraggingLyrPtr = this.layerListModel[evt.index] //- keep last moved layer to mark red outline
		},
		handleItemTouchStart(evt,id){
			this.layerActivedId = id
		},
		handleLayerVisibility(id,bool){
			//- update map instance
			this.$LayerIns.setVisible(id,bool)
			//- update state snapshot
			this.UPDATE_LAYER_OPTIONS({
				id:id,
				payload:{
					visible:bool
				}
			})
		},
		handleLayerOpacity(id,opacity){
			//- update map instance
			this.$LayerIns.setOpacity(id,opacity)
			//- update state snapshot
			this.UPDATE_LAYER_OPTIONS({
				id:id,
				payload:{
					opacity:opacity
				}
			})
		},
		getStatusClassName(layer){
			return {
				'slickList__card--matched-keyword':this.matchKeywordLayers.indexOf(layer)>-1,
				'slickList__card--last-move':(this.lastDraggingLyrPtr === layer),
				'slickList__card--outScale':(layer.status==='outScale'),
				'slickList__card--simple':(layer.status==='simple') || (this.matchKeywordLayers.length>0 && !this.matchKeywordLayers.indexOf(layer)>-1)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
	.layer-mobile{
		position: fixed;
		height: 100%;
		left: 0;
		right: 0;
		margin: 0 auto;
		max-width: 100%;
		bottom: 0;
		top: 0;
		background-color:rgba(256,256,256,0.4);
		transition: all ease 0.2s;
		&__filter{
			margin:1rem;
			/deep/ {
				.el-input__inner{
					border: 1.5px solid $primary;
				}
			}
		}

		&__wrapper{
			height:100%;
			display:flex;
			flex-direction: column;
			background-color: #ffffff;
			position: relative;
		}

		&--accessable{
			pointer-events: none;
			background-color:rgba(256,256,256,0);
		}
		&__header,&__footer{
			&>*{
				pointer-events: all;
				border: 0;
				padding: 0.6rem 0;
				// background-color: $aux;
				// color:$text;
				border-radius:0;
				width: 100%;
			}
		}
		&__footer{
			position: absolute;
			bottom: 0;
			width: 100%;
			background: #fff;
			z-index: 99999;
		}
	}
	
	.fixedTopList{
		margin: 0 1rem;
		position: relative;
		border-top: 1px solid #d7d7d7;
		border-bottom: 1px solid #d7d7d7;
		&__collapse{
			height: auto;
			overflow: hidden;
			will-change: height;
			&--hide{
				height: 0;
			}
		}
	}

	.slickList{ 
		padding: 0 1rem;
		overflow-y: auto;
		box-sizing: border-box;
		position: relative;
		height:100vh;
		
		&__card{
			transition: all 0.2s ease-in-out;
			&--matched-keyword{
				color: red !important;
				border-color: red !important;
				border-width: 2px;
			}
			&--last-move{
				border-color: $primary;
				border-width: 2px;
			}
			&--outScale{
				color:#E6A23C;
				background-color:#fdf6ec;
			}
			&--simple {
				opacity:0.5;
			}
		}
	}

	.dragger{
		margin:-0.8rem 0 -0.8rem -1rem ;
		padding: 0 1rem;
		align-self: center;
		cursor: grab;
		pointer-events: all;
	}

	.dragging{
		z-index: 9999;
		// border: 1px solid red;
		// border-radius: 0.5rem;
	}

	
	.wiggle {
		animation-name: wiggle;
		animation-duration: 1500ms;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
		transform: scale(0.95,0.95);
	}

	@keyframes wiggle {
		0% { transform: translate(0, 0) rotate(0); }
		10% { transform: translate(-0.5px, -1px) rotate(-0.2deg); }
		20% { transform: translate(-1.5px, 0px) rotate(0.2deg); }
		30% { transform: translate(1.5px, 1px) rotate(0deg); }
		40% { transform: translate(0.5px, -0.5px) rotate(0.2deg); }
		50% { transform: translate(-0.5px, 1px) rotate(-0.2deg); }
		60% { transform: translate(-1.5px, 0.5px) rotate(0deg); }
		70% { transform: translate(1.5px, 0.5px) rotate(-0.2deg); }
		80% { transform: translate(-0.5px, -0.5px) rotate(0.2deg); }
		90% { transform: translate(0.5px, 1px) rotate(0deg); }
		100% { transform: translate(0, 0) rotate(0); }
	}

	.color-legendRGBStr{
		border:2px solid #ffffff;
		border-radius: 100%;
		margin-right: 0.5rem;
		width:0.9rem;
		height:0.9rem;
		box-shadow: 0 0 1px 2px rgba(0,0,0,0.1);
	}


</style>