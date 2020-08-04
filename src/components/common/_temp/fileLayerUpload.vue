<template>
  
</template>

<script>

import {Chrome as ChromeColor } from "vue-color"

export default {
    name:"fileLayerUpload",
    components:{
        ChromeColor
    },
    data:()=>({
        fileList:[],
		uidColorStyling:"",
		color:{
			hex: "#194d33",
			hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
			hsv: { h: 150, s: 0.66, v: 0.30, a: 1 },
			rgba: { r: 25, g: 77, b: 51, a: 1 },
			a: 1
		},
    }),
    props:{

    },
    computed:{
        colorModel(){
			const uid = this.uidColorStyling || this.fileList[0].uid
			return this.fileList.find(f=>f.uid === uid).style.color
		}
    },
    methods:{
        /** file upload handles */
		changeColor(evt){
			const uid = this.uidColorStyling || this.fileList[0].uid
			console.log("color change", evt)
			this.color = evt
			const f = this.fileList.find(f=>f.uid === uid)
			f.style.color = evt
		},
		removeFile(uid){
			const f = this.fileList.find(f=>f.uid === uid)
			const i = this.fileList.indexOf(f)
			if(i>=0){
				this.fileList.splice(i,1)
			}
		},
		fileChange(f,fl){
			console.log("f",f)
			console.log("file list",fl)
			f.style = {
				color:this.color
			}
			this.fileList.push(f)
		}
    }
}
</script>

<style>

</style>