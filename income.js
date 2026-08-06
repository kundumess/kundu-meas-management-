// Initialize Application Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    loadMonthlyIncome();

    // Attach click listeners to your HTML buttons
    document.getElementById("saveIncome").addEventListener("click", saveDeposit);
    document.getElementById("loadIncome").addEventListener("click", loadMonthlyIncome);
});

// 1. SAVE DEPOSIT FUNCTION
function saveDeposit() {
    const member = document.getElementById("member").value;
    const date = document.getElementById("incomeDate").value;
    const amount = parseFloat(document.getElementById("amount").value);

    // Form Validation Check
    if (!member || !date || isNaN(amount) || amount <= 0) {
        alert("⚠️ Please select a member, valid date, and enter an amount!");
        return;
    }

    // Extract Year-Month (YYYY-MM) to organize data cleanly
    const recordMonth = date.slice(0, 7); 

    // Retrieve existing data from localStorage or start fresh
    let allIncome = JSON.parse(localStorage.getItem("kundu_mees_income")) || {};

    // Structure: allIncome["2026-08"] = [ {member, date, amount}, ... ]
    if (!allIncome[recordMonth]) {
        allIncome[recordMonth] = [];
    }

    // Add new deposit entry
    allIncome[recordMonth].push({ member, date, amount });

    // Save back to localStorage
    localStorage.setItem("kundu_mees_income", JSON.stringify(allIncome));

    // Clear input fields for next entry
    document.getElementById("member").value = "";
    document.getElementById("amount").value = "";

    // Instantly refresh table view
    loadMonthlyIncome();
    alert("💾 Deposit saved successfully!");
}

// 2. LOAD & GENERATE SUMMARY TABLE FUNCTION
function loadMonthlyIncome() {
    const selectedMonth = document.getElementById("incomeMonth").value;
    const tableBody = document.getElementById("incomeSummaryBody");
    const grandTotalElement = document.getElementById("summaryGrandTotal");

    // Clear old table rows
    tableBody.innerHTML = "";

    if (!selectedMonth) {
        grandTotalElement.innerText = "₹0";
        return;
    }

    // Fetch total database records
    const allIncome = JSON.parse(localStorage.getItem("kundu_mees_income")) || {};
    const currentMonthRecords = allIncome[selectedMonth] || [];

    // All available members list matching your HTML dropdown selections
    const membersList = [
        "Ramu", "Nabin", "Sovon", "Suman", "Riman", "Dipankar", 
        "Krishna", "Pradip", "Santu", "Madhav", "Deep", "Mohit", 
        "Suman 2", "Surojit", "Bikash", "Riju"
    ];

    // Build group container to aggregate amounts per member
    let summaryMap = {};
    membersList.forEach(m => {
        summaryMap[m] = { history: [], total: 0 };
    });

    // Populate data into groups
    currentMonthRecords.forEach(record => {
        if (summaryMap[record.member]) {
            // Store only the numeric amount for history listing string
            summaryMap[record.member].history.push(`₹${record.amount}`);
            summaryMap[record.member].total += record.amount;
        }
    });

    let overallGrandTotal = 0;

    // Generate table markup rows dynamically
    membersList.forEach(member => {
        const data = summaryMap[member];
        overallGrandTotal += data.total;

        // Display individual history logs separated by a plus symbol or "No Deposits"
        const historyText = data.history.length > 0 ? data.history.join(" + ") : "—";
        
        // Highlight active paying rows dynamically
        const highlightClass = data.total > 0 ? "class='total'" : "";

        const rowHTML = `
            <tr ${highlightClass}>
                <td><b>${member}</b></td>
                <td>${historyText}</td>
                <td><b>₹${data.total}</b></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", rowHTML);
    });

    // Output calculated total calculation directly to table foot
    grandTotalElement.innerText = `₹${overallGrandTotal}`;
}
