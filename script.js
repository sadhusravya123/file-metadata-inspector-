const fileInput=document.getElementById("fileInput");
const dropArea=document.getElementById("dropArea");

const imagePreview=document.getElementById("imagePreview");
const pdfPreview=document.getElementById("pdfPreview");

const nameText=document.getElementById("name");
const sizeText=document.getElementById("size");
const typeText=document.getElementById("type");
const modifiedText=document.getElementById("modified");

const dimension=document.getElementById("dimension");
const camera=document.getElementById("camera");
const date=document.getElementById("date");
const gps=document.getElementById("gps");

const pages=document.getElementById("pages");
const author=document.getElementById("author");
const creator=document.getElementById("creator");
const title=document.getElementById("title");

const copyBtn=document.getElementById("copyBtn");
const downloadBtn=document.getElementById("downloadBtn");
const themeBtn=document.getElementById("themeBtn");

let metadata={};

fileInput.addEventListener("change",e=>{
loadFile(e.target.files[0]);
});

dropArea.addEventListener("dragover",e=>{
e.preventDefault();
dropArea.classList.add("drag");
});

dropArea.addEventListener("dragleave",()=>{
dropArea.classList.remove("drag");
});

dropArea.addEventListener("drop",e=>{
e.preventDefault();
dropArea.classList.remove("drag");
loadFile(e.dataTransfer.files[0]);
});

function loadFile(file){

if(!file)return;

metadata={};

nameText.textContent="Name : "+file.name;
sizeText.textContent="Size : "+(file.size/1024).toFixed(2)+" KB";
typeText.textContent="Type : "+file.type;
modifiedText.textContent="Modified : "+new Date(file.lastModified).toLocaleString();

metadata.name=file.name;
metadata.size=file.size;
metadata.type=file.type;
metadata.modified=new Date(file.lastModified).toLocaleString();

if(file.type.startsWith("image")){
showImage(file);
}
else if(file.type==="application/pdf"){
showPDF(file);
}

}
function showImage(file){

pdfPreview.style.display="none";
imagePreview.style.display="block";

const reader=new FileReader();

reader.onload=function(e){

imagePreview.src=e.target.result;

imagePreview.onload=function(){

dimension.textContent="Dimensions : "+imagePreview.naturalWidth+" × "+imagePreview.naturalHeight;

metadata.width=imagePreview.naturalWidth;
metadata.height=imagePreview.naturalHeight;

EXIF.getData(imagePreview,function(){

let make=EXIF.getTag(this,"Make")||"-";
let model=EXIF.getTag(this,"Model")||"-";
let dt=EXIF.getTag(this,"DateTimeOriginal")||"-";
let lat=EXIF.getTag(this,"GPSLatitude");
let lon=EXIF.getTag(this,"GPSLongitude");

camera.textContent="Camera : "+make+" "+model;
date.textContent="Captured : "+dt;
gps.textContent="GPS : "+(lat&&lon?"Available":"Not Available");

metadata.camera=make+" "+model;
metadata.captureDate=dt;
metadata.gps=lat&&lon?"Available":"Not Available";

});

};

};

reader.readAsDataURL(file);

}

async function showPDF(file){

imagePreview.style.display="none";
pdfPreview.style.display="block";

dimension.textContent="Dimensions : -";
camera.textContent="Camera : -";
date.textContent="Captured : -";
gps.textContent="GPS : -";

const reader=new FileReader();

reader.onload=async function(){

const typed=new Uint8Array(reader.result);

const pdf=await pdfjsLib.getDocument({data:typed}).promise;

pages.textContent="Pages : "+pdf.numPages;

metadata.pages=pdf.numPages;

const meta=await pdf.getMetadata().catch(()=>null);

if(meta){

author.textContent="Author : "+(meta.info.Author||"-");
creator.textContent="Creator : "+(meta.info.Creator||"-");
title.textContent="Title : "+(meta.info.Title||"-");

metadata.author=meta.info.Author||"-";
metadata.creator=meta.info.Creator||"-";
metadata.title=meta.info.Title||"-";

}

const page=await pdf.getPage(1);

const viewport=page.getViewport({scale:1});

const ctx=pdfPreview.getContext("2d");

pdfPreview.width=viewport.width;

pdfPreview.height=viewport.height;

await page.render({

canvasContext:ctx,
viewport:viewport

}).promise;

};

reader.readAsArrayBuffer(file);

}
copyBtn.addEventListener("click",()=>{

let text="";

for(let key in metadata){
text+=key+" : "+metadata[key]+"\n";
}

navigator.clipboard.writeText(text);

alert("Metadata Copied!");

});

downloadBtn.addEventListener("click",()=>{

const blob=new Blob(
[
JSON.stringify(metadata,null,2)
],
{
type:"application/json"
});

const link=document.createElement("a");

link.href=URL.createObjectURL(blob);

link.download="metadata.json";

link.click();

});

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark");

themeBtn.textContent=
document.body.classList.contains("dark")
?
"☀ Light Mode"
:
"🌙 Dark Mode";

});

function clearFields(){

dimension.textContent="Dimensions : -";
camera.textContent="Camera : -";
date.textContent="Captured : -";
gps.textContent="GPS : -";

pages.textContent="Pages : -";
author.textContent="Author : -";
creator.textContent="Creator : -";
title.textContent="Title : -";

}

window.addEventListener("load",()=>{

clearFields();

});
