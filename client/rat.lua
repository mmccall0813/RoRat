local ws;

if not syn.websocket.connect then ws = function(a)
		return WebSocket.connect(a)
end else ws = syn.websocket.connect end


local instanceIP = "127.0.0.1" -- change this to your server ip
local instancePort = "3001" -- change this to your server port
local websocket = ws("ws://" .. instanceIP .. ":" .. instancePort .. "/")
local HttpService = game:GetService("HttpService");

function toJson(input)
    return HttpService:JSONEncode(input)
end

function fromJson(input)
    return HttpService:JSONDecode(input)
end

-- Regular vars
local Players = game:GetService("Players")
local localPlayer = Players.localPlayer

function evalCode(msg)
    loadstring(msg.code)()
end

local types = {
    eval = evalCode
}

websocket.OnMessage:Connect(function(msg)
    local decoded = fromJson(msg);
    types[decoded.type](decoded);
end)

websocket.OnClose:Connect(function(close)
    
end)

local initInfo = {
    type = "init",
    name = localPlayer.Name,
    jobID = game.JobId,
    gameID = game.PlaceId,
    userID = localPlayer.UserId,
    gameName = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name
}

websocket:Send(toJson(initInfo))