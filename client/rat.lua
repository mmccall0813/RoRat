-- Synapse X is current the only supported exploit so far.
-- If other exploits have websocket support, I will try to add it.

local instanceIP = "127.0.0.1" -- change this to your server ip
local instancePort = "3001" -- change this to your server port
local WebSocket = syn.websocket.connect("ws://" .. instanceIP .. ":" .. instancePort .. "/")
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

WebSocket.OnMessage:Connect(function(msg)
    local decoded = fromJson(msg);
    types[decoded.type](decoded);
end)

WebSocket.OnClose:Connect(function(close)
    
end)

local initInfo = {
    type = "init",
    name = localPlayer.Name,
    jobID = game.JobId,
    gameID = game.PlaceId,
    userID = localPlayer.UserId,
    gameName = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name
}

WebSocket:Send(toJson(initInfo))