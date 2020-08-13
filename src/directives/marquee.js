const marqueeRamp = 2
const marqueeFPS = 10

export default {
    bind(el, binding, vnode) {

        // console.log("[vue marquee directive binding]", binding)

        //- force set style 
        el.style.cssText = `
            max-width:${binding.value.width};
            display:block;
            overflow:hidden;
            textOverflow:ellipsis;
            white-space: nowrap;
        `

	const FRAME_TIME = 1000 / marqueeFPS;
        let requestAnimationFrame = window.requestAnimationFrame || function (fn) { return setTimeout(fn, FRAME_TIME)}
	let cancelAnimationFrame = window.cancelAnimationFrame || clearInterval

	let animationLoop;
	let then = Date.now();
	let frame = function () {
		animationLoop = requestAnimationFrame(frame);
		var now = Date.now();
		var delta = now - then;
		if (delta > FRAME_TIME) {
			then = now - (delta % FRAME_TIME);
			update()
		}
	};

	let update = function () {
		//- 文字沒溢出
		if (Math.abs(el.clientWidth - el.scrollWidth) <= 0) return
		if ((el.clientWidth - el.scrollWidth + el.scrollLeft) === 0) { // end
			el.scrollLeft = 0
		}
		el.scrollLeft += marqueeRamp
	}

        if (binding.value.play) { // auto playMode
            frame()
            return
        }

        el.onmouseenter = () => {

            cancelAnimationFrame(animationLoop)

            if (!el) return

            el.style.textOverflow = 'unset'

            //- 文字沒溢出
            if (Math.abs(el.clientWidth - el.scrollWidth) <= 0) return

            frame()
        }

        el.onmouseleave = () => {
            cancelAnimationFrame(animationLoop)
            el.style.textOverflow = 'ellipsis'
            el.scrollLeft = 0
        }

    },
}
