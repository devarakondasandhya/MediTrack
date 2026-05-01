/* ================= DATA ================= */

let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
let totalProfit = Number(localStorage.getItem("totalProfit")) || 0;

let editIndex = -1;
let currentSale = [];
let grandTotal = 0;

/* ================= ELEMENTS ================= */

const tableBody = document.getElementById("medicineTable");
const billBody = document.getElementById("billBody");

/* ================= LOAD SUPPLIERS ================= */

function loadSuppliers() {
  const supplierSelect = document.getElementById("supplier");
  if (!supplierSelect) return;

  supplierSelect.innerHTML = "";

  suppliers.forEach(s => {
    supplierSelect.innerHTML += `<option value="${s.name}">${s.name}</option>`;
  });
}

loadSuppliers();

/* ================= RENDER MEDICINES ================= */

function renderMedicines(data = medicines) {

  if (!tableBody) return;
  tableBody.innerHTML = "";

  data.forEach((med, index) => {

    const row = document.createElement("tr");

    if (med.stock <= med.minStock) {
      row.classList.add("low-stock");
    }

    row.innerHTML = `
      <td>${med.name}</td>
      <td>${med.supplier}</td>
      <td>${med.stock}</td>
      <td>${med.buy}</td>
      <td>${med.sell}</td>
      <td>${med.stock * med.sell}</td>
      <td>${med.expiry || "-"}</td>
      <td>
        <button onclick="editMedicine(${index})">Edit</button>
        <button onclick="deleteMedicine(${index})">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateDashboard();
}

/* ================= ADD MEDICINE ================= */

document.getElementById("medicineForm").addEventListener("submit", function(e){
  e.preventDefault();

  const medData = {
    name: medName.value.trim(),
    supplier: supplier.value,
    stock: Number(stock.value),
    minStock: Number(minStock.value),
    buy: Number(buyPrice.value),
    sell: Number(sellPrice.value),
    expiry: expiry.value
  };

  if (editIndex === -1) medicines.push(medData);
  else medicines[editIndex] = medData;

  localStorage.setItem("medicines", JSON.stringify(medicines));
  this.reset();
  editIndex = -1;
  renderMedicines();
});

/* ================= EDIT ================= */

function editMedicine(index){
  const med = medicines[index];

  medName.value = med.name;
  supplier.value = med.supplier;
  stock.value = med.stock;
  minStock.value = med.minStock;
  buyPrice.value = med.buy;
  sellPrice.value = med.sell;
  expiry.value = med.expiry;

  editIndex = index;
  location.href="#addMedicineModal";
}

/* ================= DELETE ================= */

function deleteMedicine(index){
  if(confirm("Delete this medicine?")){
    medicines.splice(index,1);
    localStorage.setItem("medicines", JSON.stringify(medicines));
    renderMedicines();
  }
}

/* ================= DASHBOARD ================= */

function updateDashboard(){

  let totalStock = 0;
  let lowStock = 0;
  let inventoryValue = 0;

  medicines.forEach(m => {
    totalStock += m.stock;
    inventoryValue += m.stock * m.sell;
    if(m.stock <= m.minStock) lowStock++;
  });

  document.getElementById("totalMedicines").innerText = medicines.length;
  document.getElementById("totalStock").innerText = totalStock;
  document.getElementById("lowStock").innerText = lowStock;
  document.getElementById("inventoryValue").innerText = "₹" + inventoryValue;
}

/* ================= INVENTORY SEARCH ================= */

document.getElementById("searchInput").addEventListener("keyup", function(){
  const value = this.value.toLowerCase();
  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(value)
  );
  renderMedicines(filtered);
});

/* ================= CUSTOMER SEARCH ================= */

function searchCustomer() {

  const input = customerSearch.value.trim().toLowerCase();
  const suggestions = document.getElementById("customerSuggestions");
  suggestions.innerHTML = "";

  if (!input) {
    suggestions.style.display = "none";
    return;
  }

  const matches = customers.filter(c =>
    c.phone.includes(input) ||
    c.name.toLowerCase().includes(input)
  );

  if (matches.length > 0) {

    matches.forEach(c => {
      suggestions.innerHTML += `
        <div onclick="selectCustomer('${c.phone}')">
          ${c.name} - ${c.phone}
        </div>
      `;
    });

  } else {

    suggestions.innerHTML = `
      <div>
        <p>No customer found. Add new:</p>
        <input type="text" id="newName" placeholder="Name">
        <input type="email" id="newEmail" placeholder="Email">
        <input type="text" id="newAddress" placeholder="Address">
        <button onclick="saveNewCustomer()">Save</button>
      </div>
    `;
  }

  suggestions.style.display = "block";
}

function selectCustomer(phone) {
  customerSearch.value = phone;
  document.getElementById("customerSuggestions").style.display = "none";
}

function saveNewCustomer() {

  const newCustomer = {
    name: document.getElementById("newName").value.trim(),
    phone: customerSearch.value.trim(),
    email: document.getElementById("newEmail").value.trim(),
    address: document.getElementById("newAddress").value.trim()
  };

  customers.push(newCustomer);
  localStorage.setItem("customers", JSON.stringify(customers));
  document.getElementById("customerSuggestions").style.display = "none";
}

/* ================= MEDICINE SEARCH FOR SALE ================= */

function searchMedicine() {

  const input = document.getElementById("medicineSearch").value.toLowerCase();
  const suggestions = document.getElementById("medicineSuggestions");

  suggestions.innerHTML = "";

  if (!input) {
    suggestions.style.display = "none";
    return;
  }

  const matches = medicines
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter(m => m.name.toLowerCase().includes(input));

  if (matches.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  matches.forEach(m => {
    suggestions.innerHTML += `
      <div class="medicine-item">
        <span>${m.name} (Stock: ${m.stock})</span>
        <input type="number" min="1" max="${m.stock}" value="1" id="qty-${m.originalIndex}">
        <button onclick="addToBill(${m.originalIndex})">Add</button>
      </div>
    `;
  });

  suggestions.style.display = "block";
}


function addToBill(index) {

  const med = medicines[index];
  const qtyInput = document.getElementById(`qty-${index}`);
  const qty = Number(qtyInput.value);

  if (!med) return;

  if (qty <= 0) {
    alert("Enter valid quantity");
    return;
  }

  const existing = currentSale.find(item => item.name === med.name);

  // calculate already used qty
  let alreadyAdded = existing ? existing.qty : 0;

  if (qty + alreadyAdded > med.stock) {
    alert("Not enough stock available");
    return;
  }

  if (existing) {
    existing.qty += qty;
  } else {
    currentSale.push({
      index: index,
      name: med.name,
      price: med.sell,
      buy: med.buy,
      qty: qty
    });
  }

  renderBill();

  // clear search field properly
  document.getElementById("medicineSearch").value = "";
  document.getElementById("medicineSuggestions").innerHTML = "";
  document.getElementById("medicineSuggestions").style.display = "none";
}


/* ================= BILL ================= */

function renderBill() {

  billBody.innerHTML = "";
  grandTotal = 0;

  currentSale.forEach((item, i) => {

    const total = item.qty * item.price;
    grandTotal += total;

    billBody.innerHTML += `
      <tr>
        <td>${item.name}</td>

        <td>
          <input type="number" 
                 min="1" 
                 value="${item.qty}" 
                 onchange="editItem(${i}, this.value)"
                 style="width:60px;">
        </td>

        <td>₹${item.price}</td>

        <td>₹${total}</td>

        <td>
          <button class="edit-btn" onclick="focusQty(${i})">Edit</button>
          <button class="delete-btn" onclick="removeItem(${i})">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("grandTotal").innerText = grandTotal;
}

function editItem(index, newQty) {

  newQty = Number(newQty);

  const item = currentSale[index];
  const med = medicines[item.index];

  if (newQty <= 0) {
    alert("Invalid quantity");
    renderBill();
    return;
  }

  if (newQty > med.stock) {
    alert("Not enough stock available");
    renderBill();
    return;
  }

  item.qty = newQty;
  renderBill();
}

function focusQty(index) {
  const inputs = billBody.querySelectorAll("input[type='number']");
  if (inputs[index]) {
    inputs[index].focus();
  }
}


function removeItem(index) {
  if (confirm("Remove this item from bill?")) {
    currentSale.splice(index, 1);
    renderBill();
  }
}


/* ================= PAY ================= */

function payNow(){

  const payment = paymentMode.value;
  const phone = customerSearch.value.trim();

  if (!payment || currentSale.length === 0){
    alert("Complete sale details");
    return;
  }

  currentSale.forEach(item=>{
    medicines[item.index].stock -= item.qty;
  });

  localStorage.setItem("medicines", JSON.stringify(medicines));

  let saleProfit = 0;
  currentSale.forEach(item=>{
    saleProfit += (item.price - item.buy) * item.qty;
  });

  totalProfit += saleProfit;
  localStorage.setItem("totalProfit", totalProfit);

  salesHistory.push({
    date: new Date().toLocaleString(),
    customerPhone: phone || "Walk-in",
    items: currentSale,
    total: grandTotal,
    profit: saleProfit,
    paymentMode: payment
  });

  localStorage.setItem("salesHistory", JSON.stringify(salesHistory));

  alert("Payment Successful!");

  currentSale = [];
  renderBill();
  customerSearch.value = "";
  paymentMode.value = "";
  renderMedicines();
}

/* ================= INIT ================= */

renderMedicines();