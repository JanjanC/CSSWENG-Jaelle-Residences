//configure environment variables
process.env.HOSTNAME = "localhost"
process.env.PORT = "3000"
process.env.DB_URL = "mongodb+srv://admin:ilovecssweng@jaelle-residences.ptlf1.mongodb.net/jaelle-residences-db?retryWrites=true&w=majority"

//import the necessary modules
const path = require('path');
const electron = require('electron');
const server = require('./server.js');

//retrieves the necessary attributes from electron
const {app, BrowserWindow} = electron;

let mainWindow;
//create new window once electron finishes initialization
app.on('ready', function() {

    //create new window
    mainWindow = new BrowserWindow({
        title: "Jaelle Residences",
        // icon: "",
        show: false,
        webPreferences: {
            devTools: false
        }
    });

    //remove menu bar
    mainWindow.setMenuBarVisibility(false);

    //maximize and show the window
    mainWindow.maximize();
    mainWindow.show();

    //opens the web application
    mainWindow.loadURL(`http://${process.env.HOSTNAME}:${process.env.PORT}/`);

    //terminate the electron application on window close
    mainWindow.on('closed', function() {
        app.quit();
    });

});
