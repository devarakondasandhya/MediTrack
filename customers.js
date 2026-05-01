let customers = JSON.parse(localStorage.getItem("customers")) || [];
let editIndex = -1;

const tableBody = document.querySelector("#customerTable tbody");
const form = document.getElementById("customerForm");
const searchInput = document.getElementById("searchCustomer");

/* Render Table */
function renderCustomers(data = customers) {
  tableBody.innerHTML = "";

  data.forEach((customer, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.email || "-"}</td>
        <td>${customer.address || "-"}</td>
        <td>
          <button class="edit-btn" onclick="editCustomer(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteCustomer(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* Open Modal */
function openModal(isEdit = false) {
  document.getElementById("customerModal").style.display = "flex";

  if (!isEdit) {
    document.getElementById("modalTitle").innerText = "Add Customer";
    form.reset();
    editIndex = -1;
  }
}


/* Close Modal */
function closeModal() {
  document.getElementById("customerModal").style.display = "none";
}

/* Save Customer */
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();

  const customerData = { name, phone, email, address };

  if (editIndex === -1) {
    customers.push(customerData);
  } else {
    customers[editIndex] = customerData;
  }

  localStorage.setItem("customers", JSON.stringify(customers));

  renderCustomers();
  closeModal();
});

/* Edit */
function editCustomer(index) {
  const customer = customers[index];

  document.getElementById("customerName").value = customer.name;
  document.getElementById("phone").value = customer.phone;
  document.getElementById("email").value = customer.email;
  document.getElementById("address").value = customer.address;

  document.getElementById("modalTitle").innerText = "Edit Customer";
  editIndex = index;

  openModal(true);
}


/* Delete */
function deleteCustomer(index) {
  if (confirm("Delete this customer?")) {
    customers.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomers();
  }
}

/* Search */
searchInput.addEventListener("keyup", function() {
  const value = this.value.toLowerCase();

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(value) ||
    c.phone.includes(value) ||
    (c.email && c.email.toLowerCase().includes(value))
  );

  renderCustomers(filtered);
});

/* Initial Load */
renderCustomers();