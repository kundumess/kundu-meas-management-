// Array of all members matching your HTML drop-down options
const MEMBERS = [
    "Ramu", "Nabin", "Sovon", "Suman", "Riman", "Dipankar", 
    "Krishna", "Pradip", "Santu", "Madhav", "Deep", "Mohit", 
    "Suman 2", "Surojit", "Bikash", "Riju"
];

// DOM Element Selectors
const chargeMonthInput = document.getElementById("chargeMonth");
const loadChargesBtn = document.getElementById("loadCharges");
const memberSelect = document.getElementById("member");
const fineAmountInput = document.getElementById("fineAmount");
const chargeTypeSelect = document.getElementById("chargeType");
const chargeAmountInput = document.getElementById("chargeAmount");
const saveChargeBtn = document.getElementById("saveCharge");
const chargesBody = document.getElementById("chargesBody");
const summaryBody = document.getElementById("summaryBody");
const grandTotalEl = document.getElementById("grandTotal");

// Initialize application on load
document.addEventListener("DOMContentLoaded", () => {
    loadMonthlyData();
    
    // Set up event listeners
    loadChargesBtn.addEventListener("click", loadMonthlyData);
    saveChargeBtn.addEventListener("click", handleSaveCharge);
    chargeMonthInput.addEventListener("change", loadMonthlyData);
});

// Fetch key string based on chosen month for LocalStorage partition
function getStorageKey() {
    return `kundu_mess_charges_${chargeMonthInput.value}`;
}

// Retrieve data array from local storage
function getChargesData() {
    const data = localStorage.getItem(getStorageKey());
    return data ? JSON.parse(data) : [];
}

// Save modified array back to local storage
function saveChargesData(data) {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

// Handle layout building & aggregation updates
function loadMonthlyData() {
    const records = getChargesData();
    renderLedger(records);
    renderSummary(records);
}

// Render the transactional logs table (Charges Ledger)
function renderLedger(records) {
    chargesBody.innerHTML = "";
    
    if (records.length === 0) {
        chargesBody.innerHTML = `<tr><td colspan="3" style="color: #666; font-style: italic;">No charges recorded for this month.</td></tr>`;
        return;
    }

    records.forEach((record, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><b>${record.member}</b></td>
            <td>${record.reason}</td>
            <td>₹${record.amount.toFixed(2)}</td>
        `;
        chargesBody.appendChild(row);
    });
}

// Render the consolidated profiles breakdown (Member-wise Summary)
function renderSummary(records) {
    summaryBody.innerHTML = "";
    let overallGrandTotal = 0;

    // Build map structure of member expenses
    const summaryMap = {};
    MEMBERS.forEach(m => {
        summaryMap[m] = { logs: [], total: 0 };
    });

    // Populate calculations loop
    records.forEach(record => {
        if (summaryMap[record.member]) {
            summaryMap[record.member].logs.push(`${record.reason} (₹${record.amount})`);
            summaryMap[record.member].total += record.amount;
            overallGrandTotal += record.amount;
        }
    });

    // Generate table markup rows
    MEMBERS.forEach(member => {
        const row = document.createElement("tr");
        const details = summaryMap[member].logs.length > 0 ? summaryMap[member].logs.join(", ") : "—";
        const sum = summaryMap[member].total;
        
        row.innerHTML = `
            <td>${member}</td>
            <td><small>${details}</small></td>
            <td class="${sum > 0 ? 'total-active' : ''}"><b>₹${sum.toFixed(2)}</b></td>
        `;
        summaryBody.appendChild(row);
    });

    // Refresh layout container for aggregate tracking
    grandTotalEl.textContent = `₹${overallGrandTotal.toFixed(2)}`;
}

// Handle Form Submission Data validation & saves
function handleSaveCharge() {
    const selectedMember = memberSelect.value;
    const fineVal = parseFloat(fineAmountInput.value);
    const chargeType = chargeTypeSelect.value;
    const chargeVal = parseFloat(chargeAmountInput.value);

    // Validation check: Is a user picked?
    if (!selectedMember) {
        alert("Please select a member first!");
        return;
    }

    const currentRecords = getChargesData();
    let entryCreated = false;

    // Evaluation Path 1: Fine Submission processing
    if (!isNaN(fineVal) && fineVal > 0) {
        currentRecords.push({
            member: selectedMember,
            reason: "Fine Penalty",
            amount: fineVal
        });
        entryCreated = true;
    }

    // Evaluation Path 2: Auxiliary Fixed Charges processing
    if (chargeType && !isNaN(chargeVal) && chargeVal > 0) {
        currentRecords.push({
            member: selectedMember,
            reason: chargeType,
            amount: chargeVal
        });
        entryCreated = true;
    }

    // Alert user if click action occurred with blank fields
    if (!entryCreated) {
        alert("Please enter a valid fine amount OR choose a charge type with its respective amount.");
        return;
    }

    // Persist changes and refresh active views
    saveChargesData(currentRecords);
    loadMonthlyData();
    clearInputs();
}

// Wipe input metrics cleanly after operational actions
function clearInputs() {
    memberSelect.value = "";
    fineAmountInput.value = "";
    chargeTypeSelect.value = "";
    chargeAmountInput.value = "";
}
