import { dater, computeNights, computeDow } from './utility.js';

const vipDays = 6

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

export function dispVipList(vipRecords) {

    let displayCount = 0
    let rowCnt = vipRecords.length
    console.log(`showVipList: count: ${rowCnt} : ${vipRecords}`);
    // return;


    let listTable, listHead, listBody;
    let listRow, listCell;


    // let's make a new table
    listTable = document.createElement("table");
    listTable.style.border = "1px solid red";
    listTable.id = "listTbl";
    listTable.className = "table table-sm table-hover";
    // resListDiv.appendChild(listTable);

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
        if (record.status === "canceled") {
            continue;
        }
        if (record.nights < vipDays) {
            continue;
        }

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
                    // listCell.setAttribute('align', tblHdrs[key].align);
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = dater(record[key]);
                    break;
                case "dow":
                    let dowNum = new Date(record.startDate).getDay();
                    // listCell.setAttribute('align', tblHdrs[key].align);
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = computeDow(record.startDate);
                     // daysOfWeek[dowNum];
                    // listCell.innerHTML = daysOfWeek[dowNum];
                    break;
                case 'adults':
                    // first, put this cell's data into the table
                    listCell.innerHTML = record.adults;
                    listCell.style.textAlign = tblHdrs[key].align;
                    // listCell.setAttribute('align', tblHdrs[key].align);

                    // // here, we're going to tack on the rest of the details

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
                                        // listCell.style.textAlign = gstTblHdrs[key].align;
                                        listCell.innerHTML += `${el} <br/>`;
                                    }
                                    break
                                default:
                                    // listCell.style.textAlign = gstTblHdrs[key].align;
                                    listCell.innerHTML += `${guestRecord[inrKey]} <br/>`;
                                    break;
                            }
                            isFirst = false
                        }
                    }

                    continue
                    // let guestTable = document.createElement("table");
                    // guestTable.id = "guestTbl";
                    // guestTable.className = "table  table-hover";
                    // listCell.appendChild(guestTable);

                    // for each guest, make a row
                    let guestRow, guestCell;
                    for (const [guestID, guestRecord] of Object.entries(record.guestList)) {
                        guestRow = document.createElement("tr");
                        guestTable.appendChild(guestRow);

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        guestCell.innerHTML = guestID;

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        guestCell.innerHTML = guestRecord.guestLastName;

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        guestCell.innerHTML = guestRecord.guestFirstName;

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        guestCell.innerHTML = guestRecord.isMainGuest;

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        guestCell.innerHTML = guestRecord.assignedRoom;

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        guestCell.innerHTML = guestRecord.guestStatus;

                        guestCell = document.createElement("td");
                        guestRow.appendChild(guestCell);
                        let roomName = guestRecord.rooms.length > 0 ? guestRecord.rooms[0].roomName : '';
                        guestCell.innerHTML = roomName;
                        // guestCell.innerHTML = guestRecord.rooms[0].roomName;
                    }

                    // let guestCount = Object.keys(record.guestList).length
                    // listCell.setAttribute('align', tblHdrs[key].align);
                    // listCell.innerHTML = guestCount;

                    /**
                     * 
                     * for (const [key, value] of Object.entries(exampleData)) {
                      const keyCoords = parseCoords(key);
                      console.log({keyCoords, valueCoords: value});
                    } */
                    for (const [guestID, guestRecord] of Object.entries(record.guestList)) {
                        console.log(`dispResList: guestList: ${guestID} : ${guestRecord.guestLastName}`);
                    }

                    break
                case "nights":
                case "adults":
                    listCell.style.textAlign = tblHdrs[key].align;
                    // listCell.setAttribute('align', tblHdrs[key].align);
                default:
                    listCell.style.textAlign = tblHdrs[key].align;
                    listCell.innerHTML = record[key];
                    break;
            }
        }
    }
    resListDiv.appendChild(listTable);

    console.log("dispResList: listTable: ", listTable);
    return displayCount;
}
