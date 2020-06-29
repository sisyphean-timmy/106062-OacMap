const marqueeTimeRamp = 15

export default {
    bind(el, binding, vnode) {

        //- force set style 
        el.style.cssText = `
            display:block;
            overflow:hidden;
            textOverflow:ellipsis;
            white-space: nowrap;
        `

        let interval = null

        el.onmouseenter = () => {

            clearInterval(interval)

            if (!el) return

            el.style.textOverflow = 'unset'

            //- 文字沒溢出
            if (Math.abs(el.clientWidth - el.scrollWidth) <= 0) return

            interval = setInterval(() => {
                el.scrollLeft++
            }, marqueeTimeRamp)
        }

        el.onmouseleave = () => {
            clearInterval(interval)
            el.style.textOverflow = 'ellipsis'
            el.scrollLeft = 0
        }

    },
}