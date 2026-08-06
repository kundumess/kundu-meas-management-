import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const table = document.getElementById("report");
const monthInput = document.getElementById("reportMonth");

// Current month
monthInput.value = new Date().toISOString().slice(0,7);

// Header
const header = table.querySelector("thead tr");

for(let i=1;i<=31;i++){

    const th=document.createElement("th");
    th.textContent=i;
    header.appendChild(th);

}

const total=document.createElement("th");
total.textContent="Total";
header.appendChild(total);


// Load Report

document.getElementById("load").onclick=async()=>{

const tbody=document.querySelector("#report tbody");
tbody.innerHTML="";

const selectedMonth=monthInput.value;

const snapshot=await getDocs(collection(db,"Attendance"));

let report={};

snapshot.forEach(docSnap=>{

if(!docSnap.id.startsWith(selectedMonth)) return;

const dayNo=Number(docSnap.id.split("-")[2]);

const data=docSnap.data();

for(const name in data){

if(!report[name]){

report[name]={

day:Array(31).fill("X"),

night:Array(31).fill("X")

};

}

report[name].day[dayNo-1]=data[name].day?"✓":"X";

report[name].night[dayNo-1]=data[name].night?"✓":"X";

}

});


for(const name in report){

let dayRow=`<tr><td>${name}</td><td>Day</td>`;

let nightRow=`<tr><td></td><td>Night</td>`;

let totalAttendance=0;

report[name].day.forEach(v=>{

if(v==="✓") totalAttendance++;

dayRow+=`<td>${v}</td>`;

});

report[name].night.forEach(v=>{

if(v==="✓") totalAttendance++;

nightRow+=`<td>${v}</td>`;

});

dayRow+=`<td rowspan="2">${totalAttendance}</td></tr>`;

nightRow+=`</tr>`;

tbody.innerHTML+=dayRow+nightRow;

}

};