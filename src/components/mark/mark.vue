<template lang="pug">

    transition(name="fade")
        el-card(v-if="data")
            span {{data}}

</template>

<script>
export default {
    name:"mark",
    props:{
        data:{
            default:null
        }
    },
    data:()=>({
        
    }),
    mounted(){
        console.log(this)
    }
}
</script>

<style lang="scss" scoped>

</style>