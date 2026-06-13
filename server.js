const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

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

            y: Math.random() * 500
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
