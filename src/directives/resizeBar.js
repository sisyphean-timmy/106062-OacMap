let resizeBar = null
let defalutWidth = 0

export default {
    createElm(el) {
        resizeBar = document.createElement("div")
        resizeBar.style.cssText = `
            width: 0.8rem;
            height: 100%;
            position: fixed;
            top: 0;
            right: auto;
            bottom: auto;
            cursor: ew-resize;
            left: ${el.offsetWidth+el.offsetLeft}px;
            background-color: #f7f7f7;
            z-index: 99;
            display:flex;
            justify-content: center;
            align-items:center;
            border-top-right-radius: 0.7rem;
            border-bottom-right-radius: 0.7rem;
        `
        

        resizeBar.innerHTML = `
            <hr style="height:2rem;color:#000;">
            <hr style="height:2rem;color:#000;">
        `
        el.style.willChange = 'width,left' //- improve performance

        let start = false
        let max = window.innerWidth * 0.9
        let min = defalutWidth
        resizeBar.onmousedown = evt => {
            start = true
        }
        window.onmousemove = evt => {
            el.style.transition = "none"
            if (start && evt.clientX <= max && evt.clientX >= min) {
                el.style.width = evt.clientX - el.offsetLeft + "px"
                resizeBar.style.left = evt.clientX + "px"
            }
        }
        resizeBar.onmouseup = evt => {
            start = false
            el.style.transition = ''
        }
        window.onmouseup = evt => {
            start = false
            el.style.transition = ''
        }
        el.appendChild(resizeBar)
    },
    componentUpdated(el, binding, vnode) {
        if (!binding.value) {
            el.style.width = defalutWidth + "px" //- restore default width
            el.contains(resizeBar) && el.removeChild(resizeBar) //- clear resizeBar
            return
        }

        if (!el.contains(resizeBar)) binding.def.createElm(el)
    },
    inserted(el, binding, vnode) {

        defalutWidth = el.clientWidth //- save default width when inserted()
        console.log(defalutWidth)
        if (!binding.value) {
            return
        }

        if (!el.contains(resizeBar)) binding.def.createElm(el)

    }
}