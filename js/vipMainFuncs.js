const { app } = require("electron");
const path = require("path");
const appData = app.getPath("userData");
let configFile = path.join(appData, "ih-ap-config.json");
const cbConfig = require(configFile);

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

function getResList(window, dtFrom, dtTo) {
    let params = new URLSearchParams({
        propertyID: cbPropertyID,
        // checkInFrom: "2024-08-23",
        // checkInTo: "2024-08-31",
        checkInFrom: dtFrom,
        checkInTo: dtTo,
        // pageNumber: 1,
    });
    fetch(cbServer + cbApiGetReservations + params, cbOptions)
        .then(res => res.json())
        .then((data) => {
            // console.log("main: getResList: ", data);
            let vipResRecordsList = [];
            resData = data.data;
            for (let i = 0; i < resData.length; i++) {
                if (resData[i].status == 'canceled') {
                    continue
                }
                let resNights = computeNights(resData[i].startDate, resData[i].endDate);
                if (resNights < vipDays) {
                    continue
                }
                resData[i].nights = resNights;
                resData[i].dow = computeDow(resData[i].startDate);
                let tmpRecord = {}
                for (let key in reservHdrs) {
                    tmpRecord[key] = resData[i][key];
                }
                vipResRecordsList.push(tmpRecord);
                // vipResRecordsList.push(resData[i]);
            }
            // data.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
            vipResRecordsList.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
            window.webContents.send("resData", vipResRecordsList); // send to preload
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function getResDetail(window, vipRecord) {
    let params = new URLSearchParams({
        propertyID: cbPropertyID,
        reservationID: vipRecord.reservationID,
    });
    fetch(cbServer + cbApiGetReservation + params, cbOptions)
        .then(res => res.json())
        .then((data) => {
            // console.log("main: getResDetail -vip-pre: ", vipRecord);
            // console.log("main: getResDetail: data: ", data);
            resData = data.data;
            vipRecord.guestList = resData.guestList;
            vipRecord.isMainGuest = resData.isMainGuest;
            vipRecord.assignedRoom = resData.assignedRoom;
            vipRecord.guestStatus = resData.guestStatus;
            vipRecord.rooms = resData.rooms;
            console.log("main: getResDetail -vip-post: ", vipRecord);

            // window.webContents.send("gotResDetail", vipRecord);
        });

}

module.exports = {
    getResList,
    getResDetail
}
