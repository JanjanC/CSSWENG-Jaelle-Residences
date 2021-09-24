const events = require("events");
const printEvent = new events.EventEmitter();

//the callback receives the argument 'data' from the emitter
function onPrintEvent(callback) {
    //invoke the callback function on a print event
    printEvent.on("print", (data) => {
        callback(data);
    });
}

//sends the parameter args to the receiver of 'print' event
function emitPrintEvent(args) {
    //create a print event
    printEvent.emit("print", args);
}

module.exports = { onPrintEvent: onPrintEvent, emitPrintEvent: emitPrintEvent };
