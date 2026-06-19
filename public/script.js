const socket = io();

/* -------------------- */
/* ELEMENTOS */
/* -------------------- */
const introScreen      = document.getElementById("introScreen");
const createScreen     = document.getElementById("createScreen");
const worldScreen      = document.getElementById("worldScreen");
const startButton      = document.getElementById("startButton");
const createButton     = document.getElementById("createButton");
const openCreateButton = document.getElementById("openCreateButton");
const world            = document.getElementById("world");
const moneyText        = document.getElementById("money");

let money = 0;

/*
  El servidor envía posiciones en espacio 0..1.
  El cliente multiplica por el tamaño real del elemento #world
  para obtener los píxeles. Como #world ocupa siempre
  100% de la pantalla, todo cuadra en cualquier dispositivo.
*/
function toPixels(val, axis) {
    return val * (axis === "x" ? world.offsetWidth : world.offsetHeight);
}

/* -------------------- */
/* CASAS */
/* -------------------- */
socket.on("initWorld", (data) => {
    document.querySelectorAll(".house").forEach(h => h.remove());

    const roofs = [
        "images/roof-brown.png",  "images/roof-yellow.png",
        "images/roof-blue.png",   "images/roof-red.png",
        "images/roof-purple.png"
    ];

    for (const house of data.houses) {
        const div = document.createElement("div");
        div.classList.add("house");
        // Posición y tamaño en porcentaje — se adaptan solos a cualquier pantalla
        div.style.left   = (house.x * 100) + "%";
        div.style.top    = (house.y * 100) + "%";
        div.style.width  = (house.w * 100) + "%";
        div.style.height = (house.h * 100) + "%";
        div.style.backgroundSize = "contain";  // imagen completa dentro del div
        div.style.backgroundImage = `url("${roofs[Math.floor(Math.random() * roofs.length)]}")`;
        world.appendChild(div);
    }
});

/* -------------------- */
/* NAVEGACIÓN */
/* -------------------- */
startButton.addEventListener("click", () => {
    introScreen.style.display = "none";
    createScreen.style.display = "flex";
});

openCreateButton.addEventListener("click", () => {
    createScreen.style.display = "flex";
    worldScreen.style.display  = "none";
});

/* -------------------- */
/* CREAR AVATAR */
/* -------------------- */
createButton.addEventListener("click", () => {
    const name       = document.getElementById("nameInput").value.trim();
    const hairColor  = document.getElementById("hairInput").value.trim();
    const shirtColor = document.getElementById("shirtInput").value.trim();
    const age        = document.getElementById("ageInput").value.trim();
    const job        = document.getElementById("jobInput").value.trim();

    if (!name || !hairColor || !shirtColor || !age || !job) {
        alert("Please answer all questions before creating your Profitable ME.");
        return;
    }

    socket.emit("createAvatar", { name, hair: hairColor, shirt: shirtColor, age, job });

    ["nameInput","hairInput","shirtInput","ageInput","jobInput"]
        .forEach(id => document.getElementById(id).value = "");

    money += 10;
    moneyText.textContent = money;

    createScreen.style.display = "none";
    worldScreen.style.display  = "block";

    document.activeElement?.blur();
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
        // Convierte 0..1 a píxeles reales de la pantalla actual
        avatar.style.left = toPixels(p.x, "x") + "px";
        avatar.style.top  = toPixels(p.y, "y") + "px";
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
