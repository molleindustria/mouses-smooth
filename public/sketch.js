//check README.md for more information

/// <reference path="TSDef/p5.global-mode.d.ts" />

//create a socket connection
var socket;
var pointer;
//I send updates at the same rate as the server update
var UPDATE_TIME = 1000 / 10;

//the smoothing is exaggerated to be perceivable 
var SMOOTHING = 10;

//this object mirrors the players in the game state, 
//the main difference the gameState contains "real" but old coordinate received from the server
//the local players "chase" the real coordinates one with an easing function instead of jumping from update to update
var players;

//reference the latest gameState
var gameState;

//setup is called when all the assets have been loaded
function preload() {
    //load the image and store it in pointer
    pointer = loadImage('assets/pointer.png');
}

function setup() {
    //create a canvas
    createCanvas(800, 600);
    //paint it white
    background(255, 255, 255);

    //empty object
    players = {};

    //I create socket but I wait to assign all the functions before opening a connection
    socket = io({
        autoConnect: false
    });

    //detects a server connection 
    socket.on('connect', onConnect);
    //handles the messages from the server, the parameter is a string
    socket.on('message', onMessage);
    //handles the user action broadcast by the server, the parameter is an object
    socket.on('state', updateState);

    socket.open();

    //every x time I update the server on my position
    setInterval(function () {
        socket.emit('clientUpdate', { x: mouseX, y: mouseY });
    }, UPDATE_TIME);
}

//this p5 function is called continuously 60 times per second by default
function draw() {
    //draw a white background
    background(255, 255, 255);

    //make sure I received the first update
    if (gameState != null) {

        //iterate through the players
        for (var playerId in gameState.players) {
            if (gameState.players.hasOwnProperty(playerId)) {

                //if a new player appears in the game state add it here too
                if (players.hasOwnProperty(playerId) == false) {
                    //the new player coordinates are whatever the server sends
                    players[playerId] = { x: gameState.players[playerId].x, y: gameState.players[playerId].y }
                }

                //in this case I don't have to draw the pointer at my own position
                //but I'm drawing it to visualize the lag due to the low update rate 

                //if (playerId != socket.id) {
                //the latest game state coordinates are my destination
                var targetX = gameState.players[playerId].x;
                var targetY = gameState.players[playerId].y;

                //the current coordinates are eased in
                players[playerId].x += (targetX - players[playerId].x) / SMOOTHING;
                players[playerId].y += (targetY - players[playerId].y) / SMOOTHING;

                //draw a pointer image for each player except for myself
                image(pointer, players[playerId].x, players[playerId].y);
                //}
            }
        }

        //
    }
}

//called by the server every 30 fps
function updateState(state) {
    gameState = state;
    //the rendering of the state is now done in the draw function, at 60 fps
}

//connected to the server
function onConnect() {
    if (socket.id) {
        console.log("Connected to the server");
        socket.emit('newPlayer', { x: mouseX, y: mouseY });
    }
}

//a message from the server
function onMessage(msg) {
    if (socket.id) {
        console.log("Message from server: " + msg);
    }
}