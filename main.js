//import the necessary modules
const path = require('path');
const electron = require('electron');
const dotenv = require('dotenv');
const server = require('./server.js');

//retrieves the necessary attributes from electron
const {app, BrowserWindow} = electron;

let mainWindow;

//configure dotenv
dotenv.config({path: path.join(__dirname, '.env')});

//create new window once electron finishes initialization
app.on('ready', function() {
    //create new window
    mainWindow = new BrowserWindow({
        title: "Jaelle Residences",
        // icon: "",
        autoHideMenuBar: true
    });

    //opens the web application
    mainWindow.loadURL(`http://${process.env.HOSTNAME}:${process.env.PORT}/`);

    //terminate the electron application on window close
    mainWindow.on('closed', function() {
        app.quit();
    });

});
