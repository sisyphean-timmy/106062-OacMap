<template lang="pug">

.search
    el-select(
        style="width:100%;"
        v-model="selectedTagModel"
        filterable
        placeholder="選擇遊憩活動"
        placement="bottom"
        popper-class="selectItems"
        clearable
    )
        el-option(
            v-for="i in tags" 
            :key="i.label" 
            :label="i.label" 
            :value="i.value"
        )
        //- template(slot="prefix")
        //-     el-button(
        //-         style="position:absolute;"
        //-         circle
        //-         type="primary" 
        //-     )
        //-         .tools__button
        //-             font-awesome-icon(icon="search" fixed-width size="lg")
</template>

<script>

const tourismTags = require("@/layerTag.json")['tourism']
import {mapGetters,mapActions, mapMutations} from 'vuex'

export default {
    name :"search",
    data:()=>({
		keywordLabel:"",
    }),
    computed:{
        ...mapGetters({
            layerState:"layer/layer/state",
            commonState:"common/common/state"
        }),
        selectedTagModel:{
			get(){
				return this.keywordLabel
			},
			set(obj){
				
				const selected_val  = obj.value
				this.keywordLabel = obj.label

				this.SET_CURRENT_TAG(selected_val)
				this.SET_CARD_VISIBLE({key:'layer',bool:true})
				
				this.layerState("layer").forEach(l => {
					let visible = l.visible
					if(Array.isArray(l.tag) && selected_val){
						const curr = this.commonState("currentTag")
						if(l.tag.indexOf(curr) === -1){
							visible = false
						}
					}else{
						console.error("error selected_val",selected_val)
						console.error("error tag in layer",l)
					}
					console.log(l.title,visible)
					this.$LayerIns.setVisible(l.id,visible)
                })
                
                this.$emit("close")
			}
		},
		tags(){
			let qSearchs = []
			Object.keys(tourismTags).forEach(k => {
				tourismTags[k].forEach(v=>{
					qSearchs.push({label: v,value: {
						label: v,
						value: k
					}})
				})
			})
			return qSearchs
		}
    },
    methods:{
		...mapMutations({
			SET_CARD_VISIBLE:"common/common/SET_CARD_VISIBLE",
			SET_CURRENT_TAG:"common/common/SET_CURRENT_TAG",
        }),
		// autocompleteSelectQuerySearch(queryString, cb){
		// 	let val = spots.features.filter(i=>new RegExp(queryString,"g").test(i.properties.Name))
		// 	let result = val.map(i=>({
		// 		label:i.properties.Name,
		// 		value:i
		// 	}))
		// 	cb(result)
		// },
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
					padding-left: 50px;
					border-radius: 999px !important;
					box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
				}
			}
		}
		.el-button{
			box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
		}
		&>*{
			margin:0.5rem 0.5rem 0 0;
		}
	}

	.selectItems * {
		color: $primary !important;
		font-weight: normal !important;
    }
    
</style>