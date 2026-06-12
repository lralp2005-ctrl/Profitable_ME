const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {

    socket.on("createAvatar", (data) => {
        players[socket.id] = {
            name: data.name,
            hair: data.hair,
            shirt: data.shirt,
            x: 200,
            y: 200,
            angle: 0,
            direction: Math.floor(Math.random() * 4)
        };

        io.emit("playersUpdate", players);
    });

    socket.on("move", (pos) => {
        if (!players[socket.id]) return;

        players[socket.id].x = pos.x;
        players[socket.id].y = pos.y;
        players[socket.id].angle = pos.angle;
        players[socket.id].direction = pos.direction;

        io.emit("playersUpdate", players);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("playersUpdate", players);
    });
});

const PORT = process.env.PORT || 3001;

http.listen(PORT, () => {
    console.log("Servidor listo");
});
