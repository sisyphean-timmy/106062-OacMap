const gdal = require("C:\\Users\\dimha\\\AppData\\Roaming\\npm\\node_modules\\gdal-next\\lib\\gdal.js")

const test = async() => {

    // 取得鹽度 netcdf 並解析
    const uurl = "http://med.cwb.gov.tw/opendap/hyrax/OCM/20200716/00/9999/SALT.2020071600.nc.nc?SALT[0:1:0][0:1:0][0:1:1160][0:1:640]"
    const ustream = await fetch(uurl)
    const uArrayBuffer = await (await ustream.blob()).arrayBuffer()
    let uReader = new NetCDFReader(uArrayBuffer); // read the header
    // const data = uReader.getDataVariable("SALT")

    /**
     * test open SALT.2020071600.nc.png by gdal
     * rasterSize: { x: 641, y: 1161 }
     *  colorInterpretation: 'Gray',
        categoryNames: [],
        noDataValue: null,
        offset: 0,
        scale: 1,
        unitType: '',
        hasArbitraryOverviews: false,
        dataType: 'Byte',
        readOnly: true,
        maximum: 255,
        minimum: 0,
        blockSize: { x: 641, y: 1 },
        pixels: RasterBandPixels {},
        overviews: RasterBandOverviews {},
        size: { x: 641, y: 1161 },
        description: '',
        id: 1 }
     */

    const ds = gdal.open("backend/SALT.2020071600.nc.png")
    const _band = ds.bands.get(1)
    console.log("[pngTest]", _band.pixels.get(500, 500))

    /** 
     * 
     * 手動建立 rasterBands 
     * @see https://github.com/naturalatlas/node-gdal/issues/216 
     * 
     */
    const dataSet = gdal.open('temp', 'w', 'MEM', 256, 256, 1, gdal.GDT_Byte);

    var band = dataSet.bands.get(1)
    band.colorInterpretation = gdal.GCI_YCbCr_CrBand

    const w = 100
    const h = 100
    const data = new Uint8Array(new ArrayBuffer(w * h))

    for (let cnt = 0; cnt < w * h; cnt++) {
        data[cnt] = Math.random(1) * 10
    }

    band.pixels.write(0, 0, w, h, data);

    const driver = gdal.drivers.get('GTiff');
    driver.create("./backend/test2.tiff", 100, 100, 1, gdal.GDT_Byte)
    ds.flush()
}