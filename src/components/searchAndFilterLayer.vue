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
        template(slot="prefix")
            font-awesome-icon.search__icon(
                :class="{'search__icon--actived':selectedTagModel}"
                :icon="selectedTagModel ? 'swimmer' : 'search'" 
                fixed-width
                size="lg"
            )

    el-button(
        slot='reference'
        size="small"
        circle
        type="warning"
        @click="$openDrawer({title:'相關資訊', dir:'rtl'})"
    )
        font-awesome-icon(icon="plus" fixed-width size="lg")

</template>

<script>

import {mapGetters,mapActions, mapMutations} from 'vuex'

export default {
    name :"search",
    data:()=>({
        layerTag:null
    }),
    computed:{
        ...mapGetters({
            layerState:"layer/layer/state",
            commonState:"common/common/state"
        }),
        selectedTagModel:{
			get(){
				return this.commonState("currentTag").label
			},
			set({label,value}){
				
				this.SET_CURRENT_TAG({label,value})
				this.SET_CARD_VISIBLE({key:'layer',bool:true})
				
				this.layerState("layer").forEach(l => {
					let visible = l.visible
					if(Array.isArray(l.tag) && value){
						if(l.tag.indexOf(this.commonState("currentTag").value) === -1){
							visible = false
						}
					}else{
						console.error("error {value}",value)
						console.error("error tag in layer",l)
					}
					this.$LayerIns.setVisible(l.id,visible)
                })
			}
        },
        tags(){
			if(!this.layerTag) return
			const layerTag = this.layerTag
			let qSearchs = []
			Object.keys(layerTag).forEach(k => {
				layerTag[k].forEach(v=>{
					qSearchs.push({label: v,value: {
						label: v,
						value: k
					}})
				})
			})
			return qSearchs
        }
    },
    async created(){
        /** get layerTag (index) */
        this.layerTag = await(await fetch('./layerTag.json')).json()
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
        display: flex;
        align-items: center;
        justify-content: space-between;

		/deep/ {
            .el-input{
                border-radius: 999px !important;
                overflow: hidden;
                box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
                &__prefix{
                    left:0;
                    background: $primary;
                    border-radius: 100% !important;
                }
                &__inner{
                    padding-left: 55px !important;
                    border-radius: 999px !important;
                }
            }
            .el-button {
                box-shadow:0 0 6px 3px rgba(0,0,0,0.2);
            }
        }

        &>*{
            margin:0 0.5rem 0 0; 
		}

        &__icon{
            width:40px;
            color:#fff;
            font-weight: bolder;
        }
	}

	.selectItems * {
		color: darken($info,30) !important;
		font-weight: normal !important;
    }
    
</style>
