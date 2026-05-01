let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

const salesTableBody = document.getElementById("salesTableBody");
const searchInput = document.getElementById("searchSales");

function renderSales(data = salesHistory) {

  salesTableBody.innerHTML = "";

  if (data.length === 0) {
    salesTableBody.innerHTML = `
      <tr>
        <td colspan="5">No sales recorded yet</td>
      </tr>
    `;
    return;
  }

  data.forEach((sale) => {

    const originalIndex = salesHistory.indexOf(sale);

    salesTableBody.innerHTML += `
      <tr>
        <td>${sale.date}</td>
        <td>${sale.customerPhone || "Walk-in"}</td>
        <td>${sale.paymentMode}</td>
        <td>₹${sale.total}</td>
        <td>
          <button onclick="viewSale(${originalIndex})">View</button>
          <button onclick="deleteSale(${originalIndex})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* VIEW FULL BILL */
function viewSale(index) {

  const sale = salesHistory[index];

  let details = `
Date: ${sale.date}
Customer: ${sale.customerPhone || "Walk-in"}
Payment Mode: ${sale.paymentMode}

Items:
`;

  sale.items.forEach(item => {
    details += `${item.name} x ${item.qty} = ₹${item.qty * item.price}\n`;
  });

  details += `\nTotal: ₹${sale.total}`;

  alert(details);
}

/* DELETE SALE */
function deleteSale(index) {

  if (confirm("Delete this sale?")) {

    salesHistory.splice(index, 1);

    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));

    renderSales();
  }
}

/* SEARCH FUNCTION */
if (searchInput) {
  searchInput.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    const filtered = salesHistory.filter(sale =>
      (sale.customerPhone || "").toLowerCase().includes(value) ||
      sale.date.toLowerCase().includes(value)
    );

    renderSales(filtered);
  });
}

renderSales();