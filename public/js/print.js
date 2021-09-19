//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const {ipcRenderer} = electron;

$(document).ready(function () {
    $('#print-it').click(function() {
        ipcRenderer.send('print:execute');
    });
});