const { app, BrowserWindow, ipcMain } = require("electron");
const {getResList, getResDetail} = require("./js/vipMainFuncs.js");

// const fetch = require("electron-fetch").default;
// const ExcelJS = require('exceljs');
const fs = require("fs");

const path = require("path");
const { get } = require("http");
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

ipcMain.handle("getVipResListX", async (event, data) => {
    let dtFrom = data.resDateFrom;
    let dtTo = data.resDateTo;
    let resList =   getResList(dtFrom, dtTo);
    return resList;
});

ipcMain.on("getVipResList", async (event, data) => {
    let dtFrom = data.resDateFrom;
    let dtTo = data.resDateTo;
    getResList(window, dtFrom, dtTo);
})

ipcMain.on('getResDetail', async (event, vipRecord) => {
    getResDetail(window, vipRecord);
});