//import the necessary modules
const electron = require("electron");
//retrieves the necessary attributes from electron
const { app, BrowserWindow } = electron;

let mainWindow;

//create new window once electron finishes initialization
app.on("ready", function () {
  //create new window
  mainWindow = new BrowserWindow({
    title: "Jaelle Residences",
    show: false,
    // icon: "",
    autoHideMenuBar: true,
  });

  //opens the web application
  mainWindow.loadFile(`index.html`);

  mainWindow.webContents.once("dom-ready", () => {
    print();
  });

  function print(copies = 3, delay = 1500) {
    let counter = 1;
    let printDataPassed = false;
    _print();

    //checks whether to print another copy or wait
    //does nothing when the printer is printing the current copy, status === 1024
    //if the printer is done printing, proceed to print next copy after a certain delay
    //stops checking if all copies have been printed
    let interval = setInterval(() => {
      if (mainWindow.webContents.getPrinters()[4].status === 1024) {
        printDataPassed = true;
      } else if (
        printDataPassed &&
        mainWindow.webContents.getPrinters()[4].status === 0
      ) {
        setTimeout(_print, delay);
        printDataPassed = false;
        counter++;
      }

      if (counter >= copies) {
        clearInterval(interval);
      }
    }, 10);
  }

  function _print() {
    mainWindow.webContents.print({
      silent: true,
    });
  }

  //terminate the electron application on window close
  mainWindow.on("closed", function () {
    app.quit();
  });
});
