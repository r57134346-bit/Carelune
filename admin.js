const adminFallbackImage =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80";

const adminForm = document.querySelector("#adminForm");
const adminList = document.querySelector("#adminList");
const resetFormButton = document.querySelector("#resetForm");
const exportButton = document.querySelector("#exportProducts");
const adminStorageKey = "careLuneAdminProducts";

let adminProducts = loadAdminProducts();

function loadAdminProducts() {
  const saved = localStorage.getItem(adminStorageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(window.careLuneProducts) ? [...window.careLuneProducts] : [];
}

function saveAdminProducts() {
  localStorage.setItem(adminStorageKey, JSON.stringify(adminProducts));
}

function renderAdminProducts() {
  adminList.innerHTML = "";

  if (!adminProducts.length) {
    adminList.innerHTML = '<div class="empty-state">No products yet. Add your first product on the left.</div>';
    return;
  }

  adminProducts.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "admin-card";
    card.innerHTML = `
      <img src="${escapeAttribute(product.image || adminFallbackImage)}" alt="${escapeAttribute(product.title)}">
      <div>
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.category)} - ${escapeHtml(product.bestFor || "Everyday use")}</p>
        <p>${escapeHtml(product.summary)}</p>
        <div class="admin-card-actions">
          <button class="text-button" type="button" data-action="edit" data-index="${index}">Edit</button>
          <button class="text-button danger" type="button" data-action="delete" data-index="${index}">Delete</button>
        </div>
      </div>
    `;
    adminList.append(card);
  });
}

function resetAdminForm() {
  adminForm.reset();
  adminForm.elements.editIndex.value = "";
}

function fillAdminForm(index) {
  const product = adminProducts[index];
  adminForm.elements.editIndex.value = index;
  adminForm.elements.title.value = product.title || "";
  adminForm.elements.category.value = product.category || "Skincare";
  adminForm.elements.link.value = product.link || "";
  adminForm.elements.image.value = product.image || "";
  adminForm.elements.summary.value = product.summary || "";
  adminForm.elements.bestFor.value = product.bestFor || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function downloadProductsFile() {
  const fileContent = `window.careLuneProducts = ${JSON.stringify(adminProducts, null, 2)};\n`;
  const blob = new Blob([fileContent], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.js";
  link.click();
  URL.revokeObjectURL(url);
}

adminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(adminForm);
  const editIndex = formData.get("editIndex");
  const product = {
    title: formData.get("title").trim(),
    category: formData.get("category"),
    link: formData.get("link").trim(),
    image: formData.get("image").trim() || adminFallbackImage,
    summary: formData.get("summary").trim(),
    bestFor: formData.get("bestFor").trim() || "Everyday use",
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date())
  };

  if (editIndex !== "") {
    adminProducts[Number(editIndex)] = product;
  } else {
    adminProducts = [product, ...adminProducts];
  }

  saveAdminProducts();
  resetAdminForm();
  renderAdminProducts();
});

adminList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  if (button.dataset.action === "edit") {
    fillAdminForm(index);
  }

  if (button.dataset.action === "delete") {
    adminProducts.splice(index, 1);
    saveAdminProducts();
    renderAdminProducts();
  }
});

resetFormButton.addEventListener("click", resetAdminForm);
exportButton.addEventListener("click", downloadProductsFile);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

renderAdminProducts();
