/* =========================================================
   Twibbon FORTASI 2026 - SMP MBS Al Badar - script.js
   Vanilla JS - No dependencies - Canvas only on download
   ========================================================= */

(function () {
  'use strict';

  /* ================= ELEMENT ================= */

  const previewEl  = document.getElementById('preview');
  const photoEl    = document.getElementById('photo');
  const frameEl    = document.getElementById('frame');
  const uploadEl   = document.getElementById('upload');
  const zoomEl     = document.getElementById('zoom');
  const resetEl    = document.getElementById('reset');
  const downloadEl = document.getElementById('download');

  /* ================= STATE ================= */

  const state = {
    scale: 1,          // zoom slider value (1 - 3)
    x: 0,               // pan offset x (px, preview space)
    y: 0,               // pan offset y (px, preview space)
    dragging: false,
    pinching: false,
    lastDistance: 0,

    // internal (required for math, not part of spec's minimal state)
    naturalWidth: 0,
    naturalHeight: 0,
    baseScale: 0,       // scale required to "cover" the preview at zoom = 1
    hasImage: false,

    startX: 0,
    startY: 0,
    startPointerX: 0,
    startPointerY: 0,

    needsRender: false
  };

  /* ================= UTILITIES ================= */

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getPreviewSize() {
    const rect = previewEl.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function requestRender() {
    state.needsRender = true;
  }

  /* ================= RENDER ================= */

  function renderLoop() {
    if (state.needsRender && state.hasImage) {
      const totalScale = state.baseScale * state.scale;
      photoEl.style.transform =
        'translate(-50%, -50%) translate(' +
        state.x + 'px, ' + state.y + 'px) scale(' + totalScale + ')';
      state.needsRender = false;
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  /* ================= BOUNDARY ================= */

  function clampPosition() {
    // Boundary disabled per request — photo can be dragged freely,
    // with no restriction, even until it moves out of view.
    return;
  }

  /* ================= AUTO FIT ================= */

  // Extra zoom baked into the auto-fit so there is always a little
  // room to drag the photo immediately, even before touching the
  // zoom slider. Purely visual headroom — boundary rules still apply.
  // Boundary is disabled (see clampPosition), so no overscan needed —
  // auto-fit stays at true cover, natural, no pre-zoom.
  const OVERSCAN = 1.0;

  function computeBaseScale() {
    const { w: pw, h: ph } = getPreviewSize();
    if (!state.naturalWidth || !state.naturalHeight) return;

    // Cover fit: scale so the image fully covers the square preview,
    // never stretching, never exposing empty area.
    const scaleToCoverW = pw / state.naturalWidth;
    const scaleToCoverH = ph / state.naturalHeight;
    state.baseScale = Math.max(scaleToCoverW, scaleToCoverH) * OVERSCAN;
  }

  function autoFit() {
    computeBaseScale();
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    zoomEl.value = 1;
    clampPosition();
    requestRender();
  }

  /* ================= UPLOAD ================= */

  function isSupportedFile(file) {
    const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return supported.indexOf(file.type) !== -1;
  }

  function handleFile(file) {
    if (!file || !isSupportedFile(file)) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        state.naturalWidth = img.naturalWidth;
        state.naturalHeight = img.naturalHeight;
        photoEl.src = e.target.result;
        photoEl.style.display = 'block'; // CSS default is display:none
        state.hasImage = true;
        autoFit();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadEl.addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    if (file) handleFile(file);
  });

  /* ================= DESKTOP DRAG ================= */

  previewEl.addEventListener('mousedown', function (e) {
    if (!state.hasImage) return;
    state.dragging = true;
    state.startX = state.x;
    state.startY = state.y;
    state.startPointerX = e.clientX;
    state.startPointerY = e.clientY;
    photoEl.classList.add('dragging');
  });

  window.addEventListener('mousemove', function (e) {
    if (!state.dragging || !state.hasImage) return;
    const dx = e.clientX - state.startPointerX;
    const dy = e.clientY - state.startPointerY;
    state.x = state.startX + dx;
    state.y = state.startY + dy;
    clampPosition();
    requestRender();
  });

  window.addEventListener('mouseup', function () {
    if (state.dragging) {
      state.dragging = false;
      photoEl.classList.remove('dragging');
    }
  });

  window.addEventListener('mouseleave', function () {
    if (state.dragging) {
      state.dragging = false;
      photoEl.classList.remove('dragging');
    }
  });

  /* ================= MOBILE DRAG ================= */

  previewEl.addEventListener('touchstart', function (e) {
    if (!state.hasImage) return;

    if (e.touches.length === 1) {
      state.dragging = true;
      state.pinching = false;
      state.startX = state.x;
      state.startY = state.y;
      state.startPointerX = e.touches[0].clientX;
      state.startPointerY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      state.dragging = false;
      state.pinching = true;
      state.lastDistance = getDistance(e.touches);
    }
  }, { passive: true });

  previewEl.addEventListener('touchmove', function (e) {
    if (!state.hasImage) return;

    if (state.pinching && e.touches.length === 2) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      if (state.lastDistance > 0) {
        const ratio = newDistance / state.lastDistance;
        state.scale = clamp(state.scale * ratio, 1, 3);
        zoomEl.value = state.scale;
      }
      state.lastDistance = newDistance;
      clampPosition();
      requestRender();
    } else if (state.dragging && e.touches.length === 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - state.startPointerX;
      const dy = e.touches[0].clientY - state.startPointerY;
      state.x = state.startX + dx;
      state.y = state.startY + dy;
      clampPosition();
      requestRender();
    }
  }, { passive: false });

  previewEl.addEventListener('touchend', function (e) {
    if (e.touches.length === 0) {
      state.dragging = false;
      state.pinching = false;
      state.lastDistance = 0;
    } else if (e.touches.length === 1) {
      // transitioned from pinch to single-finger drag
      state.pinching = false;
      state.lastDistance = 0;
      state.dragging = true;
      state.startX = state.x;
      state.startY = state.y;
      state.startPointerX = e.touches[0].clientX;
      state.startPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  previewEl.addEventListener('touchcancel', function () {
    state.dragging = false;
    state.pinching = false;
    state.lastDistance = 0;
  }, { passive: true });

  /* ================= MOUSE WHEEL ================= */

  previewEl.addEventListener('wheel', function (e) {
    if (!state.hasImage) return;
    e.preventDefault();

    const delta = -e.deltaY * 0.0015;
    state.scale = clamp(state.scale + delta * state.scale, 1, 3);
    zoomEl.value = state.scale;

    clampPosition();
    requestRender();
  }, { passive: false });

  /* ================= ZOOM SLIDER ================= */

  zoomEl.addEventListener('input', function () {
    if (!state.hasImage) return;
    state.scale = clamp(parseFloat(zoomEl.value), 1, 3);
    clampPosition();
    requestRender();
  });

  /* ================= RESET ================= */

  resetEl.addEventListener('click', function () {
    if (!state.hasImage) return;
    autoFit();
  });

  /* ================= DOWNLOAD ================= */

  function loadImageFromSrc(src) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      // NOTE: no crossOrigin here — these are same-origin/local assets.
      // Setting crossOrigin on same-origin/file:// images can cause them
      // to fail to load, which silently breaks the download.
      img.onload = function () { resolve(img); };
      img.onerror = function () {
        reject(new Error('Gagal memuat gambar: ' + src));
      };
      img.src = src;
    });
  }

  function triggerDownload(canvas) {
    let dataUrl;
    try {
      dataUrl = canvas.toDataURL('image/png', 1.0);
    } catch (err) {
      console.error('Gagal membuat file gambar (kemungkinan canvas ternoda / CORS):', err);
      alert('Gagal membuat file. Coba buka website ini lewat server (http/https) atau GitHub Pages, bukan langsung dari file di komputer.');
      return;
    }
    const link = document.createElement('a');
    link.download = 'Twibbon_AlBadar_2026.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadEl.addEventListener('click', function () {
    if (!state.hasImage) {
      alert('Silakan pilih foto terlebih dahulu.');
      return;
    }

    const CANVAS_SIZE = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const { w: pw } = getPreviewSize();
    const canvasScale = CANVAS_SIZE / pw;
    const totalScale = state.baseScale * state.scale;

    const drawW = state.naturalWidth * totalScale * canvasScale;
    const drawH = state.naturalHeight * totalScale * canvasScale;

    const centerX = CANVAS_SIZE / 2 + state.x * canvasScale;
    const centerY = CANVAS_SIZE / 2 + state.y * canvasScale;

    const drawX = centerX - drawW / 2;
    const drawY = centerY - drawH / 2;

    loadImageFromSrc(photoEl.src)
      .then(function (photoImg) {
        ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
        return loadImageFromSrc(frameEl.src);
      })
      .then(function (frameImg) {
        ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        triggerDownload(canvas);
      })
      .catch(function (err) {
        console.error('Download gagal:', err);
        alert('Download gagal: ' + err.message);
      });
  });

  /* ================= EVENTS ================= */

  window.addEventListener('resize', function () {
    if (!state.hasImage) return;
    computeBaseScale();
    clampPosition();
    requestRender();
  });

})();
