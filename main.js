const { app, BrowserWindow, ipcMain } = require("electron");

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
        let winLoc = path.join(appViews, 'haDiv.html');
        let winData = fs.readFileSync(winLoc, 'utf8');
        window.webContents.send('winData', winData);
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
 
