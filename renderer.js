// import { api } from "./preload.js";
import { vipLoadList, vipLoadDetail } from "./js/vipRenderFuncs.js";

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
  navHA.classList.remove('active');
  navVIP.classList.add('active');
  vipDiv.style.display = 'flex';
  api.send('navLoadView', 'vipDiv.html');
});


window.addEventListener("message", (event) => {
  /*
  */
  if (event.data.type === "winData") {
    let winData = event.data.data;
    if (winData.data === 'vipDiv.html') {
      // if (!vipDiv.firstChild) {
        vipDiv.innerHTML = winData.winData;
        btnDateSearch.addEventListener("click", () => {
          let resDateFrom = document.getElementById("resDateFrom").value;
          let resDateTo = document.getElementById("resDateTo").value;
          api.send("getVipResList", { resDateFrom, resDateTo }); // send to main

        });
      // }
    };
  }


  /**
   * have a list of reservations from main=>preload=>renderer
   */
  if (event.data.type === "resData") {
    vipLoadList(event.data.data);

  }

  /** 
   * got the reservation detail from main=>preload=>renderer
   */
  if (event.data.type === "gotResDetail") {
    vipLoadDetail(event.data.data);
  }






}
);
