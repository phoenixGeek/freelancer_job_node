const w3cwebsocket = require("websocket");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const axios = require("axios");
require('dotenv').config();
require("./config/global");
require("./keepAlive");
const helpers = require("./helpers/function");
const port = process.env.PORT || 3001;

app.use(logger("dev")); // print log when api is called
app.use(cors()); // using cors
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
const w3cwebsocket1 = w3cwebsocket.w3cwebsocket;
// start scraping
var client = null;
function startWebsocket() {
  client = new w3cwebsocket1(
    process.env.FREELANCER_WEBSOCKET
  );
  client.onopen = () => {
    console.log("WebSocket Client Connected");
  };

  client.onmessage = (message) => {
    // console.log('new message from websocket');
    try {
      if (message.data === "o") {
        console.log('test1');
        client.send(JSON.stringify(freelancer_data));
      }
      if (message.data !== "o" && message.data !== "h") {
        console.log('test2');
        var s2 = message.data.substring(1);
        var array_message = JSON.parse(s2);
        var data = JSON.parse(array_message);
        helpers.real_time_notification(data);
      } 
      // else {
      //   client.send(JSON.stringify(freelancer_data));
      // }
    } catch (error) {
      console.log(error);
    }
    
  };
  client.onclose = () => {
    client = null;
    console.log('websocket closed');
    setTimeout(startWebsocket, 1000);
  }
  // heartbeat();
}
// function heartbeat() {
//   console.log('hearbeat');
//   if(!client) return;
//   if(client.readyState !==1) return;
//   client.send(JSON.stringify(freelancer_data));
// }
startWebsocket();
// setInterval(heartbeat, 3000);
//running node backend on 3001 port
require("./routes")(app);
app.listen(port, function () {
  console.log("Running on " + port);
});
module.exports = app;
