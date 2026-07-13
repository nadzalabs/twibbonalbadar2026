/* ==========================================
   ELEMENT
========================================== */

const preview = document.getElementById("preview");
const photo = document.getElementById("photo");

const upload = document.getElementById("upload");
const zoom = document.getElementById("zoom");

const resetBtn = document.getElementById("reset");
const downloadBtn = document.getElementById("download");


/* ==========================================
   STATE
========================================== */

let scale = 1;

let translateX = 0;
let translateY = 0;

let startX = 0;
let startY = 0;

let isDragging = false;

let baseWidth = 0;
let baseHeight = 0;


/* ==========================================
   UPDATE PHOTO
========================================== */

function updatePhoto(){

    photo.style.transform =
        `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`;

}


/* ==========================================
   AUTO FIT
========================================== */

function autoFit(){

    const box = preview.getBoundingClientRect();

    const boxWidth = box.width;
    const boxHeight = box.height;

    const imgWidth = photo.naturalWidth;
    const imgHeight = photo.naturalHeight;

    const ratio = Math.min(
        boxWidth / imgWidth,
        boxHeight / imgHeight
    );

    baseWidth = imgWidth * ratio;
    baseHeight = imgHeight * ratio;

    photo.style.width = baseWidth + "px";
    photo.style.height = baseHeight + "px";

    scale = 1;

    translateX = 0;
    translateY = 0;

    zoom.value = 1;

    updatePhoto();

}


/* ==========================================
   UPLOAD
========================================== */

upload.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file){

        return;

    }

    if(!file.type.startsWith("image/")){

        alert("Silakan pilih file gambar.");

        return;

    }

    const reader = new FileReader();

    reader.onload = function(event){

        photo.onload = function(){

            photo.style.display = "block";

            autoFit();

        }

        photo.src = event.target.result;

    }

    reader.readAsDataURL(file);

});


/* ==========================================
   ZOOM
========================================== */

zoom.addEventListener("input", function(){

    scale = Number(this.value);

    updatePhoto();

});


/* ==========================================
   DRAG DESKTOP
========================================== */

photo.addEventListener("mousedown", function(e){

    isDragging = true;

    startX = e.clientX;
    startY = e.clientY;

    photo.classList.add("dragging");

});


window.addEventListener("mousemove", function(e){

    if(!isDragging){

        return;

    }

    translateX += e.clientX - startX;
    translateY += e.clientY - startY;

    startX = e.clientX;
    startY = e.clientY;

    updatePhoto();

});


window.addEventListener("mouseup", function(){

    isDragging = false;

    photo.classList.remove("dragging");

});


/* ==========================================
   DRAG MOBILE
========================================== */

photo.addEventListener("touchstart", function(e){

    isDragging = true;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

});


window.addEventListener("touchmove", function(e){

    if(!isDragging){

        return;

    }

    translateX +=
        e.touches[0].clientX - startX;

    translateY +=
        e.touches[0].clientY - startY;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    updatePhoto();

},{passive:true});


window.addEventListener("touchend", function(){

    isDragging = false;

});


/* ==========================================
   RESPONSIVE
========================================== */

window.addEventListener("resize", function(){

    if(photo.src){

        autoFit();

    }

});
