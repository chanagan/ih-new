const { app } = require("electron");
const path = require("path");
const exJS = require('exceljs');

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
            // vipResRecordsList.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
            // console.log("main: vipMainFuncs: getResList: ", vipResRecordsList);
            window.webContents.send("resData", vipResRecordsList); // send to preload
            // return vipResRecordsList
        })
}

let statusHdrs = {
    'checked_in': 'Chk/In'
    , 'checked_out': 'Chk/Out'
    , 'cancelled': 'Canx'
    , 'confirmed': 'Confrm'
    , 'in_house': 'In Hse'
    , 'not_checked_in': 'Not C/I'
    , 'vip': 'VIP'
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
            let recStat = resDetail.status
            vipRecord.guestList = resDetail.guestList;
            vipRecord.isMainGuest = resDetail.isMainGuest;
            vipRecord.assignedRoom = resDetail.assignedRoom;
            // vipRecord.guestStatus = resDetail.guestStatus;
            vipRecord.guestStatus = `${statusHdrs[recStat]}`;
            vipRecord.rooms = resDetail.rooms;
            // console.log("main: getResDetail: ", resDetail);

            window.webContents.send("gotResDetail", vipRecord); // send to preload
        })
}


let exColFormat = [
    { alignment: 'null', bold: false },
    { alignment: 'left', bold: false  },
    { alignment: 'left', bold: false  },
    { alignment: 'center', bold: false  },
    { alignment: 'center', bold: true  },
    { alignment: 'center', bold: false },
    { alignment: 'center', bold: false },
    { alignment: 'center', bold: false },
    { alignment: 'left', bold: true },
    { alignment: 'left', bold: true },
    { alignment: 'center', bold: false },
    { alignment: 'center', bold: false },
    { alignment: 'center', bold: false },
    { alignment: 'center', bold: true },
]

const workbookFile = path.join(appData, "ih-vip.xlsx");


function exportVipList(window, vipResRecordsList) {
    const vipCnt = vipResRecordsList.length;
    console.log('vipMainFuncs: vipExportList: ', vipResRecordsList);

    const workbook = new exJS.Workbook();
    workbook.creator = 'CBH';
    // workbook.lastModifiedBy = 'Her';
    workbook.created = new Date(2024, 12, 1);
    workbook.modified = new Date();
    // workbook.lastPrinted = new Date(2016, 9, 27);
    workbook.calcProperties.fullCalcOnLoad = true;
    workbook.views = [
        {
            x: 0, y: 0, width: 13, height: 50,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ]

    const worksheet = workbook.addWorksheet('VIP', {
        properties:
        {
            tabColor: { argb: '00a7ce0' }
        },
        pageSetup: {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 25
        },
        views: {
            state: 'frozen',
            activeCell: 'A1',
            ySplit: 1
        }
    });
    const font = { name: 'Arial Black', size: 14, bold: true }
    const dataFont = { name: 'Arial', size: 12, bold: false }
    worksheet.columns = [
        { header: 'Reservation ID', key: 'reservationID', width: 18, style: { font: font } },
        { header: 'Guest Name', key: 'guestName', width: 20, style: { font: font } },
        { header: 'Nights', key: 'nights', width: 10, style: { font: font } },
        { header: 'Check In', key: 'startDate', width: 15, style: { font: font } },
        { header: 'DOW', key: 'dow', width: 7, style: { font: font } },
        { header: 'Adults', key: 'adults', width: 10, style: { font: font } },
        { header: 'Guest ID', key: 'guestID', width: 15, style: { font: font } },
        { header: 'Last', key: 'guestLastName', width: 15, style: { font: font } },
        { header: 'First', key: 'guestFirstName', width: 10, style: { font: font } },
        { header: 'Main?', key: 'isMainGuest', width: 10, style: { font: font } },
        { header: 'Assgnd?', key: 'assignedRoom', width: 11, style: { font: font } },
        { header: 'Status', key: 'guestStatus', width: 10, style: { font: font } },
        { header: 'Room', key: 'roomName', width: 8, style: { font: font } },
    ]

    for (let i = 0; i < vipCnt; i++) {
        let vipRecord = vipResRecordsList[i];
        // let [guestID, guestRecord] = vipRecord.guestList
        let firstTime = true;
        let thisRow;
        for (const [guestID, guestRecord] of Object.entries(vipRecord.guestList)) {
            if (firstTime) {
                let recStat = guestRecord.guestStatus
                vipRecord.guestID = guestRecord.guestID;
                vipRecord.guestLastName = guestRecord.guestLastName;
                vipRecord.guestFirstName = guestRecord.guestFirstName;
                vipRecord.isMainGuest = guestRecord.isMainGuest;
                vipRecord.assignedRoom = guestRecord.assignedRoom;
                vipRecord.guestStatus = `${statusHdrs[recStat]}`;
                // vipRecord.guestStatus = guestRecord.guestStatus;
                vipRecord.roomName = guestRecord.roomName;
                firstTime = false;
                thisRow = worksheet.addRow(vipRecord);
                thisRow.eachCell(function (cell, colNumber) {
                    thisRow.getCell(colNumber).font = { color: { argb: "FF00FF00" } };
                    thisRow.getCell(colNumber).border = {
                        top: { style: 'thin', color: { argb: "FFFF0000" } },
                    };
                });
                thisRow.style.font = dataFont;
            } else {
                vipRecord = {};
                vipRecord.guestID = guestRecord.guestID;
                vipRecord.guestLastName = guestRecord.guestLastName;
                vipRecord.guestFirstName = guestRecord.guestFirstName;
                thisRow = worksheet.addRow(vipRecord);
                thisRow.style.font = dataFont;
            }
        }


    }
    worksheet.eachRow(function (row, rowNumber) {
        let notPrimGst = (row.getCell(1).value) ? false : true;
        row.eachCell(function (cell, colNumber) {
            cell.alignment = { horizontal: exColFormat[colNumber].alignment };
            if (rowNumber > 1) {
                cell.font = { bold: exColFormat[colNumber].bold
                , color: { argb: "00000000"
                 }};
            }
            console.log('vipMainFuncs: vipExportList: ', cell.value, colNumber, rowNumber, notPrimGst);
        })

        // if (rowNumber > 1) {
        //     row.eachCell(function (cell, colNumber) {
        //         if (cell.value)
        //             row.getCell(colNumber).font = { color: { argb: "000000ff" } };
        //     });
        // }
    });
    // let vipTbl = window.webContents.document.getElementById('resListDiv');
    workbook.xlsx.writeFile(workbookFile)
        .then(() => {
            console.log('vipMainFuncs: vipExportList: File is written');
        })

}

module.exports = {
    getResList,
    getResDetail,
    exportVipList
}
