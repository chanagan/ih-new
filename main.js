const { app, BrowserWindow, ipcMain } = require("electron");
const {getResList} = require("./js/vipMainFuncs.js");

// const fetch = require("electron-fetch").default;
// const ExcelJS = require('exceljs');
const fs = require("fs");

const path = require("path");
const appViews = path.join(__dirname, "views");
const appData = app.getPath("userData");
console.log("main: appData: ", appData);

let configFile = path.join(appData, "ih-ap-config.json");
const cbConfig = require(configFile);
// console.log("main: cbConfig: ", cbConfig);

const winWidth = cbConfig.winWidth;
const winHeight = cbConfig.winHeight;
const winX = cbConfig.winX;
const winY = cbConfig.winY;
const openDevTools = cbConfig.devTools;

let window;

const createWindow = () => {
    window = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        x: winX,
        y: winY,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    window.loadFile("index.html");
    // console.log('in main.js: ', window)

    window.webContents.openDevTools({
        mode: "detach",
        width: winWidth,
        height: winHeight,
        x: winWidth,
        y: 100,
        show: openDevTools,
    });
};

app.whenReady().then(() => {
    createWindow();
    window.once("ready-to-show", () => {
        window.show();
        // let winLoc = path.join(appViews, 'haDiv.html');
        // let winData = fs.readFileSync(winLoc, 'utf8');
        // window.webContents.send('winData', winData);
        // getHA_List(window);
        // getResList();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('navLoadView', async (event, data) => {
    let winLoc = path.join(appViews, data);
    let winData = fs.readFileSync(winLoc, 'utf8');
    window.webContents.send('winData', { data: data, winData: winData });
});

const cbPropertyID = cbConfig.cbPropertyID;
const cbServer = cbConfig.cbServer;
const cbOptions = cbConfig.cbOptions;

const cbApiHA_Details = "getHouseAccountDetails?";
const cbApiHA_List = "getHouseAccountList?";
const cbApiGetReservations = "getReservations?";
const cbApiGetReservation = "getReservation?";

const computeNights = (startDate, endDate) => {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let timeDiff = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays
}
const computeDow = (startDate) => {
    let start = new Date(startDate).getDay();
    return daysOfWeek[start];
}
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const vipDays = 6

let reservHdrs = []
reservHdrs["reservationID"] = true
reservHdrs["guestName"] = true
reservHdrs["nights"] = true
reservHdrs["startDate"] = true
reservHdrs["endDate"] = true
reservHdrs["adults"] = true
reservHdrs["dow"] = true

// function getResList() {
ipcMain.on("getVipResList", async (event, data) => {
    let dtFrom = data.resDateFrom;
    let dtTo = data.resDateTo;
    let resList =  getResList(dtFrom, dtTo);
    // window.webContents.send("resData", resList); // send to preload

    // let params = new URLSearchParams({
    //     propertyID: cbPropertyID,
    //     // checkInFrom: "2024-08-23",
    //     // checkInTo: "2024-08-31",
    //     checkInFrom: dtFrom,
    //     checkInTo: dtTo,
    //     // pageNumber: 1,
    // });
    // fetch(cbServer + cbApiGetReservations + params, cbOptions)
    //     .then(res => res.json())
    //     .then((data) => {
    //         // console.log("main: getResList: ", data);
    //         let vipResRecordsList = [];
    //         resData = data.data;
    //         for (let i = 0; i < resData.length; i++) {
    //             if (resData[i].status == 'canceled') {
    //                 continue
    //             }
    //             let resNights = computeNights(resData[i].startDate, resData[i].endDate);
    //             if (resNights < vipDays) {
    //                 continue
    //             }
    //             resData[i].nights = resNights;
    //             resData[i].dow = computeDow(resData[i].startDate);
    //             let tmpRecord = {}
    //             for (let key in reservHdrs) {
    //                 tmpRecord[key] = resData[i][key];
    //             }
    //             vipResRecordsList.push(tmpRecord);
    //             // vipResRecordsList.push(resData[i]);
    //         }
    //         // data.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
    //         vipResRecordsList.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
            // console.log("main: vipResRecordsList: ", vipResRecordsList);
            // window.webContents.send("resData", vipResRecordsList); // send to preload
        
})
