const socket = io();

/* -------------------- */
/* ELEMENTOS */
/* -------------------- */

const introScreen = document.getElementById("introScreen");
const createScreen = document.getElementById("createScreen");
const worldScreen = document.getElementById("worldScreen");

const startButton = document.getElementById("startButton");
const createButton = document.getElementById("createButton");
const openCreateButton = document.getElementById("openCreateButton");

const world = document.getElementById("world");
const moneyText = document.getElementById("money");

let money = 0;

/* -------------------- */
/* CASAS */
/* -------------------- */

const width = window.innerWidth;
const height = window.innerHeight;
const houses = [];

function createHouse(x, y) {

    const colors = [
        "#d96c6c",
        "#6c8cd9",
        "#6cd98f",
        "#d9c16c",
        "#c06cd9"
    ];

    const color =
        colors[Math.floor(Math.random() * colors.length)];

    const house = document.createElement("div");

    house.classList.add("house");

    house.style.left = x + "px";
    house.style.top = y + "px";
    house.style.backgroundColor = color;

    house.innerHTML = `
        <div class="houseLine"></div>
    `;

    world.appendChild(house);
    
    houses.push({
    x,
    y,
    width: 150,
    height: 120
});
    
}

for (let i = 1; i <= 4; i++) {
    createHouse((width / 5) * i - 75, height / 4 - 60);
    createHouse((width / 5) * i - 75, height / 4 * 2 - 60);
    createHouse((width / 5) * i - 75, height / 4 * 3 - 60);
}

/* -------------------- */
/* NAVEGACIÓN */
/* -------------------- */

startButton.addEventListener("click", () => {
    introScreen.style.display = "none";
    createScreen.style.display = "flex";
});

openCreateButton.addEventListener("click", () => {
    createScreen.style.display = "flex";
    worldScreen.style.display = "none";
});

/* -------------------- */
/* CREAR AVATAR */
/* -------------------- */

createButton.addEventListener("click", () => {

    const name = document.getElementById("nameInput").value || "Player";
    const hairColor = document.getElementById("hairInput").value || "brown";
    const shirtColor = document.getElementById("shirtInput").value || "blue";

    socket.emit("createAvatar", {
        name,
        hair: hairColor,
        shirt: shirtColor
    });

    money += 10;
    moneyText.textContent = money;

    createScreen.style.display = "none";
    worldScreen.style.display = "block";
});

/* -------------------- */
/* RENDER MULTIPLAYER */
/* -------------------- */

const playersContainer = document.createElement("div");
world.appendChild(playersContainer);

socket.on("playersUpdate", (players) => {

    playersContainer.innerHTML = "";

    for (let id in players) {

        const p = players[id];

        const avatar = document.createElement("div");
        avatar.classList.add("avatar");

        avatar.style.left = p.x + "px";
        avatar.style.top = p.y + "px";

        avatar.innerHTML = `
            <div class="name">${p.name}</div>
            <div class="body" style="transform: rotate(${p.angle}deg)">
                <div class="arms" style="background:${p.shirt}"></div>
                <div class="head"></div>
                <div class="hair" style="background:${p.hair}"></div>
            </div>
        `;

        playersContainer.appendChild(avatar);
    }
});
