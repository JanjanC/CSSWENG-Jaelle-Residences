//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const {ipcRenderer} = electron;

$(document).ready(function(){
    $('#testbtn').click(function() {
        ipcRenderer.send('print:goto', "613f1c4f1f3b0e4ddc0cbcd3");
    });
});