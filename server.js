const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

const houses = [];

for (let i = 1; i <= 4; i++) {

    houses.push({
        x: (1400 / 5) * i - 75,
        y: 800 / 4 - 60,
        width: 160,
        height: 120
    });

    houses.push({
        x: (1400 / 5) * i - 75,
        y: 800 / 4 * 2 - 60,
        width: 160,
        height: 120
    });

    houses.push({
        x: (1400 / 5) * i - 75,
        y: 800 / 4 * 3 - 60,
        width: 160,
        height: 120
    });
}

function collidesWithHouse(x, y) {

    const avatarSize = 30;

    for (const house of houses) {

        if (
            x < house.x + house.width &&
            x + avatarSize > house.x &&
            y < house.y + house.height &&
            y + avatarSize > house.y
        ) {
            return true;
        }
    }

    return false;
}

function getSafeSpawn() {

    while (true) {

        const x = Math.random() * 800;
        const y = Math.random() * 500;

        let collision = false;

        for (const house of houses) {

            if (
                x < house.x + house.width &&
                x + 40 > house.x &&
                y < house.y + house.height &&
                y + 40 > house.y
            ) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            return { x, y };
        }
    }
}

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

      let newX = player.x;
let newY = player.y;

if (player.direction === 0) newY -= speed;
if (player.direction === 1) newY += speed;
if (player.direction === 2) newX -= speed;
if (player.direction === 3) newX += speed;

if (collidesWithHouse(newX, newY)) {

    player.direction = Math.floor(Math.random() * 4);

} else {

    player.x = newX;
    player.y = newY;

}

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

       const spawn = getSafeSpawn();

players[avatarId] = {
    id: avatarId,
    name: data.name,
    hair: data.hair,
    shirt: data.shirt,
    x: spawn.x,
    y: spawn.y,
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
