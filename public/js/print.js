//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const {ipcRenderer} = electron;

$(document).ready(function () {
	$('#print-test').click(function() {
        ipcRenderer.send('print:goto', "613f1c4f1f3b0e4ddc0cbcd3");
    });

    $('#print-it').click(function() {
        $('#print-test').hide();
        $('#print-it').hide();
        ipcRenderer.send('print:execute');
    });
});