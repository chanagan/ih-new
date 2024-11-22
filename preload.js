const { contextBridge, ipcRenderer } = require('electron')  
// let {ha_accts} = require("./data_sets/ha_accts.js");

// const {ipcRenderer, contextBridge} = require('electron');
contextBridge.exposeInMainWorld("api",{
    send: (channel, data) => ipcRenderer.send(channel, data),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    // receive: (channel, func) => ipcRenderer.on(
    //     channel,
    //     (event, ...args) => func(args)
    // )
})

ipcRenderer.on('winData', (event, data) => {
    // console.log('preload-winData: ', data )
    window.postMessage({type: 'winData', data: data}) // send to renderer
})

ipcRenderer.on('HA_Data', (event, data) => {
    // let ha_cnt = data.length
    // console.log(`preload-HA_Data: leng: ${ha_cnt} - `, data )
    window.postMessage({type: 'HA_Data', data: data}) // send to renderer
})

ipcRenderer.on('gotHaBalance', (event, data) => {
    // console.log('preload gotHaDetail: ', data )
    window.postMessage({type: 'gotHaBalance', data: data}) // send to renderer
})

ipcRenderer.on('gotHaDetail', (event, data) => {
    // console.log('preload gotHaDetail: ', data )
    window.postMessage({type: 'gotHaDetail', data: data}) // send to renderer
})

ipcRenderer.on('resData', (event, data) => {
    // console.log('preload-resData: ', data )
    window.postMessage({type: 'resData', data: data}) // send to renderer
})

ipcRenderer.on('gotResDetail', (event, data) => {
    // console.log('preload-resData: ', data )
    window.postMessage({type: 'gotResDetail', data: data}) // send to renderer
})


