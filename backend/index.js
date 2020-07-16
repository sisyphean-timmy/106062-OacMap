const express = require('express');
const app = express();
const fs = require('fs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({ type: 'application/json' })); // for parsing application/json

const fetch = require("C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\node-fetch\\lib\\index.js")
const NetCDFReader = require("C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\netcdfjs\\dist\\netcdfjs.js")
const Cron = require("C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\cron\\lib\\cron.js")

const XmlParser = require("C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\xml-js\\lib")


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    // res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json");
    next();
});

/**
 * 取得 cwb UCURR
 * 
 * 海流
 * 鹽度
 * 溫度
 * 浪高
 * 
 */
app.get('/UCURR', async(req, res) => {
    const result = (await fetchNCUV())
    res.send(result)
})

app.get("/proxy", async(req, res) => {
    const result = await (await fetch(req.query.url)).text()
    const resultJsonStr = XmlParser.xml2json(result, {
        compact: true,
        spaces: 4
    })

    res.send(resultJsonStr)
})

const fetchNCUV = async({
    date = 20200707,
    time = 0
}) => {
    try {
        const uurl = `http://med.cwb.gov.tw/opendap/hyrax/OCM/${date}/00/9999/UCURR.${date}00.nc.nc?UCURR[0:1:${time}][0:1:0][0:1:1160][0:1:640]`
        const ustream = await fetch(uurl)
        const uArrayBuffer = await (await ustream.blob()).arrayBuffer()
        let uReader = new NetCDFReader(uArrayBuffer); // read the header

        const vurl = `http://med.cwb.gov.tw/opendap/hyrax/OCM/${date}/00/9999/VCURR.${date}00.nc.nc?VCURR[0:1:${time}][0:1:0][0:1:1160][0:1:640]`
        const vstream = await fetch(vurl)
        const vArrayBuffer = await (await vstream.blob()).arrayBuffer()
        let vReader = new NetCDFReader(vArrayBuffer); // read the header

        let result = [{
            header: {
                parameterCategory: 2,
                parameterNumber: 2,
                scanMode: 0,
                nx: 0,
                ny: 0,
                lo1: 0,
                la1: 0,
                lo2: 0,
                la2: 0,
                dx: 0,
                dy: 0
            },
            data: []
        }, {
            header: {
                parameterCategory: 2,
                parameterNumber: 3,
                scanMode: 0,
                nx: 0,
                ny: 0,
                lo1: 0,
                la1: 0,
                lo2: 0,
                la2: 0,
                dx: 0,
            },
            data: []
        }]
        const uvReader = [uReader, vReader].entries()
        for (let [index, uv] of uvReader) {
            for (let variable of uv.variables) {
                switch (variable.name) {
                    case "time":
                        result[index]["header"]["refTime"] = variable.attributes[0].value
                        break;
                    case "lat":
                        result[index]["header"]["la1"] = variable.attributes.find(i => i.name === "maximum").value
                        result[index]["header"]["la2"] = variable.attributes.find(i => i.name === "minimum").value
                        result[index]["header"]["dy"] = variable.attributes.find(i => i.name === "resolution").value
                        result[index]["header"]["ny"] = ((result[index]["header"]["la1"] - result[index]["header"]["la2"]) / result[index]["header"]["dy"]) + 1
                        break;
                    case "lon":
                        result[index]["header"]["lo1"] = variable.attributes.find(i => i.name === "minimum").value
                        result[index]["header"]["lo2"] = variable.attributes.find(i => i.name === "maximum").value
                        result[index]["header"]["dx"] = variable.attributes.find(i => i.name === "resolution").value
                        result[index]["header"]["nx"] = ((result[index]["header"]["lo2"] - result[index]["header"]["lo1"]) / result[index]["header"]["dx"]) + 1
                        break;
                    case "UCURR":
                    case "VCURR":
                        result[index]["data"] = uv.getDataVariable(variable).map(v => (v === -999) ? "" : v)
                        break;
                }
            }
        }
        return result
    } catch (e) {
        console.error(e)
    }
}

const convetNCFile = async() => {

    /**
     * 1. second(option)
     * 2. minute
     * 3. hour
     * 4. day
     * 5. month
     * 6. day of week
     */
    let CronJob;

    let onTick = async() => {

        CronJob.stop()

        const NOW = new Date()
        const Y = NOW.getFullYear()
        const M = NOW.getMonth() + 1
        const D = NOW.getDate()
        const DateStr = `${Y}${M>9?M:'0'+M}${D>9?D:'0'+D}`

        console.log(`[schedule task : convet nc to json , now ${DateStr}]`)

        const DIR = "backend/ocm"
        if (!fs.existsSync(DIR)) {
            fs.mkdirSync(DIR)
        }

        let hours = 5
        while (hours >= 0) {
            console.log(`[${DIR}/${DateStr}${hours}.json] save success`)
            try {
                const data = JSON.stringify(await fetchNCUV({
                    date: DateStr,
                    time: hours
                }))
                await new Promise((res, rej) => {
                    fs.writeFile(
                        `${DIR}/${DateStr}${hours}.json`,
                        data,
                        err => err ? rej(err) : res()
                    )
                })
                hours -= 1
            } catch (e) {
                console.error(e)
            }
        }

        CronJob.start()
    }

    CronJob = new Cron.CronJob({
        cronTime: '10 * * * * *',
        onTick: onTick,
        start: true
    })

}


app.listen(3000, () => {

    console.log("server is runing at 3000")

    // convetNCFile()

})