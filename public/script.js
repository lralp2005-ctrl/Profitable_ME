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

// CASAS (VIENEN DEL SERVIDOR)
socket.on("initWorld", (data) => {

    console.log("CASAS:", data.houses);

    for (const house of data.houses) {

        const houseDiv = document.createElement("div");
        houseDiv.classList.add("house");

        houseDiv.style.left = house.x + "px";
        houseDiv.style.top = house.y + "px";

        const roofs = [
            "images/roof-brown.png",
            "images/roof-yellow.png",
            "images/roof-blue.png",
            "images/roof-red.png",
            "images/roof-purple.png"
        ];

        const randomRoof =
            roofs[Math.floor(Math.random() * roofs.length)];

        houseDiv.style.backgroundImage = `url("${randomRoof}")`;

        world.appendChild(houseDiv);
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
    worldScreen.style.display = "none";
});

/* -------------------- */
/* CREAR AVATAR */
/* -------------------- */

createButton.addEventListener("click", () => {

    const name = document.getElementById("nameInput").value.trim();
    const hairColor = document.getElementById("hairInput").value.trim();
    const shirtColor = document.getElementById("shirtInput").value.trim();
    const age = document.getElementById("ageInput").value.trim();
    const job = document.getElementById("jobInput").value.trim();

    // VALIDACIÓN (OBLIGA A RELLENAR TODO)
    if (!name || !hairColor || !shirtColor || !age || !job) {
    alert("Please answer all questions before creating your Profitable ME.");
    return;
}

    socket.emit("createAvatar", {
    name,
    hair: hairColor,
    shirt: shirtColor,
    age,
    job,
});
    document.getElementById("nameInput").value = "";
document.getElementById("hairInput").value = "";
document.getElementById("shirtInput").value = "";
    document.getElementById("ageInput").value = "";
document.getElementById("jobInput").value = "";

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
