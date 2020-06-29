<template lang="pug">

.tools
    el-button(
        circle
        type="primary" 
        @click="SET_CARD_VISIBLE({key:'layer',bool:!layerVisibility})"
    )
        font-awesome-icon(icon="layer-group" fixed-width size="lg")
    
    //- 經緯定位
    //- el-button(
    //- 	circle 
    //- 	type="primary" 
    //- 	title="定位"
    //- 	@click="dialogTitle='定位';dialogVisible=true"
    //- )
    //- 	font-awesome-icon(icon="map-marker-alt" fixed-width)

    el-button.tools__result(
        circle  
        :disabled="!allResultLength"
        @click="SET_CARD_VISIBLE({key:'result',bool:!resultVisibility})"
    )
        .tools__result__num(
            :class="{'tools__result__num--active':allResultLength}" 
        ) {{allResultLength}}
        font-awesome-icon(icon="info" fixed-width size="lg")

    el-button(
        circle
        @click="locateCurrent()"
    )
        font-awesome-icon(icon="crosshairs" fixed-width size="lg")

</template> 

<script>

import Vue from 'vue'
import {mapGetters,mapActions, mapMutations} from 'vuex'

export default {
	name:"tools",
	props:{
    },
	data:()=>({
	}),
	computed:{
		...mapGetters({
			isMobile:"common/common/isMobile",
			allResultLength:"result/result/allResultLength",
			commonState:"common/common/state"
		}),
		layerVisibility(){
			return  this.commonState("layerCardVisible")
		},
		resultVisibility(){
			return  this.commonState("resultCardVisible")
		},
	},
	methods:{
		...mapMutations({
			SET_CARD_VISIBLE:"common/common/SET_CARD_VISIBLE",
		}),
		async locateCurrent(){
			await this.$InitIns.toCurrentLocation()
		}
	}
}
</script>

<style lang="scss" scoped>
    
	.tools{
		display:flex;
		flex-direction:column;
		button{
			margin:0.5rem 0;
			width:3.2rem;
            height:3.2rem;
			display:flex;
			align-items:center;
			justify-content: center;
			box-shadow:0 0 8px 4px rgba(0,0,0,0.15);
        }
        &__result{
            position: relative;
            &__num{
                position:absolute;
                right: -0.5rem;
                top: 0;
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
    }
	
	.content-card{
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
			&>.el-card__body{ // layer sorting
				height: 100%;
				display:flex;
				flex-direction: column;
				box-sizing: border-box;
			}
		}
	}

</style>
