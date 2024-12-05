import { dater, computeNights, computeDow } from './utility.js';

// const vipDays = 6
let vipRecCnt = 0;
let vipDtlCnt = 0;
let progBar
let progCnt
let showRecords = [];


let tblHdrs = [];
tblHdrs["reservationID"] = { 'align': 'left', 'value': 'Res ID' };
tblHdrs["guestName"] = { 'align': 'left', 'value': 'Guest Name' };
tblHdrs["nights"] = { 'align': 'center', 'value': 'Nights' };
tblHdrs["startDate"] = { 'align': 'center', 'value': 'Check In' };
tblHdrs["dow"] = { 'align': 'center', 'value': 'Dow' };
tblHdrs["adults"] = { 'align': 'center', 'value': 'Adults' };
// tblHdrs["guestID"] = { 'align': 'left', 'value': 'Guest ID' };
// tblHdrs["guestID"] = { 'align': 'left', 'value': 'Guest ID / Last / First / Main? / Assgnd? / Status / Rooms' };

let gstTblHdrs = [];
gstTblHdrs["guestID"] = { 'align': 'left', 'value': 'Guest ID' };
gstTblHdrs["guestLastName"] = { 'align': 'left', 'value': 'Last' };
gstTblHdrs["guestFirstName"] = { 'align': 'left', 'value': 'First' };
gstTblHdrs["isMainGuest"] = { 'align': 'center', 'value': 'Main?' };
gstTblHdrs["assignedRoom"] = { 'align': 'center', 'value': 'Assgnd?' };
gstTblHdrs["guestStatus"] = { 'align': 'center', 'value': 'Status' };
gstTblHdrs["roomName"] = { 'align': 'center', 'value': 'Room' };

let statusHdrs = {
    'checked_in': 'Chk/In'
    , 'checked_out': 'Chk/Out'
    , 'cancelled': 'Canx'
    , 'confirmed': 'Confrm'
    , 'in_house': 'In Hse'
    , 'not_checked_in': 'Not C/I'
    , 'vip': 'VIP'
}

export function vipExportList() {
    console.log('vipExportList: ', showRecords);
    api.send("printVipList", showRecords);
}

export function vipLoadList(vipGuests) {
    showRecords = [];
    // let vipGuests = event.data.data;

    vipRecCnt = vipGuests.length;
    vipDtlCnt = 0;
    let nIntervalId;

    let resListDiv = document.getElementById("resListDiv");
    if (resListDiv.firstChild) {
      resListDiv.removeChild(resListDiv.firstChild);
    }

    progBar = document.createElement('progress');
    resListDiv.appendChild(progBar)
    progCnt = document.createElement('span');
    resListDiv.appendChild(progCnt);

    progBar.id = 'progBar';
    progBar.max = '100';
    progBar.value = '0';

    for (const res of vipGuests) {
      // console.log('getResDetail: ', res);
      api.send("getResDetail", res); // send to main
    }
    // console.log('render: resData: end');
  }

export function vipLoadDetail(vipRecord) {
    showRecords.push(vipRecord);
    // console.log('renderer: ', vipRecord);
    vipDtlCnt++;
    progBar.value = vipDtlCnt * 100 / vipRecCnt
    progCnt.innerHTML = ` ${vipDtlCnt} of ${vipRecCnt}`

    // once we have all the details, we can display the list
    if (vipDtlCnt == vipRecCnt) {
      progCnt.remove();
      progBar.remove();
      // console.log('render: end of gotResDetail: ', showRecords);
      dispVipList(showRecords);
    }
}


 function dispVipList(vipRecords) {
    vipRecords.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

    let resListDiv = document.getElementById("resListDiv");

    let displayCount = 0
    let rowCnt = vipRecords.length
    console.log(`vipRenderFuncs: showVipList: count: ${rowCnt} : ${vipRecords}`);
    // return;


    let listTable, listHead, listBody;
    let listRow, listCell;


    // let's make a new table
    listTable = document.createElement("table");
    listTable.style.border = "1px solid red";
    listTable.id = "listTbl";
    listTable.className = "table table-sm table-hover";
    resListDiv.appendChild(listTable);

    // now need to create the table parts
    listHead = document.createElement("thead");
    listTable.appendChild(listHead);
    listBody = document.createElement("tbody");
    listTable.appendChild(listBody);

    // now the header row
    listRow = document.createElement("tr");
    listHead.appendChild(listRow);
    for (let key in tblHdrs) {
        listCell = document.createElement("th");
        listRow.appendChild(listCell);
        listCell.style.textAlign = tblHdrs[key].align;
        // listCell.setAttribute('align', tblHdrs[key].align);
        listCell.innerHTML = tblHdrs[key].value;
    }

    for (let key in gstTblHdrs) {
        listCell = document.createElement("th");
        listRow.appendChild(listCell);
        listCell.style.textAlign = gstTblHdrs[key].align;
        // listCell.setAttribute('align', gstTblHdrs[key].align);
        listCell.innerHTML = gstTblHdrs[key].value;
    }
    // now the data rows
    // loop through the records
    displayCount = 0;
    for (let i = 0; i < rowCnt; i++) {

        // get the record and check some filters
        let record = vipRecords[i];

        // need a row for each record
        listRow = document.createElement("tr");
        listBody.appendChild(listRow);

        displayCount++;
        let resID = record.reservationID;
        // start a new row
        listRow.setAttribute("data-resID", resID);
        for (let key in tblHdrs) {
            listCell = document.createElement("td");
            listRow.appendChild(listCell);
            switch (key) {
                case "startDate":
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = dater(record[key]);
                    break;
                case "dow":
                    // let dowNum = new Date(record.startDate).getDay();
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = record[key];
                    // listCell.innerHTML = computeDow(record.startDate);
                    break;
                case 'adults':
                    // first, put this cell's data into the table
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = record[key];

                    // start adding columns for the detail information
                    for (let inrKey in gstTblHdrs) {
                        listCell = document.createElement("td");
                        listCell.style.textAlign = gstTblHdrs[inrKey].align;
                        listRow.appendChild(listCell);

                        listCell.innerHTML = ''
                        let isFirst = true
                        for (const [guestID, guestRecord] of Object.entries(record.guestList)) {
                            switch (inrKey) {
                                case 'guestStatus':
                                    let recStat = guestRecord[inrKey];
                                    listCell.innerHTML += `${statusHdrs[recStat]} <br/>`;
                                    break
                                case 'roomName':
                                    if (isFirst) {
                                        let el = guestRecord[inrKey]
                                        el = (el) ? el : ''
                                        listCell.innerHTML += `${el} <br/>`;
                                    }
                                    break
                                default:
                                    listCell.innerHTML += `${guestRecord[inrKey]} <br/>`;
                                    break;
                            }
                            isFirst = false
                        }
                    }
                    break
                case "nights":
                case "adults":
                    listCell.style.textAlign = tblHdrs[key].align;
                default:
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = record[key];
                    break;
            }
        }
    }

    // console.log("dispResList: listTable: ", listTable);
    return displayCount;
}
