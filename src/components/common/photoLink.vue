<template lang="pug">
    .items
        a.item(v-for='val in links' :href='val.link' target="blank")
            h3  {{ val.title }}
            .img-wrapper-outer
                .img-wrapper(:style="{backgroundImage: 'url(' + val.bg + ')'}")
            .tag(
                v-if="val.tag"
                :style="{backgroundColor:val.tagcolor}"
            ) {{ val.tag }}
</template>

<style lang="scss" scoped>

    $yellow2:#cc9966;
    $blue2:#66cccc;
    $yellow3:#ffcc66;

    .items{
        display: flex;
        flex-wrap: wrap;
        a.item{
            border-radius: 3px;
            color: #fff;
            padding: 1.5rem;
            margin: 0.5rem;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 6rem;
        }
        .tag{
            color: #222;
            border-radius: 1rem;
            font-weight: bold;
            position: absolute;
            right: -0.5rem;
            bottom: -0.5rem;
            padding: 0.5rem;
        }
        h3{
            z-index: 1;
            transition: all .3s ease-out;
            line-height: 150%;
        }
    }
    a.item{
        flex: 1 0 200px;
        @media screen and (max-width: 768px) {
            flex: 1 0 150px;
        }
        @media screen and (max-width: 425px) {
            flex: 1 1 100%;
        }
    }
    .img-wrapper-outer{
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 1rem;
        .img-wrapper{
            height: 100%;
            width: 100%;
            transition: all .3s ease-in-out	;
            background-position: center center;
            background-size:cover;
            background-repeat:no-repeat;
            &:before{
                content: "";
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                right: 0;
                background-color: rgba(0,0,0,0.35);
                transition: all .3s ease-out;
            }
        }
    }
    a.item:hover{
        h3{
            transform: scale(1.15);
            transition: all .4s ease-in-out	;
        }
        .img-wrapper{
            transform: scale(1.1);
            transition: all .3s ease-in-out	;
            &:before{
                background-color: rgba(0,0,0,0);
                transition: all .3s ease-in;
            }
        }
    }
</style>

<script>

export default {
    name: 'photoLinks',
    components:{},
    props:{
        links:{
            type:Array
        }
    }
}
</script>
