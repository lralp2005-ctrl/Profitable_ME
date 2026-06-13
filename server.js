const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

setInterval(() => {

    for (let id in players) {

        const player = players[id];

        if (player.direction === undefined) {
            player.direction = Math.floor(Math.random() * 4);
        }

        if (Math.random() < 0.01) {
            player.direction = Math.floor(Math.random() * 4);
        }

        const speed = 2;

       if (player.direction === 0) player.y -= speed;
if (player.direction === 1) player.y += speed;
if (player.direction === 2) player.x -= speed;
if (player.direction === 3) player.x += speed;

if (player.direction === 0) player.angle = 180;
if (player.direction === 1) player.angle = 0;
if (player.direction === 2) player.angle = 90;
if (player.direction === 3) player.angle = 270;

        if (player.x < 0) {
            player.x = 0;
            player.direction = 3;
        }

        if (player.x > 1400) {
            player.x = 1400;
            player.direction = 2;
        }

        if (player.y < 0) {
            player.y = 0;
            player.direction = 1;
        }

        if (player.y > 800) {
            player.y = 800;
            player.direction = 0;
        }
    }

    io.emit("playersUpdate", players);

}, 30);

io.on("connection", (socket) => {

    console.log("Jugador conectado");

    socket.on("createAvatar", (data) => {

        const avatarId =
            Date.now().toString() +
            Math.floor(Math.random() * 10000);

       players[avatarId] = {
    id: avatarId,
    name: data.name,
    hair: data.hair,
    shirt: data.shirt,
    x: Math.random() * 800,
    y: Math.random() * 500,
    direction: Math.floor(Math.random() * 4)
};

        io.emit("playersUpdate", players);
    });

    socket.on("disconnect", () => {

        io.emit("playersUpdate", players);

    });

});

const PORT = process.env.PORT || 3001;

http.listen(PORT, () => {
    console.log("Servidor listo");
});
