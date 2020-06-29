<template lang="pug">

.layerWeather
    transition-group(name="slide-fade-up")
        //- actived info and setting show here
        .layerWeather__current(v-if="activedLayer && !otherVisibility" key="active")
            div(style="display:flex;align-items:center;")
                font-awesome-icon(
                    size="2x"
                    style="margin-right:0.5rem;"
                    :icon="guessFwIcon(activedLayer.name)"  
                )
                span {{activedLayer.name}}

            small(style="margin:0 0.5rem;") 資料來源 中央氣象局

            el-button(
                plain 
                round
                type="danger" 
                size="mini"  
                style="padding:0.1rem 0.5rem;margin-left:1rem;" 
                @click="disableAllLyr"
            )  停用

        .layerWeather__other(v-else-if="otherVisibility" key="other")
            .layerWeather__item
                el-button(
                    v-for="lyr in otherLayer"
                    :key="lyr.name"
                    style="color:#fff;margin:0;"
                    round
                    type="text"
                    size="mini"
                    @click="openLyr(lyr)"
                ) 
                    font-awesome-icon(
                        style="margin-right:0.5rem;"
                        :icon="guessFwIcon(lyr.name)"  
                    )
                    big {{lyr.title}}

        div(v-else key="disabled")

    el-button(
        type="text" 
        size="mini" 
        style="color:#fff;text-align:center;width:100%;"
        @click="otherVisibility = !otherVisibility"
    ) 
        font-awesome-icon(
            :icon="otherVisibility?'chevron-up':'ellipsis-h'"
        )
        strong(v-if="!otherVisibility && !activedLayer" style="margin-left:0.5rem;") 啟用海象資料

</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
    name:"layerWeather",
    data:()=>({
        otherVisibility:false,
        activedLayer:null
    }),
    computed:{
        ...mapGetters({
            freezedLayer:"layer/layer/freezedLayer"
        }),
        otherLayer(){
            return this.freezedLayer.filter(l=> l!==this.activedLayer)
        }
    },
    watch:{
        freezedLayer:{
            handler(l){
                // this.activedLayer = l[0]
                // this.$LayerIns.setVisible(this.activedLayer.id,true)
                // this.UPDATE_LAYER_OPTIONS({
                //     id:this.activedLayer.id,
                //     payload:{visible:true}
                // })
            }
        }
    },
    methods:{
        ...mapMutations({
            UPDATE_LAYER_OPTIONS:"layer/layer/UPDATE_LAYER_OPTIONS"
        }),
		guessFwIcon(name){
			if(/風/.test(name)) return "wind"
			else if(/海/.test(name)) return "water"
        },
        openLyr(toActiveLayr){
            this.freezedLayer.forEach(lyr => {
                let bool = lyr===toActiveLayr
                this.$LayerIns.setVisible(lyr.id,bool)
                this.UPDATE_LAYER_OPTIONS({
                    id:lyr.id,
                    payload:{visible:bool}
                })
            })
            this.activedLayer = toActiveLayr
            this.otherVisibility = false
        },
        disableAllLyr(){
            this.freezedLayer.forEach(lyr => {
                this.$LayerIns.setVisible(lyr.id,false)
            })
            this.activedLayer = null
        }
    }
}
</script>

<style lang="scss" scoped >

	.layerWeather{
        position: absolute !important;
        left: auto;
        right: 0;
        width: auto;

        padding:0.5rem 1rem;

		border-radius: 1rem;
		margin-top:1rem;
        pointer-events: auto;
        background-color: rgba($black,0.7);
        color:#fff;
        transition: all 0.2s ease;

        &__current {
            display:flex;
            align-items:center;
            justify-content:space-between;
            @media screen and (max-width:576px){
            small {
                display: none;
            }
        }
        }

        &__other{
            height:100%;
        }

        &__item{
            margin:0 1rem; 
			display: flex;
            align-items: space-between;
            flex-direction: column;
			justify-content: center;
        }

    }

</style>