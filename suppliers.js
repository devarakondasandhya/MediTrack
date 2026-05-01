let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
let editIndex = -1;

const modal = document.getElementById("supplierModal");
const tableBody = document.querySelector("#supplierTable tbody");
const form = document.getElementById("supplierForm");

/* Render Suppliers */
function renderSuppliers(data = suppliers) {
  tableBody.innerHTML = "";

  data.forEach((supplier, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${supplier.name}</td>
        <td>${supplier.contact || "-"}</td>
        <td>${supplier.phone}</td>
        <td>${supplier.email}</td>
        <td>${supplier.address}</td>
        <td>
          <button class="edit-btn" onclick="editSupplier(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteSupplier(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* Open Modal */
function openModal(isEdit = false) {
  modal.style.display = "flex";

  if (!isEdit) {
    form.reset();
    editIndex = -1;
    document.getElementById("modalTitle").innerText = "Add Supplier";
  }
}


/* Close Modal */
function closeModal() {
  modal.style.display = "none";
}

/* Save Supplier */
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const supplierData = {
    name: supplierName.value.trim(),
    contact: contactPerson.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    address: address.value.trim()
  };

  if (editIndex === -1) {
    suppliers.push(supplierData);
  } else {
    suppliers[editIndex] = supplierData;
  }

  localStorage.setItem("suppliers", JSON.stringify(suppliers));
  renderSuppliers();
  closeModal();
});

/* Edit */
function editSupplier(index) {
  const s = suppliers[index];

  supplierName.value = s.name;
  contactPerson.value = s.contact;
  phone.value = s.phone;
  email.value = s.email;
  address.value = s.address;

  editIndex = index;
  document.getElementById("modalTitle").innerText = "Edit Supplier";

  openModal(true);
}


/* Delete */
function deleteSupplier(index) {
  if (confirm("Delete this supplier?")) {
    suppliers.splice(index, 1);
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
    renderSuppliers();
  }
}

/* Search */
document.getElementById("searchSupplier").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(value) ||
    s.phone.includes(value)
  );

  renderSuppliers(filtered);
});

/* Initial Load */
renderSuppliers();