const express = require('express');
const app = express();
const fs = require('fs');
const fetch = require("node-fetch")
const NetCDFReader = require("netcdfjs")
const Cron = require("cron")
const XmlParser = require("xml-js")
const ZIP = require("node-zip")
const Togeojson = require('togeojson')

const bodyParser = require('body-parser');
const { count } = require('console');

app.use('/demo', express.static('demo'))
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({ type: 'application/json' })); // for parsing application/json
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    // res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json");
    next();
});
app.get("/PROXY", async(req, res) => {
    const result = await (await fetch(req.query.url)).json()
    /** request SafeSee data : 異常波浪潛勢 : 0 取代為 空字串，表示無資料 */
    // if (/SafeSee/g.test(req.query.url) && !(/index/g.test(req.query.url))) {
    //     if (/SafeSeeOFW_risk_Now/g.test(req.query.url)) {
    //         result[0].data = result[0].data.map(i => i === 0 ? '' : i)
    //     }
    // }
    res.send(result)
})

app.get("/typhoon", async(req, res) => {
    res.send(await handleCWBTyphoonData())
})

const handleCWBTyphoonData = async()=>{
    try{
        
        // TEST
        // const data = fs.readFileSync("typhoon/W-C0034-002.kmz")

        const AUTH_KEY = "?Authorization=CWB-E0F06EC3-785A-4058-8B12-7F43A46F4E17"
        const URI = "https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/"
        const DIR = "./typhoon/export/"

        const FILE_NAMES = { /** @see https://opendata.cwb.gov.tw/dataset/warning?page=1 */
            "W-C0034-001.CAP":"颱風警報",
            "W-C0034-002.KMZ":"颱風消息",
            "W-C0034-003.KMZ":"颱風侵襲機率",
            "W-C0034-004.JSON":"颱風路徑",
            "W-C0034-005.JSON":"熱帶氣旋路徑"
        }

        const streams = Object.keys(FILE_NAMES).map(async name=>{
            const ext = name.match(/\.\w+$/)[0].substring(1)
            return {
                name:name,
                ext:ext,
                stream:await fetch(`${URI}${name}${AUTH_KEY}&downloadType=WEB&format=${ext}`)
            }
        })
        const streams_reslove = await Promise.all(streams)

        let result = {}

        for (const {name,ext,stream} of streams_reslove) {
            if(/json/ig.test(ext)){
                // fs.writeFileSync(DIR+name,await stream.text())
                result[FILE_NAMES[name]] = await stream.json()
            }
            else if(/cap/ig.test(ext)){ // xml
                const str = XmlParser.xml2json(await stream.text(), {
                    compact: true,
                    spaces: 4
                })
                // fs.writeFileSync(DIR+name.replace(/\.cap$/ig,".json"),str)
                result[FILE_NAMES[name]] = JSON.parse(str)
            }
            else if(/kmz/ig.test(ext)){
                const buffer = await(await stream.blob()).arrayBuffer()
                const unzip = new ZIP(buffer)
                const f = Object.values(unzip['files']).find(f=>/\.kml$/.test(f.name))
                if(!f) throw("can't find kml in kmz")
                
                const str = f.asText()
                const DOMParser = require('xmldom').DOMParser
                const kml = new DOMParser().parseFromString(str)
                const geojson = Togeojson.kml(kml,{ styles: true });
                // fs.writeFileSync(DIR+f.name.replace(/\.kml$/,".json"),JSON.stringify(geojson))
                result[FILE_NAMES[name]] = geojson

            }
        }

        // 整理
        let filtered = {}
        filtered["颱風消息"] = result["颱風消息"] //feature

        const ptr = result["颱風路徑"]["cwbtyphfcst"]["typhinfo"]
        console.log(result["颱風路徑"]["cwbtyphfcst"]["announcement"])
        const props = ptr.typhoon.properties
        filtered["颱風路徑"] = {
            time:ptr['@published'],
            count:ptr['@typhcount'],
            name:props.typhname,
            data:{
                curr:ptr.typhoon.typhdata.curr.point,
                fcst:ptr.typhoon.typhdata.fcst.point,
                past:ptr.typhoon.typhdata.past.point
            }
        }
        return filtered
    }catch(e){
        console.error(e)
    }
}

/** 取得 netcdf binary file (arrayBuffer) */
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

/** 排程轉換 Netcdf Binary file 為 json檔保存 */
const scheduleConvertNetCDF = async() => {

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
        const DIR = "./backend/ocm"

        console.log(`[schedule task : convet nc to json , now ${DateStr}]`)


        if (!fs.existsSync(DIR)) {
            fs.mkdirSync(DIR)
        }

        let hours = 48
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

/** 取得商港資料 */
const getIshoeSatationData = async() => {

    const DIR = "./backend/layer"
    if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR)
    }

    const port_enum = {
        台北商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetTPstationXML.aspx",
        蘇澳商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetSAStationXML.aspx",
        台中商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetTCStationXML.aspx",
        布袋商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetBDStationXML.aspx",
        安平商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetAPStationXML.aspx",
        高雄商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetKHStationXML.aspx",
        花蓮商港: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetHLStationXML.aspx",
        馬祖南竿: "https://isohe.ihmt.gov.tw/station/OpenData/XML/GetNGStationXML.aspx"
    }

    try {
        for (const key of Object.keys(port_enum)) {
            const result = await (await fetch(port_enum[key])).text()
            const resultJsonStr = XmlParser.xml2json(result, {
                compact: true,
                spaces: 4
            })
            await new Promise((res, rej) => fs.writeFile(
                `${DIR}/${key}.json`,
                resultJsonStr,
                err => err ? rej(err) : res()
            ))
            console.log(`[getIshoeSatationData success : ${key}]`)
        }
    } catch (e) {
        console.error(e)
    }

}

app.listen(3000, () => {

    console.log("server is runing at 3000")

    // scheduleConvertNetCDF()
    // getIshoeSatationData()

})