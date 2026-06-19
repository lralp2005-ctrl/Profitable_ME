const express = require("express");
const app  = express();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);

app.use(express.static("public"));

/*
  El mundo ahora trabaja en espacio normalizado 0..1
  El servidor no sabe ni le importa cuántos píxeles
  tiene la pantalla de cada cliente.
  Las colisiones ocurren en este espacio y siempre
  cuadran con lo que ve el jugador, sea cual sea su pantalla.
*/
const WORLD = { w: 1, h: 1 };
const SPEED = 0.002; // ~0.2% del mundo por tick
const AVATAR_SIZE = 0.03; // tamaño del avatar en espacio normalizado

let players = {};

/* -------------------- */
/* CASAS en espacio 0..1 */
/* -------------------- */
const houses = [];
for (let i = 1; i <= 4; i++) {
    const x = (i / 5) - 0.075;
    houses.push({ x, y: 0.25 - 0.075, w: 0.15, h: 0.15 });
    houses.push({ x, y: 0.50 - 0.075, w: 0.15, h: 0.15 });
    houses.push({ x, y: 0.75 - 0.075, w: 0.15, h: 0.15 });
}

function collidesWithHouse(x, y) {
    for (const house of houses) {
        if (
            x < house.x + house.w &&
            x + AVATAR_SIZE > house.x &&
            y < house.y + house.h &&
            y + AVATAR_SIZE > house.y
        ) return true;
    }
    return false;
}

function getSafeSpawn() {
    while (true) {
        const x = Math.random() * 0.8;
        const y = Math.random() * 0.8;
        if (!collidesWithHouse(x, y)) return { x, y };
    }
}

/* -------------------- */
/* BUCLE DE MOVIMIENTO */
/* -------------------- */
setInterval(() => {
    for (let id in players) {
        const p = players[id];

        if (p.direction === undefined) p.direction = Math.floor(Math.random() * 4);
        if (Math.random() < 0.01) p.direction = Math.floor(Math.random() * 4);

        let nx = p.x, ny = p.y;
        if (p.direction === 0) ny -= SPEED;
        if (p.direction === 1) ny += SPEED;
        if (p.direction === 2) nx -= SPEED;
        if (p.direction === 3) nx += SPEED;

        if (collidesWithHouse(nx, ny)) {
            p.direction = Math.floor(Math.random() * 4);
        } else {
            p.x = nx;
            p.y = ny;
        }

        if (p.direction === 0) p.angle = 180;
        if (p.direction === 1) p.angle = 0;
        if (p.direction === 2) p.angle = 90;
        if (p.direction === 3) p.angle = 270;

        // Límites del mundo
        if (p.x < 0)   { p.x = 0;   p.direction = 3; }
        if (p.x > 0.97) { p.x = 0.97; p.direction = 2; }
        if (p.y < 0)   { p.y = 0;   p.direction = 1; }
        if (p.y > 0.97) { p.y = 0.97; p.direction = 0; }
    }
    io.emit("playersUpdate", players);
}, 30);

/* -------------------- */
/* CONEXIONES */
/* -------------------- */
io.on("connection", (socket) => {
    socket.emit("initWorld", { houses });

    socket.on("createAvatar", (data) => {
        const id    = Date.now().toString() + Math.floor(Math.random() * 10000);
        const spawn = getSafeSpawn();
        players[id] = {
            id, name: data.name, hair: data.hair, shirt: data.shirt,
            x: spawn.x, y: spawn.y,
            direction: Math.floor(Math.random() * 4),
            angle: 0
        };
        io.emit("playersUpdate", players);
    });

    socket.on("disconnect", () => {
        console.log("Jugador desconectado");
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));
