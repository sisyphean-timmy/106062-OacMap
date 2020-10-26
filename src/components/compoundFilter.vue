<template lang="pug">

.search
	el-select(
		style="width:100%;"
		v-model="selectedRegionModel"
		filterable
		placeholder="選擇行政區"
		placement="bottom"
		popper-class="selectItems"
		clearable
	)
		el-option(
			v-for="i in regions" 
			:key="i.label" 
			:label="i.label" 
			:value="i.value"
		)
		template(slot="prefix")
			el-button(
				style="position:absolute;"
				circle
				type="primary" 
			)
				.tools__button
					font-awesome-icon(icon="filter" fixed-width size="lg")
	el-select(
		style="width:100%;"
		v-model="selectedTownModel"
		filterable
		placeholder="選擇鄉鎮"
		placement="bottom"
		popper-class="selectItems"
		clearable
	)
		el-option(
			v-for="i in towns" 
			:key="i.label" 
			:label="i.label" 
			:value="i.value"
		)


</template>

<script>

import {mapGetters,mapActions, mapMutations} from 'vuex'

export default {
	name :"search",
	data:()=>({
		//currentRegion:null,
		//currentTown:null,
		filterRegion:null,
		filterTown:null,

		LayerToFilt:null, // layerID
	}),
	computed:{
		...mapGetters({
			currentRegion: './filter/currentRegion',
			currentTown: './filter/currentTown',
		}),
		layers(){
			return this.$store.state.layer.layer
		},
		selectedRegionModel:{
			get(){
				return this.currentRegion
			},
			set({label,value}){
				const filterRegion = this.filterRegion;
				let currentRegion = filterRegion[value];

				if(!currentRegion) label = null;
				this.currentRegion = label;
				this.filterTown = Object.freeze(currentRegion);

				this.SET_CURRENT_FILTER({region: label, town: null})
				const layer = this.$LayerIns.normalLayerCollection.find(l => l.id === this.LayerToFilt)
				layer.showOnly(value, null);
			}
		},
		selectedTownModel:{
			get(){
				return this.currentTown
			},
			set({label,value}){
				this.currentTown = label;
				this.SET_CURRENT_FILTER({region: this.currentRegion, town: label})
				const layer = this.$LayerIns.normalLayerCollection.find(l => l.id === this.LayerToFilt)
				layer.showOnly(this.currentRegion, value);
				this.$emit("close")
			}
		},
		regions(){
			if(!this.filterRegion) return
			const filterRegion = this.filterRegion
			let qSearchs = []
			Object.keys(filterRegion).forEach(k => {
				qSearchs.push({label: k, value: {
					label: k,
					value: k
				}})
			})
			return qSearchs
		},
		towns(){
			if(!this.filterTown) return
			const filterTown = this.filterTown
			let qSearchs = []
			Object.keys(filterTown).forEach(k => {
				qSearchs.push({label: k,value: {
					label: k,
					value: k
				}})
			})
			return qSearchs
		},
	},
	created(){
		const layer = this.$LayerIns.normalLayerCollection.find(l => !!l.index)
		if (!layer.index) return;
		const regions = Object.freeze(layer.index); // otherwise will be very slow
		this.filterRegion = regions;
		if (this.currentRegion) this.filterTown = Object.freeze(regions[this.currentRegion]);
		this.LayerToFilt = layer.id;
	},
	methods:{
		...mapMutations({
			"SET_CURRENT_FILTER": './filter/SET_CURRENT_FILTER',
		}),
	}
}
</script>

<style lang="scss" scoped>
	
	.search{
		margin:0.5rem 0 !important;
		/deep/ {
			.el-input{
				&__prefix{
					left:0;
				}
				&__inner{
					padding-left: 55px;
					border-radius: 999px !important;
					box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
				}
			}
		}
		.el-button{
			box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
		}
		&>*{
			margin:1rem 0;
		}
		&__locator{
			display: flex;
			/deep/ {
				.el-input{
					&__prefix{
						margin: 0 1rem;
					}
				}
			}
		}
	}

	.selectItems * {
		color: $primary !important;
		font-weight: normal !important;
	}

</style>
