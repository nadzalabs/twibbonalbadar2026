const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const zoomSlider = document.getElementById("zoom");
const downloadBtn = document.getElementById("download");

const frame = new Image();
frame.src = "frame.png";

let photo = null;

let scale = 1;

let posX = 540;
let posY = 540;

let dragging = false;

let startX = 0;
let startY = 0;

const SIZE = 1080;

canvas.width = SIZE;
canvas.height = SIZE;

function drawCanvas() {

    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    if (photo) {

        const w = photo.width * scale;
        const h = photo.height * scale;

        ctx.drawImage(
            photo,
            posX - w / 2,
            posY - h / 2,
            w,
            h
        );
    }

    if (frame.complete) {

        ctx.drawImage(frame, 0, 0, SIZE, SIZE);

    }

}

frame.onload = drawCanvas;

upload.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        photo = new Image();

        photo.onload = function(){

            const ratio = Math.max(
                SIZE / photo.width,
                SIZE / photo.height
            );

            scale = ratio;

            zoomSlider.value = 1;

            posX = SIZE / 2;
            posY = SIZE / 2;

            drawCanvas();

        };

        photo.src = event.target.result;

    };

    reader.readAsDataURL(file);

});

zoomSlider.addEventListener("input", function(){

    if(!photo) return;

    const ratio = Math.max(
        SIZE / photo.width,
        SIZE / photo.height
    );

    scale = ratio * parseFloat(this.value);

    drawCanvas();

});

canvas.addEventListener("mousedown", function(e){

    dragging = true;

    startX = e.offsetX;
    startY = e.offsetY;

    canvas.style.cursor = "grabbing";

});

window.addEventListener("mouseup", function(){

    dragging = false;

    canvas.style.cursor = "grab";

});

window.addEventListener("mousemove", function(e){

    if(!dragging) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleCanvas = SIZE / rect.width;

    posX += (x - startX) * scaleCanvas;
    posY += (y - startY) * scaleCanvas;

    startX = x;
    startY = y;

    drawCanvas();

});

canvas.addEventListener("touchstart", function(e){

    dragging = true;

    const rect = canvas.getBoundingClientRect();

    startX = e.touches[0].clientX - rect.left;
    startY = e.touches[0].clientY - rect.top;

});

canvas.addEventListener("touchmove", function(e){

    if(!dragging) return;

    e.preventDefault();

    const rect = canvas.getBoundingClientRect();

    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const scaleCanvas = SIZE / rect.width;

    posX += (x - startX) * scaleCanvas;
    posY += (y - startY) * scaleCanvas;

    startX = x;
    startY = y;

    drawCanvas();

},{passive:false});

canvas.addEventListener("touchend", function(){

    dragging = false;

});

downloadBtn.addEventListener("click", function(){

    drawCanvas();

    const link = document.createElement("a");

    link.download = "Twibbon_FORTASI_2025.png";

    link.href = canvas.toDataURL("image/png");

    link.click();

});

drawCanvas();
