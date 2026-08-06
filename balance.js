import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let incomeTotal = 0;
let regularTotal = 0;
let monthlyTotal = 0;

// Income
const incomeSnap = await getDocs(collection(db,"Income"));

incomeSnap.forEach(doc=>{

const data = doc.data();

incomeTotal += Number(data.amount || 0);

});

// Regular Expenses
const regularSnap = await getDocs(collection(db,"RegularExpenses"));

regularSnap.forEach(doc=>{

const data = doc.data();

regularTotal += Number(data.amount || 0);

});

// Monthly Expenses
const monthlySnap = await getDocs(collection(db,"MonthlyExpenses"));

monthlySnap.forEach(doc=>{

const data = doc.data();

monthlyTotal += Number(data.amount || 0);

});

const totalExpense = regularTotal + monthlyTotal;
const balance = incomeTotal - totalExpense;

document.getElementById("income").innerHTML =
"₹" + incomeTotal.toFixed(2);

document.getElementById("regular").innerHTML =
"₹" + regularTotal.toFixed(2);

document.getElementById("monthly").innerHTML =
"₹" + monthlyTotal.toFixed(2);

document.getElementById("expenses").innerHTML =
"₹" + totalExpense.toFixed(2);

document.getElementById("balance").innerHTML =
"₹" + balance.toFixed(2);