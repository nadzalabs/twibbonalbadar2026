// ========================================
// ELEMENT
// ========================================

const upload = document.getElementById("upload");
const photo = document.getElementById("photo");
const loading = document.getElementById("loading");
const preview = document.getElementById("preview");
const zoom = document.getElementById("zoom");

// ========================================
// STATE
// ========================================

let imageLoaded = false;

let currentScale = 1;

let translateX = 0;

let translateY = 0;

let baseWidth = 0;

let baseHeight = 0;

// ========================================
// SHOW LOADING
// ========================================

function showLoading(){

    loading.classList.remove("hidden");

}

// ========================================
// HIDE LOADING
// ========================================

function hideLoading(){

    loading.classList.add("hidden");

}

// ========================================
// RESET TRANSFORM
// ========================================

function resetTransform(){

    currentScale = 1;

    translateX = 0;

    translateY = 0;

    zoom.value = 1;

}

// ========================================
// APPLY CSS TRANSFORM
// ========================================

function updatePhoto(){

    photo.style.transform =
        `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${currentScale})`;

}

// ========================================
// AUTO FIT
// ========================================

function autoFit(){

    const box = preview.getBoundingClientRect();

    const boxSize = Math.min(box.width, box.height);

    const imgRatio =
        photo.naturalWidth / photo.naturalHeight;

    if(imgRatio > 1){

        baseWidth = boxSize;

        baseHeight = boxSize / imgRatio;

    }else{

        baseHeight = boxSize;

        baseWidth = boxSize * imgRatio;

    }

    photo.style.width = baseWidth + "px";

    photo.style.height = baseHeight + "px";

    resetTransform();

    updatePhoto();

}

// ========================================
// UPLOAD FOTO
// ========================================

upload.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file){

        return;

    }

    if(!file.type.startsWith("image/")){

        alert("File harus berupa gambar.");

        return;

    }

    showLoading();

    const reader = new FileReader();

    reader.onload = function(event){

        photo.onload = function(){

            imageLoaded = true;

            photo.style.display = "block";

            autoFit();

            hideLoading();

        };

        photo.src = event.target.result;

    };

    reader.readAsDataURL(file);

});

// ========================================
// RESPONSIVE
// ========================================

window.addEventListener("resize", function(){

    if(imageLoaded){

        autoFit();

    }

});
