const webWorker: Worker = self as any

webWorker.addEventListener('message', ({data}:any)=>{
    webWorker.postMessage({
        foo: 'boo'
    })
})
