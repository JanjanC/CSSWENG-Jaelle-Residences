const events = require("events");
const printEvent = new events.EventEmitter();

//the callback receives the argument 'data' from the emitter
function onPrintEvent(callback) {
  printEvent.on("print", (data) => {
    callback(data);
  });
}

//sends the parameter args to the receiver of 'print' event
function emitPrintEvent(args) {
  printEvent.emit("print", args);
}

module.exports = { onPrintEvent: onPrintEvent, emitPrintEvent: emitPrintEvent };
