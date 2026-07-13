const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#ffffff";
ctx.fillRect(0,0,1080,1080);

ctx.font = "40px Arial";
ctx.fillStyle = "#555";
ctx.textAlign = "center";
ctx.fillText("Twibbon Generator",540,540);
