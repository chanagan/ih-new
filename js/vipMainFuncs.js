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
            for (const res of resData) {
                if (res.status == 'canceled') {
                    continue
                }
                let resNights = computeNights(res.startDate, res.endDate);
                if (resNights < vipDays) {
                    continue
                }
                res.nights = resNights;
                res.dow = computeDow(res.startDate);
                let tmpRecord = {}
                for (let key in reservHdrs) {
                    tmpRecord[key] = res[key];
                }
                vipResRecordsList.push(tmpRecord);
            }
            vipResRecordsList.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
            window.webContents.send("resData", vipResRecordsList); // send to preload
            // return vipResRecordsList
        })
}

function getResDetail(window, vipRecord) {
    let params = new URLSearchParams({
        propertyID: cbPropertyID,
        reservationID: vipRecord.reservationID,
    });
    fetch(cbServer + cbApiGetReservation + params, cbOptions)
        .then(res => res.json())
        .then((data) => {
            let resDetail = data.data;
            vipRecord.guestList = resDetail.guestList;
            vipRecord.isMainGuest = resDetail.isMainGuest;
            vipRecord.assignedRoom = resDetail.assignedRoom;
            vipRecord.guestStatus = resDetail.guestStatus;
            vipRecord.rooms = resDetail.rooms;
            // console.log("main: getResDetail: ", resDetail);
            
            window.webContents.send("gotResDetail", vipRecord); // send to preload
        })
}
module.exports = {
    getResList,
    getResDetail
}
