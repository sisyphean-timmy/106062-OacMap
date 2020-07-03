<template lang="pug">
    .navbar
        
        el-button(round :size="size" title="切換到 WINDY 地圖" style="padding:0 1rem;" @click="SET_WINDY_OPTION({visible:true})")
            img(src="@/assets/windy.png" style="width:4rem;display:block;")
            
        el-button(@click="dialogTitle='相關連結';dialogVisible = true" title="相關連結" :size="size" type="text")
            font-awesome-icon(icon="link" fixed-width) 
            small(v-if="!(isAndroid || isIOS)" style="margin-left:0.15rem;") 相關連結

        el-button(@click="dialogTitle='使用條約';dialogVisible = true" title="使用條約" :size="size" type="text")
            font-awesome-icon(icon="info" fixed-width) 
            small(v-if="!(isAndroid || isIOS)" style="margin-left:0.15rem;") 使用條約

        el-button(@click="dialogTitle='活動申請';dialogVisible = true" title="活動申請" :size="size" type="text")
            font-awesome-icon(icon="bell" fixed-width) 
            small(v-if="!(isAndroid || isIOS)" style="margin-left:0.15rem;") 活動申請

        template(v-if="isAndroid || isIOS")
            el-button(@click="dialogTitle='加至主畫面說明';dialogVisible = true" title="加至主畫面說明" :size="size" type="text")
                font-awesome-icon(icon="plus-square" fixed-width) 
                //- small(v-if="!isMobile" style="margin-left:0.15rem;") 加至主畫面說明

        el-button(@click="oplink('https://docs.google.com/forms/d/e/1FAIpQLScf7at41snW4-ZczKN3p2hR8M9VKj_Af82BWEsZg6uPfwnY3Q/viewform')" title="意見回饋" :size="size" type="text")
            font-awesome-icon(icon="envelope" fixed-width) 
            small(v-if="!(isAndroid || isIOS)" style="margin-left:0.15rem;") 意見回饋

        small(style="padding:0 0.5rem;color:#fff;") 
            span(style="margin-right:0.5rem;")
                //- font-awesome-icon(icon="eye") 
                | 瀏覽人次
            | {{pageviews}}

        //- DIALOG
        el-dialog(
            :title="dialogTitle"
            v-if="dialogVisible"
            @close="dialogVisible = false"
            visible
            show-close
            append-to-body	
            center
        ) 
            
            template(v-if="dialogTitle === '加至主畫面說明'")
                el-carousel(trigger="click" type="card" indicator-position="outside" arrow="never" :autoplay="false")
                    el-carousel-item(v-for="src,key in guideStepModel" :key="key")
                        img(:src="src" style="width:100%;")
                        h3(style="text-align: center;") 步驟 {{key+1}}

            template(v-if="dialogTitle === '相關連結'")
                photoLink(:links="links")

            template(v-if="dialogTitle === '活動申請'")
                div(style="display:flex;flex-wrap:wrap;")
                    el-card(style="flex:1 0 200px;margin: 0.5rem;")
                        el-link(type="primary" style="margin-right:0.5rem;" icon="el-icon-link" @click="oplink('https://www.beclass.com/share/202001/8248179058427bkv_0.pdf')")
                            h2 基隆市島礁磯釣活動
                        p(style="flex:0 0 60%;") 基隆市政府、基隆區漁會
                    el-card(style="flex:1 0 200px;margin: 0.5rem;")
                        el-link(type="primary" style="margin-right:0.5rem;" icon="el-icon-link" @click="oplink('https://ftz.mtnet.gov.tw/YBerth/Portal/sys_a/a01/a0103')")
                            h2 遊艇申辦服務平台
                        p(style="flex:0 0 60%;") 泊位資訊查詢、遊艇進出港申請、泊位申請
                    el-card(style="flex:1 0 200px;margin: 0.5rem;")
                        el-link(type="primary" style="margin-right:0.5rem;" icon="el-icon-link" @click="oplink('https://www.necoast-nsa.gov.tw/coast/')")
                            h2 東北角龜山島登島
                        p(style="flex:0 0 60%;") 龜山島各項申請查詢作業、船舶資訊、法規資訊、登島表單之線上申請系統
                    el-card(style="flex:1 0 200px;margin: 0.5rem;")
                        el-link(type="primary" style="margin-right:0.5rem;" icon="el-icon-link" @click="oplink('https://www.tjnp.gov.tw/PublicInformationDetail.aspx?Cond=83713bde-e4e4-4f5c-a8ad-ed4cc0d60c34')")
                            h2 台江國家公園水域
                        p(style="flex:0 0 60%;") 遊憩活動申請須知及相關附件

            template(v-if="dialogTitle === '使用條約'")
                div(style="padding:0 1rem;")
                    p 本系統係為便利一般民眾單站視覺化查詢海域遊憩活動相關規定，所呈現之法規、公告資料為各主管機關、各縣市政府所提供資料彙整而得，因各主管機關、各縣市資料建置時間之差異及建檔品質，與實際公告或有不同，實際內容仍依各主管機關、各縣市政府公告為準。
                    p 使用者不得將本系統所提供之資料內容或查詢結果作為任何形式之依據或主張，本會對於所有資料內容之正確性及完整性，皆不負擔保之責。使用者如因使用本系統之資料而受損害或損失，或因此導致使用者或第三人遭受損害或損失而遭求償者，本系統管理機關及各資料提供機關不負任何賠償或補償之責。
                    p 若屬全面性禁止事項或禁止採捕海域動、植物，例如海洋保育署公告之保育物種、漁業署公告之禁用漁法或禁止採捕魚種，即使沒在個別海域之法令中敘述，仍屬應遵守之規定。
                    p 使用者進入本系統，視同同意上開使用規範。本系統所有資料僅限正常查詢、瀏覽使用，未經本會同意之大量抄錄或複製資料行為，將依違反著作權法及妨礙電腦使用罪辦理
                    el-divider
                    small 本系統版權及管理機關為海洋委員會。

