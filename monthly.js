// --- DOM Element References ---
const expenseDateInput = document.getElementById("expenseDate");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const remarksInput = document.getElementById("remarks");
const saveBtn = document.getElementById("saveExpense");

const expenseMonthInput = document.getElementById("expenseMonth");
const loadBtn = document.getElementById("loadExpense");
const printBtn = document.getElementById("printReport");
const expenseBody = document.getElementById("expenseBody");

// --- Event Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadMonthlyData(); // Load active current month instantly on launch
});

saveBtn.addEventListener("click", saveExpense);
loadBtn.addEventListener("click", loadMonthlyData);
printBtn.addEventListener("click", () => { window.print(); });

// --- Application Logic ---

// 1. Save input parameters to browser cache
function saveExpense() {
    const date = expenseDateInput.value;
    const category = categoryInput.value;
    const amount = parseFloat(amountInput.value);
    const remarks = remarksInput.value.trim() || "-";

    if (!date || !category || isNaN(amount) || amount <= 0) {
        alert("Error: Please provide a valid date, category selection, and transaction amount!");
        return;
    }

    const newRecord = {
        id: Date.now().toString(),
        date,
        category,
        amount,
        remarks
    };

    const database = JSON.parse(localStorage.getItem("messExpenses")) || [];
    database.push(newRecord);
    localStorage.setItem("messExpenses", JSON.stringify(database));

    // Reset workflow items
    amountInput.value = "";
    remarksInput.value = "";
    categoryInput.value = "";
    
    alert("Success: Record safely written to database ledger.");
    loadMonthlyData();
}

// 2. Fetch and aggregate historical lists 
function loadMonthlyData() {
    const selectedMonth = expenseMonthInput.value; 
    if (!selectedMonth) {
        alert("Please pick a tracking target month block.");
        return;
    }

    const database = JSON.parse(localStorage.getItem("messExpenses")) || [];
    const monthlyFilteredRecords = database.filter(item => item.date.startsWith(selectedMonth));

    buildHistoryTable(monthlyFilteredRecords);
    buildSummaryTable(monthlyFilteredRecords);
}

// 3. Render historical table rows
function buildHistoryTable(records) {
    expenseBody.innerHTML = "";

    if (records.length === 0) {
        expenseBody.innerHTML = `<tr><td colspan="4">No itemized ledger actions recorded for this month configuration.</td></tr>`;
        return;
    }

    // Sort chronologically (Newest items display first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatLocaleDate(item.date)}</td>
            <td>${item.category}</td>
            <td>₹${item.amount.toFixed(2)}</td>
            <td>${sanitizeOutput(item.remarks)}</td>
        `;
        expenseBody.appendChild(row);
    });
}

// 4. Calculate metrics and push to UI views
function buildSummaryTable(records) {
    const categoriesStructure = {
        "Gas 1": { total: 0, dates: [] },
        "Gas 2": { total: 0, dates: [] },
        "Electricity": { total: 0, dates: [] },
        "Cook Charge (Masi)": { total: 0, dates: [] },
        "Bathroom Wash": { total: 0, dates: [] },
        "WiFi": { total: 0, dates: [] },
        "Rice": { total: 0, dates: [] }, 
        "Extra Expenses": { total: 0, dates: [] }
    };

    let calculatedGrandTotal = 0;

    records.forEach(item => {
        let matchingKey = item.category;
        
        // Combine 'Rice 1', 'Rice 2', etc. into the singular 'Rice' category
        if (matchingKey.startsWith("Rice")) {
            matchingKey = "Rice";
        }

        if (categoriesStructure[matchingKey]) {
            categoriesStructure[matchingKey].total += item.amount;
            categoriesStructure[matchingKey].dates.push(item.date);
            calculatedGrandTotal += item.amount;
        }
    });

    const elementMap = {
        "Gas 1": { total: "gas1Total", date: "gas1Date" },
        "Gas 2": { total: "gas2Total", date: "gas2Date" },
        "Electricity": { total: "electricityTotal", date: "electricityDate" },
        "Cook Charge (Masi)": { total: "cookTotal", date: "cookDate" },
        "Bathroom Wash": { total: "bathroomTotal", date: "bathroomDate" },
        "WiFi": { total: "wifiTotal", date: "wifiDate" },
        "Rice": { total: "riceTotal", date: "riceDate" },
        "Extra Expenses": { total: "extraTotal", date: "extraDate" }
    };

    // Reflect clean computed metrics directly into structural row slots
    Object.keys(elementMap).forEach(key => {
        const targetIds = elementMap[key];
        const uiTotal = document.getElementById(targetIds.total);
        const uiDate = document.getElementById(targetIds.date);

        if (uiTotal) uiTotal.innerText = `₹${categoriesStructure[key].total.toFixed(2)}`;
        
        if (uiDate) {
            if (categoriesStructure[key].dates.length > 0) {
                const uniqueDatesSorted = [...new Set(categoriesStructure[key].dates)].map(formatLocaleDate);
                uiDate.innerText = uniqueDatesSorted.join(", ");
            } else {
                uiDate.innerText = "-";
            }
        }
    });

    // Write final tallies to separate unique target locations safely
    document.getElementById("tableGrandTotal").innerText = `₹${calculatedGrandTotal.toFixed(2)}`;
    document.getElementById("divGrandTotal").innerText = `₹${calculatedGrandTotal.toFixed(2)}`;
}

// --- Utility Functions ---
function formatLocaleDate(rawDate) {
    const formattingTokens = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(rawDate).toLocaleDateString('en-IN', formattingTokens);
}

// Protect local file storage records against unexpected cross-site script code injection entries
function sanitizeOutput(inputString) {
    return inputString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
