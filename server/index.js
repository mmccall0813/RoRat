// Port Vars
const webPort = process.env.PORT || 3000;
const socketPort = process.env.SOCKETPORT || 3001;

// Web UI will use socket.io to communicate with the server
// Lua client will use websockets to communicate with the server

// Init webserver
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);
const sleep = require('util').promisify(setTimeout);
const snekfetch = require('snekfetch');

app.use(express.static('../panel/'));

http.listen(webPort, () => {
    console.log('Web UI listening on port ' + webPort);   
    console.log("Ctrl-Click this link to open the web UI in your browser: http://localhost:" + webPort);
});

io.on('connection', (socket) => {
    console.log('Web UI connected to socket.io');
    socket.emit('usersUpdated', JSON.stringify(clientInfo)); // Send the list of users to the client
    socket.on("execute", (data) => {
        data = JSON.parse(data);
        console.log("execute");
        console.log(data);
        var client = clientInfo.find(x => x.userId == data.userId);   
        if(client != null){
            var socket = clients.find(x => x.userId == data.userId);
            if(socket != null){
                socket.send(JSON.stringify({
                    type: "eval",
                    code: data.code
                }))
            }
        }
    })
});


// Init socket server
const ws = require("ws");
const wss = new ws.Server({
    port: socketPort
});

let clients = []; // Array of all connected Lua clients
let clientInfo = [];

function onUsersUpdated() {
    io.emit('usersUpdated', JSON.stringify(clientInfo));
}

wss.on('connection', async (client, req) => {
    client.id = Math.floor(Math.random() * 1000000); // Assign a random ID to the client

    var initalized = false;
    client.on("message", async (data) => {
        let json = JSON.parse(data.toString()); // Parse the data as JSON
        console.log("Received message from client: " + JSON.stringify(json, null, 2));
        switch(json.type) {
            case "init":
                initalized = true;

                // Get profile url
                let apiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${json.userID}&size=150x150&format=png`;
                let response = await snekfetch.get(apiUrl);
                let profilePicture = response.body.data[0].imageUrl;

                client.userId = json.userID;
                client.name = json.name;
                client.gameId = json.gameID;
                client.jobId = json.jobID;
                client.profilePicture = profilePicture;
                client.gameName = json.gameName;

                clientInfo.push({
                    userId: client.userId,
                    name: client.name,
                    gameId: client.gameId,
                    jobId: client.jobId,
                    profilePicture: client.profilePicture,
                    gameName: client.gameName
                });

                onUsersUpdated(); // broadcast the new user list to web panel

            break;

        }
    })
    client.on("close", (num) => {
        console.log(`Lua client ${client.id} disconnected with code ${num}`);
        var index = clients.indexOf(client);
        clients.splice(index, 1);
        clientInfo.splice(index, 1);
        onUsersUpdated();
    })
    console.log(`Lua client ${client.id} connected`);
    console.log(`${client._socket.remoteAddress} connected`);
    clients.push(client);

    await sleep(10000);

    if (!initalized) {
        client.close(1000, "Did not send initialization message");
        // websocket client did not send initialization message
    }
})