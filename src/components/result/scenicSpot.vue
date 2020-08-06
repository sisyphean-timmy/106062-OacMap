<template lang="pug">
    el-select(
        style="width:200px;"
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
            el-button(
                style="position:absolute;"
                circle
                type="primary" 
            )
                .tools__button
                    font-awesome-icon(icon="search" fixed-width size="lg")
</template>

<script>
export default {
    name:"scenicSpot",
    
}
</script>

<style>

</style>