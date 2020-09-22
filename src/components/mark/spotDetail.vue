<template lang="pug">
.spot
    img.spot__logo(:src="require('@/assets/spotIcons/default.png')")
    p {{description}}
    el-divider
    h4 設施
    .spot__facilities
        .spot__facilities__item(v-for="item in facilities")
            img(:src="getIconPath(item)")
    el-divider
    h4 開放時間
    .spot__time(v-for="t in time") 
        strong {{t.slice(0,3)}}
        span {{t.slice(3,t.length)}}
    el-divider
    div(style="display:flex;justify-content:space-between:")
        div
            font-awesome-icon(icon="map-pin" fixed-width style="margin-right:1rem;")
            strong 地址
        span {{address}}
    div(style="display:flex;justify-content:space-between:")
        div
            font-awesome-icon(icon="phone" fixed-width style="margin-right:1rem;")
            strong 電話
        span {{tel}}

    .spot__link
        .spot__link__item(
            v-for="l in links" 
            :key="l.label"
        )
            font-awesome-icon(:icon="l.icon" fixed-width style="margin-right:1rem;")
            el-link(
                :href="l.value"
                target="_blank"
            )
                strong {{l.label}}

</template>

<script>

export default {
    name:"spot",
    data:()=>({
    }),
    props:{
        description:{
            type:String,
            default: "海洋委員會是中華民國政府的中央行政機關，隸屬於行政院，2018年4月28日成立。負責中華民國總體海洋政策、海域安全、海岸管理、海洋保育及永續發展、海洋科技研究與海洋文教政策。是第一個設立在南臺灣的中央部會單位。"
        },
        facilities:{
            type: Array,
            default:()=>(["AED","廁所","育嬰室","無障礙","wifi","服務台","電梯"])
        },
        time:{
            type:Array,
            default:()=>([
                "星期一08:00 ~ 17:00",
                "星期二08:00 ~ 17:00",
                "星期三08:00 ~ 17:00",
                "星期四08:00 ~ 17:00",
                "星期五08:00 ~ 17:00",
                "星期六休息",
                "星期日休息"
            ])
        },
        // address
        address: {
            type:String,
            default: "806高雄市前鎮區成功二路25號4樓"
        },
        // phone
        tel:{
            type:String,
            default: "(07)3381-810"
        },
        links:{
            type:Array,
            default: ()=>[{
                    icon: ["fab","facebook"],
                    label:"臉書粉專",
                    value:"https://www.facebook.com/oactw"
                },
                {
                    icon:["fas","globe"],
                    label:"Website",
                    value:"https://www.oac.gov.tw"
                },
                {
                    icon:"map-pin",
                    label:"設施地圖",
                    value:""
                },
                {
                    icon: ["fab","youtube"],
                    label:"介紹影片",
                    value:"https://youtu.be/GPcyzhAUye8"
                },
                {
                    icon:"paperclip",
                    label:"相關連結",
                    value:""
            }]
        }
    },
    methods:{
        getIconPath(name){
            const en = {
                "AED":"aed",
                "廁所":"restrooms",
                "育嬰室":"baby",
                "無障礙":"wheelchair",
                "wifi":"wi-fi",
                "服務台":"information",
                "電梯":"elevator"
            }
            return require(`@/assets/spotIcons/${en[name]}.svg`)
        }
    },
}
</script>

<style lang="scss" scoped>
    /deep/{
        .el-divider--horizontal{
            margin: 0.5rem 0;
        }
    }
    .spot {
        color: $info;
        h4 {
            color: darken($info,30);
        }
        &__logo{
            width:100%;
            max-width: 200px;
            display: block;
            margin:0 auto;
        }
        &__facilities{
            display: flex;
            &__item{
                &:not(:nth-of-type(1)){
                    margin-left: 0.2rem;
                }
                img {
                    width: 2rem;
                    height: 2rem;
                }
            }
        }
        &__time{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        &__link{
            display: flex;
            flex-direction: column;
            &__item{
                display: flex;
                align-items: center;
                justify-content: flex-start;
            }
        }
    }
</style>