<template lang="pug">

div
    el-table(:data="tableData")
        el-table-column(prop="label" width="70")

        el-table-column(v-for="t in timeRow" :label="t" :key="t")
            el-row(slot-scope="scope")
                div(style="display:flex;align-items:center;")
                    template(v-if="scope.row.label === '天氣'")
                        img(:src="`${scope.row[t].src}`"  ref="icon" style="height:2rem;height:2rem;margin-right:0.5rem;")
                    strong {{scope.row[t].parameterName}}

    small(style="float:right;")
        small(v-for="v in tableData" v-if="Object.values(v)[1].parameterUnit" style="margin-left:1rem;")
            | {{Object.values(v)[0]}} ( {{Object.values(v)[1].parameterUnit}} )

</template>

<script>

export default {
    name:"coastWeather",
    props:['data'],
    computed:{
        locationName(){
            return this.data.locationName
        },
        weatherElement(){
            return this.data.weatherElement
        },
        Wx(){
            return this.weatherElement.find(({elementName})=>elementName === "Wx")['time'].map(({endTime,startTime,parameter})=> ({
                endTime:new Date(endTime).toLocaleDateString(),
                startTime:new Date(startTime).toLocaleDateString(),
                parameter
            }))
        },
        WindDir(){
            return this.weatherElement.find(({elementName})=>elementName === "WindDir")['time'].map(({endTime,startTime,parameter})=> ({
                endTime:new Date(endTime).toLocaleDateString(),
                startTime:new Date(startTime).toLocaleDateString(),
                parameter
            }))
        },
        WindSpeed(){
            return this.weatherElement.find(({elementName})=>elementName === "WindSpeed")['time'].map(({endTime,startTime,parameter})=> ({
                endTime:new Date(endTime).toLocaleDateString(),
                startTime:new Date(startTime).toLocaleDateString(),
                parameter
            }))
        },
        WaveHeight(){
            return this.weatherElement.find(({elementName})=>elementName === "WaveHeight")['time'].map(({endTime,startTime,parameter})=> ({
                endTime:new Date(endTime).toLocaleDateString(),
                startTime:new Date(startTime).toLocaleDateString(),
                parameter
            }))
        },
        WaveType(){
            return this.weatherElement.find(({elementName})=>elementName === "WaveType")['time'].map(({endTime,startTime,parameter})=> ({
                endTime:new Date(endTime).toLocaleDateString(),
                startTime:new Date(startTime).toLocaleDateString(),
                parameter
            }))
        },
        tableData(){
            const WxData = {}
            for (const {startTime,parameter} of this.Wx) {
                WxData[startTime] = {
                    ...parameter,
                    src:`https://www.cwb.gov.tw/V8/assets/img/weather_icons/weathers/svg_icon/day/${parameter.parameterValue}.svg`
                }
            }
            const WindDirData = {}
            for (const {startTime,parameter} of this.WindDir) {
                WindDirData[startTime] = parameter
            }
            const WindSpeedData = {}
            for (const {startTime,parameter} of this.WindSpeed) {
                WindSpeedData[startTime] = parameter
            }
            const WaveHeightData = {}
            for (const {startTime,parameter} of this.WaveHeight) {
                WaveHeightData[startTime] = parameter
            }
            const WaveTypeData = {}
            for (const {startTime,parameter} of this.WaveType) {
                WaveTypeData[startTime] = parameter
            }
            const res =  [
                {label:"天氣", ...WxData },
                {label:"風向", ...WindDirData },
                {label:"風力", ...WindSpeedData },
                {label:"浪高", ...WaveHeightData },
                {label:"海浪", ...WaveTypeData }
            ]
            console.log("[res]",res)
            return res
        },
        timeRow(){
            return this.Wx.map(({startTime})=>startTime)
        }
    },
    data:()=>({}),
    methods:{},
    async updated(){
        // hide img while 404
        for (const el of this.$refs.icon) {
            el.onload = ()=>{
                console.log("[icon success]")
            }
            el.onerror = ()=>{
                console.log("[icon error]")
                el.style.display = "none"
            }
        }
    },
    mounted(){
        const {locationName,weatherElement} = this.data
        console.log(locationName,weatherElement)
    }
}
</script>

<style lang="scss" scoped>

</style>