export default {
    /**
     * 確保以下事情 :
     * # 要高亮的文字有父節點(有 HTML Node 非 Text Node)
     * # VUE 中若有使用迭代，迭代項目必須加上"唯一 KEY 值"， 使之能夠重新渲染
     */
    bind(el, binding) {

        let str = binding.value.replace(/(\W)/g, "\\$1") // 替換特殊字
        let reg = new RegExp(str, "ig")
        let all = el.getElementsByTagName("*")

        all.forEach(element => {

            let initNodeList = element.querySelectorAll("span#hightLight")
            if (initNodeList.length) {
                initNodeList.forEach(el => el.outerHTML = el.innerText)
            }

            if (binding.value && reg.test(element.innerText) && !element.children.length) {
                element.innerHTML = element.innerText.replace(reg, "<span id='hightLight' style='background:yellow;color:#000;'>$&</span>")
            }

        })

    }
}