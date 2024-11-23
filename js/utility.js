const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function computeNights  (startDate, endDate){
    let start = new Date(startDate);
    let end = new Date(endDate);
    let timeDiff = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays
}

export function computeDow  (startDate)  {
    let start = new Date(startDate).getDay();
    return daysOfWeek[start];
}

export function dater(date) {
    if (!date) return "<b>no date</b>";

    let dateT = "";
    if (date.length == 19) {
        // console.log('long date - in: ', date)
        let yr = date.substring(0, 4);
        let mo = date.substring(5, 7);
        let dy = date.substring(8, 10);
        dateT = mo + "/" + dy + "/" + yr;
        // console.log('long date - out: ', dateT)
    } else {
        // console.log('short date - in: ', date)
        /**
         * dates can be in the format of mm/dd/yyyy or yyyy-mm-dd
         * so we need to check for both
         * with the year being 4 digits in front or the end
         *
         * first check for the hyphen and then the slash and where they are
         */
        let firstHyphen = date.indexOf("-");
        let firstSlash = date.indexOf("/");
        let dy = "",
            mo = "",
            yr = "";
        if (firstHyphen < 0) {
            // date uses slashes
            const dtParts = date.split("/");
            // first zero pad the month and day
            if (firstSlash < 4) {
                yr = dtParts[2];
                mo = ("00" + dtParts[0]).slice(-2);
                dy = ("00" + dtParts[1]).slice(-2);
                // dateT = mo + '/' + dy + '/' + yr
            } else {
                yr = dtParts[0];
                mo = dtParts[1];
                dy = dtParts[2];
                // dateT = mo + '/' + dy + '/' + yr
            }
        } else if (firstSlash < 0) {
            // date uses hyphens
            const dtParts = date.split("-");
            if (firstHyphen < 4) {
                yr = dtParts[2];
                mo = ("00" + dtParts[0]).slice(-2);
                dy = ("00" + dtParts[1]).slice(-2);
                // dateT = mo + '/' + dy + '/' + yr
            } else {
                yr = dtParts[0];
                mo = dtParts[1];
                dy = dtParts[2];
            }
        }
        dateT = mo + "/" + dy + "/" + yr;
    }
    return dateT;
}

// Create our number formatter.
export const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function clearInfoBlocks() {
    let dispElems = document.getElementsByClassName("gstDisp");
    for (let i = 0; i < dispElems.length; i++) {
        dispElems[i].innerHTML = "";
    }
}

export function clearHighlight() {
    let dispElems = document.getElementsByClassName("table-active");
    for (let i = 0; i < dispElems.length; i++) {
        dispElems[i].classList.remove("table-active");
    }
}

export function clearSelections() {
    clearHighlight();
    clearInfoBlocks();
}


export function showVipList() {
    console.log("showVipList");
    document.getElementById("navHA").classList.remove("active");
    document.getElementById("navVIP").classList.add("active");
    document.getElementById("vipList").style.display = "block";
    document.getElementById("haList").style.display = "none";
}

export function showHaList() {
    console.log("showHaList");
    document.getElementById("navVIP").classList.remove("active");
    document.getElementById("navHA").classList.add("active");
    document.getElementById("vipList").style.display = "none";
    document.getElementById("haList").style.display = "block";
}

export function haClearDetails() {
    // document.getElementById("haDtlDivCount").innerHTML = ''
    // document.getElementById("haDtlDivCharges").innerHTML = ''
    // document.getElementById("haDtlDivCredits").innerHTML = ''
    // document.getElementById("haDtlDivQty").innerHTML = ''
    dispHaSelName.innerHTML = ''
    haDtlDivRecords.innerHTML = ''
    haDtlDivDesc.innerHTML = '&nbsp;'
    haDtlDivNotes.innerHTML = '&nbsp;'
}

export function haShowDetailNotes(e) {
    let thisTR = e.target.parentNode;
    document.getElementById("haDtlDivDesc").innerHTML = thisTR.getAttribute("data-desc");
    document.getElementById("haDtlDivNotes").innerHTML = thisTR.getAttribute("data-note");
}