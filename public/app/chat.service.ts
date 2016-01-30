import 'socketio'




const BASE_URL = 'ws://echo.websocket.org';
var ws = new WebSocket(BASE_URL);

this.ws.onerror   = (evt) => this.messages.unshift(`Error: ${evt}`);
this.ws.onmessage = (evt) => this.messages.unshift(evt.data);
this.ws.onclose   = (evt) => this.messages.unshift("** Closed **");
this.ws.onopen    = (evt) => this.messages.unshift("** Openned ***");

this.sendMessage = (name) => {
    this.ws.send(`${ name }: ${ this.message }`);
    this.message = '';
}