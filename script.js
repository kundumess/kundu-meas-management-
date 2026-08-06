import { db, auth } from "./firebase.js";

import {
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// Elements

const dateInput = document.getElementById("attendanceDate");
const saveBtn = document.getElementById("save");

const today = new Date().toISOString().split("T")[0];

let isAdmin = false;


// Set default date

dateInput.value = today;
dateInput.max = today;



// Check admin login

auth.onAuthStateChanged(async(user)=>{


isAdmin = false;


if(user){


const adminSnap = await getDoc(
doc(db,"admins",user.uid)
);



if(adminSnap.exists()){


isAdmin = true;


dateInput.removeAttribute("max");


console.log("Admin Login");


}

else{


console.log("Normal User");


}



}


loadAttendance();


});





// Toggle buttons

document.querySelectorAll(".toggle").forEach(button=>{


button.addEventListener("click",()=>{


button.textContent =
button.textContent==="❌"
?
"✅"
:
"❌";

updateSummary()

});


});






// Date change

dateInput.addEventListener("change",()=>{


const selectedDate = dateInput.value;



if(!isAdmin && selectedDate !== today){


alert("Only admin can edit previous dates");


dateInput.value = today;


return;


}



loadAttendance();


});








// Load attendance

async function loadAttendance(){


const selectedDate = dateInput.value;



try{


const snap = await getDoc(
doc(db,"Attendance",selectedDate)
);



if(!snap.exists()) return;



const data = snap.data();



document.querySelectorAll("table tr")
.forEach((row,index)=>{


if(index===0) return;



const name =
row.children[0].textContent.trim();



if(data[name]){


row.children[1]
.querySelector("button")
.textContent =
data[name].day ? "✅":"❌";


row.children[2]
.querySelector("button")
.textContent =
data[name].night ? "✅":"❌";


}


});


}

catch(error){

console.log("Load error:",error);

}


}








// Attendance Summary
function updateSummary() {

    let day = 0;
    let night = 0;

    document.querySelectorAll("table tr").forEach((row, index) => {

        if (index === 0) return;

        if (row.children[1].querySelector("button").textContent === "✅") {
            day++;
        }

        if (row.children[2].querySelector("button").textContent === "✅") {
            night++;
        }

    });

    document.getElementById("dayCount").textContent = day;
    document.getElementById("nightCount").textContent = night;
    document.getElementById("totalCount").textContent = day + night;
}

// Save attendance

saveBtn.addEventListener("click",async()=>{


const selectedDate = dateInput.value;



if(!isAdmin && selectedDate !== today){


alert("Only admin can save previous dates");

return;


}



let data = {};



document.querySelectorAll("table tr")
.forEach((row,index)=>{


if(index===0)return;



const name =
row.children[0].textContent.trim();



data[name]={


day:
row.children[1]
.querySelector("button")
.textContent==="✅",



night:
row.children[2]
.querySelector("button")
.textContent==="✅"


};


});





try{


await setDoc(

doc(db,"Attendance",selectedDate),

data,

{merge:true}

);



alert("Attendance Saved Successfully ✅");


}

catch(error){


console.log(error);


alert(
"Save failed: "+error.message
);

// Attendance Summary
function updateSummary(){

let day = 0;
let night = 0;

document.querySelectorAll("table tr").forEach((row,index)=>{

if(index===0) return;

if(row.children[1].querySelector("button").textContent==="✅") day++;

if(row.children[2].querySelector("button").textContent==="✅") night++;

});

document.getElementById("dayCount").textContent = day;
document.getElementById("nightCount").textContent = night;
document.getElementById("totalCount").textContent = day + night;

}


}



});