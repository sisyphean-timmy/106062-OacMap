const marqueeTimeRamp = 15

export default {
    bind(el, binding, vnode) {

        console.log("marquee binding", binding)

        //- force set style 
        el.style.cssText = `
            max-width:${binding.value.width};
            display:block;
            overflow:hidden;
            textOverflow:ellipsis;
            white-space: nowrap;
        `

        let interval = null

        if (binding.value.play) { // auto playMode
            interval = setInterval(() => {
                if ((el.clientWidth - el.scrollWidth + el.scrollLeft) === 0) { // end
                    el.scrollLeft = 0
                }
                el.scrollLeft++
            }, marqueeTimeRamp)
            return
        }

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