<template lang="pug">

.timeSilder
    input(
        type="range" 
        min="1" 
        max="7" 
        steps="1" 
        value="1"
    )
    //- el-slider(
    //-     v-model="value"
    //-     :step="10"
    //- )

</template>

<script>

export default {
    name:"timeSilder",
    data:()=>({
        value: 50,
    }),
    props:{
        width:{
            type:Number,
            default: 400
        }
    }
}

</script>

<style lang="scss" scoped>
.timeSilder{
    // position: fixed;
    // bottom: 1rem;
    // right: 1rem;
    // left: auto;
    // top: auto;
}
/deep/ {
    .el-slider{
        &__bar{
            height:1rem;
        }
        &__runway{
            height:1rem;
        }
    }
}
</style>