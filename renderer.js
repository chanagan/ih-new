// import { api } from "./preload.js";
import { dispVipList } from "./js/vipRenderFuncs.js";

// let navVIP = document.getElementById("navVIP");
// let navHA = document.getElementById("navHA");
/**
 * set the NAV button handlers
 */
// navHA.addEventListener("click", showHaList);
// navVIP.addEventListener("click", showVipList);
navHA.addEventListener("click", () => {
  api.send('navLoadView', 'haDiv.html');
  navVIP.classList.remove('active');
  navHA.classList.add('active');
})
navVIP.addEventListener("click", () => {
  api.send('navLoadView', 'vipDiv.html');
  navHA.classList.remove('active');
  navVIP.classList.add('active');
});




// chkFilterEmp.addEventListener("click", () => {
//   // haListDiv.removeChild(haListTbl);
//   dispHaList(showAccounts);
// })
// chkFilterGc.addEventListener("click", () => {
//   // haListDiv.removeChild(haListTbl);
//   dispHaList(showAccounts);
// })




// let rowCnt = 0;

/*
 * get the search results back from preload.js
 */
let vipRecCnt = 0;
let vipDtlCnt = 0;

let showRecords = [];
let showAccounts = [];

window.addEventListener("message", (event) => {
  /*
  */
  if (event.data.type === "winData") {
    let winData = event.data.data;
    wrkDiv.innerHTML = winData.winData;
    if (winData.data === 'vipDiv.html') {
      btnDateSearch.addEventListener("click", () => {
        let resDateFrom = document.getElementById("resDateFrom").value;
        let resDateTo = document.getElementById("resDateTo").value;
        // let srchID = 'all'
        // clearInfoBlocks();

        api.send("getVipResList", { resDateFrom, resDateTo }); // send to main
        // api.invoke("getVipResList", { resDateFrom, resDateTo })
        // .then((res) => {
        //   console.log('main: getVipResList: ', res);
        // })

        // dispVipList(showRecords);
      })
    };
  }
  /**
   * have a list of reservations from main=>preload=>renderer
   */
  if (event.data.type === "resData") {
    showRecords = [];
    let vipGuests = event.data.data;

    vipRecCnt = vipGuests.length;
    let nIntervalId;

    let resListDiv = document.getElementById("resListDiv");
    let progBar = document.createElement('progress');
    resListDiv.appendChild(progBar)
    let progCnt = document.createElement('span');
    resListDiv.appendChild(progCnt);

    progBar.id = 'progBar';
    progBar.max = '100';
    progBar.value = '0';

    let rowProgress = 0;

    // for (let i = 0; i < rowCnt; i++) {
    if (!nIntervalId) {
      let i = 0
      nIntervalId = setInterval(function () {
        for (const res of vipGuests) {
          api.send("getResDetail", res)
          i++
          progBar.value = i * 100 / vipRecCnt
          progCnt.innerHTML = ` ${i} of ${vipRecCnt}`
        }

        // if (i < rowCnt) {
        //   // api.send("getResDetail", showRecords[i])
        //   api.send("getResDetail", vipGuests[i])
        //   i++
        //   progBar.value = i * 100 / rowCnt
        //   progCnt.innerHTML = ` ${i} of ${rowCnt}`
        // } else {
          progCnt.remove();
          progBar.remove();
          console.log('end of vipGuests: ', showRecords);
          clearInterval(nIntervalId);
          // dispVipList(showRecords);
        // }
      }, 250);
    }
    // }
    console.log('render: resData: end');
  }

  /** 
   * got the reservation detail from main=>preload=>renderer
   */
  if (event.data.type === "gotResDetail") {
    let resData = event.data.data;
    // vipDtlCnt++;
    showRecords.push(resData);
    console.log('renderer: ', event.data.data);
    vipDtlCnt++;
    if (vipDtlCnt == vipRecCnt) {
      console.log('render: end of gotResDetail: ', showRecords);
      dispVipList(showRecords);
    }
    // dispResDetail(resData);
  }


  if (event.data.type === "HA_Data") {
    showAccounts = [];
    // console.log('renderer: ', event.data.data);
    haAccounts = filterHaList(event.data.data)
    // rowCnt = dispHaList(haAccounts);
    // get the balance info for the records first

    let rowCnt = haAccounts.length;
    rowCnt = 5
    // let intMilSec = 250;
    // let anInterval = 1000 / intMilSec;
    // let rowsPerInterval = rowCnt / anInterval
    // let rowInterv = 100 / rowsPerInterval;

    let nIntervalId;

    // let progBar = document.createElement('div');
    let progBar = document.createElement('progress');
    // haListDiv.appendChild(progBar)
    haProgDiv.appendChild(progBar)
    let progCnt = document.createElement('span');
    haProgDiv.appendChild(progCnt);

    progBar.id = 'progBar';
    progBar.max = '100';
    progBar.value = '0';

    let rowProgress = 0;

    // for (let i = 0; i < rowCnt; i++) {
    if (!nIntervalId) {
      let i = 0;
      nIntervalId = setInterval(function () {
        if (i < rowCnt) {
          // console.log(`count: ${i}`)
          progBar.value = i * 100 / rowCnt
          progCnt.innerHTML = ` ${i} of ${rowCnt}`
          api.send("getHaBalance", haAccounts[i])
          i++
        } else {
          progCnt.remove();
          progBar.remove();
          console.log('end of haAccounts: ', showAccounts);
          clearInterval(nIntervalId);
          dispHaList(showAccounts);
        }
      }, 300);
    }
    // let record = haAccounts[0]

    // haGetBalances(showRecords);

    // let showRecords = dispHaList(haAccounts);
  }

  if (event.data.type === "gotHaBalance") {
    let accountData = event.data.data;
    showAccounts.push(accountData);

  }
  if (event.data.type === "gotHaDetail") {
    // console.log('renderer: ');
    let haData = event.data.data;
    if (haData.length == 0) {
      haClearDetails();
      document.getElementById("dispHaSelName").innerHTML = 'No records found';
      return
    }
    //haData.total.count
    // document.getElementById("haDtlDivCount").innerHTML = haData.total.count;
    // document.getElementById("haDtlDivCharges").innerHTML = haData.total.debit;
    // document.getElementById("haDtlDivCredits").innerHTML = haData.total.credit;
    // document.getElementById("haDtlDivQty").innerHTML = haData.total.quantity;

    dispHaDetail(haData);
  }

}
);
