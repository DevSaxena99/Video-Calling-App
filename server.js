var webSocketServ = require('ws').Server;


var wss = new webSocketServ({
  port: 9090
})

var users = {};
var otherUser;
wss.on('connection', function(conn) {
  console.log("User connected");

  conn.on('message', function(message) {
    var data;

    try {
      data = JSON.parse(message);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }

    switch (data.type) {

      case "login":
        if (users[data.name]) {
          sendToOtherUser(conn, {
            type: "login",
            success: false
          })
        } else {
          users[data.name] = conn;
          conn.name = data.name

          sendToOtherUser(conn, {
            type: "login",
            success: true
          })
        }

        break;
      case "offer":

        var connect = users[data.name];
        if (connect != null) {
          conn.otherUser = data.name;

          sendToOtherUser(connect, {
            type: "offer",
            offer: data.offer,
            name: conn.name
          })
        }

        break;

      case "answer":

        var connect = users[data.name];

        if (connect != null) {
          conn.otherUser = data.name;
          sendToOtherUser(connect, {
            type: "answer",
            answer: data.answer
          })
        }

        break;

      case "candidate":

        var connect = users[data.name];

        if (connect != null) {
          sendToOtherUser(connect, {
            type: "candidate",
            candidate: data.candidate
          })
        }
        break;

      case "reject":

      var connect = users[data.name];

      if (connect != null) {
          sendToOtherUser(connect, {
              type: "reject",
              name: conn.name
          })
      }
      break;

      case "accept":

      var connect = users[data.name];

      if (connect != null) {
          sendToOtherUser(connect, {
              type: "accept",
              name: conn.name
          })
      }
      break;


    }

  })

  conn.on('close', function() {
    console.log('Connection closed');
  })

  conn.send("hello world");

})

function sendToOtherUser(connection, message) {
  connection.send(JSON.stringify(message))
}