</template>

<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'
import photoLink  from "@/components/common/photoLink"

export default {
    name:"navbar",
    components:{
        photoLink
    },
    props:{
        isMobile:{
            type:Boolean,
            default:false
        }
    },
    computed:{
        ...mapGetters({
            commonState:"common/common/state",
            sortableLayer:"layer/layer/sortableLayer",
            freezedLayer:"layer/layer/freezedLayer",
        }),
        activedSubject(){
            return this.commonState("activedSubject")
        },
        subjects(){
            return this.commonState("subjects")
        },
        size(){
            return this.isMobile ? 'mini' : 'medium'
        },
        isAndroid(){
            const u = navigator.userAgent
            return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
        },
        isIOS(){
            return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
        },
        guideStepModel(){
            if(this.isAndroid) return this.androidGuides
            if(this.isIOS) return this.iosGuides
        }
    },
    async mounted(){
        const {pageviews,users} = await this.getGACount()
        this.pageviews = pageviews
    },
    data:()=>({
        dialogTitle:"",
        dialogVisible:false,
        pageviews:0,
        links:[
            {
                title:"娛樂漁船",
                link:"https://www.fa.gov.tw/cht/LawsCentralFisheries/content.aspx?id=17&chk=76cc8fe4-de25-4a4f-8a46-bdfd838601cc&param",
                bg: require('@/assets/fishBoat.jpg'),
            },
            {
                title:"賞鯨活動",
                link:"https://www.oac.gov.tw/ch/index.jsp",
                bg: require('@/assets/whale.jpg'),
            },
            {
                title:"藍色公路",
                link:"https://www.cwb.gov.tw/V8/C/M/bluehighway_home.html",
                bg: require('@/assets/blueHighway.jpg'),
            },
            {
                title:"撿拾漂流木",
                link:"https://www.forest.gov.tw/Driftwood",
                bg: require('@/assets/wood.jpg'),
            },
            {
                title:"遊艇活動",
                link:"https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0070069",
                bg: require('@/assets/yacht.jpg'),
            },
            {
                title:"目前公告禁止或限制水域遊憩活動海域範圍",
                link:"https://ocean.taiwan.gov.tw/oacmap/1090210_%E5%85%AC%E5%91%8A%E7%A6%81%E6%AD%A2%E6%88%96%E9%99%90%E5%88%B6%E6%B0%B4%E5%9F%9F%E9%81%8A%E6%86%A9%E6%B4%BB%E5%8B%95%E6%B5%B7%E5%9F%9F%E7%AF%84%E5%9C%8D.pdf",
                bg: require('@/assets/danger.jpg'),
            },
            {
                title:"海域保險專區",
                link:"http://www.nlia.org.tw/modules/tadnews/page.php?ncsn=130#A",
                bg: require('@/assets/insurance.jpg'),
            },
        ],
        iosGuides:[
            require("@/assets/guide/guidi1.jpg"),
            require("@/assets/guide/guidi2.jpg"),
            require("@/assets/guide/guidi3.jpg"),
            require("@/assets/guide/guidi4.jpg")
        ],
        androidGuides:[
            require("@/assets/guide/guida1.jpg"),
            require("@/assets/guide/guida2.jpg"),
            require("@/assets/guide/guida3.jpg"),
            require("@/assets/guide/guida4.jpg")
        ]
    }),
    methods:{
        ...mapActions({
            getGACount: "common/common/getGACount",
        }),
        ...mapMutations({
            SET_WINDY_OPTION:"common/common/SET_WINDY_OPTION",
        }),
        oplink(link){
            window.open(link,"_blank")
        },
        closeDialog(){
            this.dialogTitle = ''
            this.dialogVisible = false
        }
    }
}
</script>

<style lang="scss" scoped>

/deep/ {
    .el-input__inner{
        border-radius: 2rem;
    }
    .marker-cluster{
        background-color: $primary !important;
        &> div{
            background-color: darken($primary,10) !important;
        }
    }
}

.navbar{
    display: flex;
    align-items: center;
    background-color: rgba($black,0.7);
    border-radius: 10rem;
    transition:all 0.1s ease;
    bottom: auto;
    left: auto;
    overflow-x: auto;
    box-shadow: 0 0px 8px 5px rgba(0,0,0,0.2);
    button{
        padding: 0.5rem 0.8rem;
        margin: 0;
        cursor: pointer;
        border:0;
        color:$white;
        display: flex;
        white-space: nowrap;
    }
    button:not(:nth-of-type(1)){
        background-color:transparent;
    }
}

</style>