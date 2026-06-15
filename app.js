/* ==========================================================================
   CHIMIPESCA - LÓGICA DE LA APLICACIÓN
   ========================================================================== */

// --- Estructura de Categorías y Subcategorías ---
const CATEGORIES_DATA = {
  "Cañas": [
    "Telescópicas",
    "Variada de Río",
    "Variada de Mar",
    "Pejerrey",
    "Baitcasting / Spinning"
  ],
  "Reeles": [
    "Reeles tamaño 2000",
    "Reeles tamaño 4000",
    "Reeles tamaño 5000/6000",
    "Reeles de lance",
    "Reeles rotativos"
  ],
  "Tanzas": [
    "Monofilamento (Nylon)",
    "Multifilamento",
    "Fluorocarbono",
    "Leaders y Salidas"
  ],
  "Accesorios": [
    "Anzuelos",
    "Plomadas",
    "Boyas",
    "Señuelos",
    "Cajas y Bolsos"
  ]
};

// --- Utilidades de Almacenamiento Seguro ---
const safeStorage = {
  getItem(key, isSession = false) {
    try {
      const storage = isSession ? sessionStorage : localStorage;
      return storage.getItem(key);
    } catch (e) {
      console.warn("Storage getItem failed:", e);
      return null;
    }
  },
  setItem(key, value, isSession = false) {
    try {
      const storage = isSession ? sessionStorage : localStorage;
      storage.setItem(key, value);
    } catch (e) {
      console.warn("Storage setItem failed:", e);
    }
  },
  removeItem(key, isSession = false) {
    try {
      const storage = isSession ? sessionStorage : localStorage;
      storage.removeItem(key);
    } catch (e) {
      console.warn("Storage removeItem failed:", e);
    }
  }
};

// --- Semillero (Datos Predeterminados) ---
const DEFAULT_PRODUCTS = [
  {
    id: "seed_1",
    name: "Reel Shimano FX 4000",
    category: "Reeles",
    subcategory: "Reeles tamaño 4000",
    description: "Reel ideal para pesca variada ligera, spinning y pejerrey. Gran suavidad de recuperación y durabilidad garantizada por Shimano.\n\n- Rulemanes: 2+1\n- Relación de giro: 5.2:1\n- Capacidad de línea: 0.30mm - 180m\n- Freno máximo: 8.5 kg\n- Cuerpo de grafito de alta resistencia.",
    priceWholesale: 32000,
    priceRetail: 45000,
    image: "assets/default-reel.png"
  },
  {
    id: "seed_2",
    name: "Caña Marine Sports Evolution 2.10m",
    category: "Cañas",
    subcategory: "Baitcasting / Spinning",
    description: "Caña de grafito macizo de una sola pieza, extremadamente resistente. Ideal para la pesca de dorados, tarariras y variada media con señuelos o carnada.\n\n- Largo: 2.10 metros\n- Tramos: 1 tramo\n- Resistencia: 15-30 libras\n- Acción: Media-Pesada\n- Material: Grafito Macizo (Solid Carbon)\n- Pasa-hilos aptos para multifilamento.",
    priceWholesale: 55000,
    priceRetail: 78000,
    image: "assets/default-rod.png"
  },
  {
    id: "seed_3",
    name: "Multifilamento Spinit Spider 0.22mm",
    category: "Tanzas",
    subcategory: "Multifilamento",
    description: "Multifilamento de 4 hebras trenzadas de alta densidad. Excelente resistencia a los nudos y a la abrasión con memoria prácticamente nula.\n\n- Diámetro: 0.22 mm\n- Resistencia: 30 lb (13.6 kg)\n- Longitud: Bobina de 100 metros\n- Color: Verde musgo (baja visibilidad)\n- Microfilamentos trenzados con revestimiento protector.",
    priceWholesale: 8900,
    priceRetail: 12500,
    image: "assets/default-line.png"
  },
  {
    id: "seed_4",
    name: "Reel Waterdog Alfa 2000",
    category: "Reeles",
    subcategory: "Reeles tamaño 2000",
    description: "Reel ultra-liviano diseñado para pescas sutiles como pejerrey en lagunas o spinning ultra-light. Carretel de aluminio alivianado.\n\n- Rulemanes: 3+1 de precisión\n- Freno delantero micrométrico\n- Rotor balanceado por computadora\n- Manija intercambiable izquierda/derecha.",
    priceWholesale: 19500,
    priceRetail: 28000,
    image: "assets/default-reel.png"
  },
  {
    id: "seed_5",
    name: "Caña Shimano Alivio 4.20m Telescópica",
    category: "Cañas",
    subcategory: "Telescópicas",
    description: "Caña telescópica especial para la pesca de pejerrey de costa o embarcado. Construida en carbono compuesto XT30, muy ligera y con una acción de punta perfecta.\n\n- Largo: 4.20 metros\n- Tramos telescópicos: 4\n- Acción: Rápida de pejerrey\n- Plomada recomendada: 10-40g\n- Portareel a cremallera Shimano.",
    priceWholesale: 68000,
    priceRetail: 95000,
    image: "assets/default-rod.png"
  },
  {
    id: "seed_6",
    name: "Tanza Grilon Super Control 0.35mm",
    category: "Tanzas",
    subcategory: "Monofilamento (Nylon)",
    description: "Nylon monofilamento nacional de alta performance. Combina una gran resistencia al impacto con una excelente flexibilidad y baja memoria.\n\n- Diámetro: 0.35 mm\n- Resistencia: 7.9 kg\n- Longitud: Bobina de 250 metros\n- Color: Cristal transparente.",
    priceWholesale: 4500,
    priceRetail: 6500,
    image: "assets/default-line.png"
  }
];

// --- Estado de la Aplicación ---
let state = {
  products: [],
  currentCategory: "all",
  currentSubcategory: null,
  searchQuery: "",
  isAdmin: false,
  editingProductId: null,
  currentUploadedImageBase64: null
};

// --- Elementos del DOM ---
const DOM = {
  productGrid: document.getElementById("product-list-container"),
  emptyState: document.getElementById("empty-state"),
  resultsCounter: document.getElementById("results-counter"),
  searchInput: document.getElementById("search-input"),
  categoryTabsContainer: document.getElementById("category-tabs-container"),
  subcategoryGroup: document.getElementById("subcategory-group"),
  subcategoryTabsContainer: document.getElementById("subcategory-tabs-container"),
  
  // Barra de filtros
  activeFiltersBar: document.getElementById("active-filters-bar"),
  filtersBadgesContainer: document.getElementById("filters-badges-container"),
  clearFiltersBtn: document.getElementById("clear-filters-btn"),

  // Modal Detalle
  productDetailModal: document.getElementById("product-detail-modal"),
  productModalClose: document.getElementById("product-modal-close"),
  productModalOverlay: document.getElementById("product-modal-overlay"),
  modalProductImg: document.getElementById("modal-product-img"),
  modalProductCategory: document.getElementById("modal-product-category"),
  modalProductSubcategory: document.getElementById("modal-product-subcategory"),
  modalProductTitle: document.getElementById("modal-product-title"),
  modalProductDesc: document.getElementById("modal-product-desc"),
  modalProductPriceWholesale: document.getElementById("modal-product-price-wholesale"),
  modalProductPriceRetail: document.getElementById("modal-product-price-retail"),
  whatsappInquiryBtn: document.getElementById("whatsapp-inquiry-btn"),

  // Modal Auth Admin
  adminLoginTrigger: document.getElementById("admin-login-trigger"),
  adminLoginLink: document.getElementById("admin-login-link"),
  adminAuthModal: document.getElementById("admin-auth-modal"),
  adminAuthOverlay: document.getElementById("admin-auth-overlay"),
  adminAuthClose: document.getElementById("admin-auth-close"),
  adminLoginForm: document.getElementById("admin-login-form"),
  adminPasswordInput: document.getElementById("admin-password"),
  loginErrorMsg: document.getElementById("login-error-msg"),

  // Modal Dashboard Admin
  adminDashboardModal: document.getElementById("admin-dashboard-modal"),
  adminDashboardOverlay: document.getElementById("admin-dashboard-overlay"),
  adminDashboardClose: document.getElementById("admin-dashboard-close"),
  adminLogoutBtn: document.getElementById("admin-logout-btn"),
  
  // Formulario Admin
  productForm: document.getElementById("product-form"),
  formActionTitle: document.getElementById("form-action-title"),
  editProductIdInput: document.getElementById("edit-product-id"),
  formCategorySelect: document.getElementById("form-category"),
  formSubcategorySelect: document.getElementById("form-subcategory"),
  formNameInput: document.getElementById("form-name"),
  formDescTextarea: document.getElementById("form-desc"),
  formPriceWholesaleInput: document.getElementById("form-price-wholesale"),
  formPriceRetailInput: document.getElementById("form-price-retail"),
  formImageFile: document.getElementById("form-image"),
  fileNameSpan: document.getElementById("file-name-span"),
  imagePreview: document.getElementById("image-preview"),
  removeImgBtn: document.getElementById("remove-img-btn"),
  formSubmitBtn: document.getElementById("form-submit-btn"),
  formCancelBtn: document.getElementById("form-cancel-btn"),
  
  // Categorías y Subcategorías personalizadas
  customCategoryGroup: document.getElementById("custom-category-group"),
  customSubcategoryGroup: document.getElementById("custom-subcategory-group"),
  formCustomCategoryInput: document.getElementById("form-custom-category"),
  formCustomSubcategoryInput: document.getElementById("form-custom-subcategory"),

  // Listado Admin
  adminProductsTbody: document.getElementById("admin-products-tbody"),
  adminNoProducts: document.getElementById("admin-no-products"),
  adminSearchInput: document.getElementById("admin-search-input"),

  // Backups
  backupExportBtn: document.getElementById("backup-export-btn"),
  backupImportFile: document.getElementById("backup-import-file"),
  backupResetBtn: document.getElementById("backup-reset-btn"),

  // Gestión de Categorías
  manageCategorySelect: document.getElementById("manage-category-select"),
  manageSubcategorySelect: document.getElementById("manage-subcategory-select"),
  deleteCategoryBtn: document.getElementById("delete-category-btn"),
  deleteSubcategoryBtn: document.getElementById("delete-subcategory-btn")
};

// --- API URL y Configuración ---
const API_URL = "/.netlify/functions/api";

// --- Estado de Categorías dinámicas ---
let categories = {};

function loadCategoriesLocal() {
  const savedCats = safeStorage.getItem("chimipesca_categories");
  if (savedCats) {
    try {
      categories = JSON.parse(savedCats);
    } catch (e) {
      categories = JSON.parse(JSON.stringify(CATEGORIES_DATA));
    }
  } else {
    categories = JSON.parse(JSON.stringify(CATEGORIES_DATA));
  }
}

function saveCategoriesLocal() {
  safeStorage.setItem("chimipesca_categories", JSON.stringify(categories));
}

function rebuildCategoriesFromProducts() {
  const newCategories = JSON.parse(JSON.stringify(CATEGORIES_DATA));
  state.products.forEach(p => {
    if (!newCategories[p.category]) {
      newCategories[p.category] = [];
    }
    if (!newCategories[p.category].includes(p.subcategory)) {
      newCategories[p.category].push(p.subcategory);
    }
  });
  categories = newCategories;
  saveCategoriesLocal();
}

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  checkAdminSession();
  
  // Mostrar indicador de carga
  DOM.productGrid.innerHTML = `
    <div class="loading-indicator" style="text-align: center; padding: 4rem 1rem; grid-column: 1 / -1; color: var(--text-muted);">
      <svg class="animate-spin" style="margin: 0 auto 1.5rem; width: 48px; height: 48px; color: var(--primary-color); animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path>
      </svg>
      <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-color);">Cargando catálogo desde la nube...</p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted);">Por favor espera un momento.</p>
    </div>
  `;
  
  await loadCatalogFromServer();
  
  renderCategoryTabs();
  renderCatalog();
});

// --- Carga y Semillado de Datos ---
async function loadCatalogFromServer() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    state.products = data.products || [];
    categories = data.categories || JSON.parse(JSON.stringify(CATEGORIES_DATA));
    
    saveCatalogLocal();
    saveCategoriesLocal();
  } catch (e) {
    console.warn("No se pudo conectar a la base de datos en la nube. Usando datos locales (offline):", e);
    loadCategoriesLocal();
    loadCatalogLocal();
  }
}

function loadCatalogLocal() {
  const localData = safeStorage.getItem("chimipesca_catalog");
  if (localData) {
    try {
      state.products = JSON.parse(localData);
    } catch (e) {
      state.products = [...DEFAULT_PRODUCTS];
    }
  } else {
    state.products = [...DEFAULT_PRODUCTS];
  }
}

function saveCatalogLocal() {
  safeStorage.setItem("chimipesca_catalog", JSON.stringify(state.products));
}

// Comprueba si el admin ya estaba logueado en esta sesión de navegador
function checkAdminSession() {
  const sessionStatus = safeStorage.getItem("chimipesca_admin_logged", true);
  const password = safeStorage.getItem("chimipesca_admin_password", true);
  if (sessionStatus === "true" && password === "chimi2026") {
    state.isAdmin = true;
    DOM.adminLoginTrigger.classList.add("logged-in");
    DOM.adminLoginTrigger.style.color = "var(--primary-color)";
    DOM.adminLoginTrigger.setAttribute("title", "Abrir Panel Administrador");
  } else {
    state.isAdmin = false;
    safeStorage.removeItem("chimipesca_admin_logged", true);
    safeStorage.removeItem("chimipesca_admin_password", true);
  }
}

// --- Event Listeners ---
function setupEventListeners() {
  // Buscador Principal
  DOM.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderCatalog();
  });

  // Limpiar Filtros
  DOM.clearFiltersBtn.addEventListener("click", resetAllFilters);

  // Modales - Detalle de Producto
  DOM.productModalClose.addEventListener("click", () => closeModal(DOM.productDetailModal));
  DOM.productModalOverlay.addEventListener("click", () => closeModal(DOM.productDetailModal));

  // Modales - Login Admin
  DOM.adminLoginTrigger.addEventListener("click", triggerAdminAction);
  if (DOM.adminLoginLink) {
    DOM.adminLoginLink.addEventListener("click", () => {
      closeModal(DOM.productDetailModal);
      openModal(DOM.adminAuthModal);
    });
  }
  DOM.adminAuthClose.addEventListener("click", () => closeModal(DOM.adminAuthModal));
  DOM.adminAuthOverlay.addEventListener("click", () => closeModal(DOM.adminAuthModal));

  DOM.adminLoginForm.addEventListener("submit", handleAdminLoginSubmit);

  // Modales - Dashboard Admin
  DOM.adminDashboardClose.addEventListener("click", () => closeModal(DOM.adminDashboardModal));
  DOM.adminDashboardOverlay.addEventListener("click", () => closeModal(DOM.adminDashboardModal));
  DOM.adminLogoutBtn.addEventListener("click", handleAdminLogout);

  // Selector Formulario Admin - Categoría dinámico
  DOM.formCategorySelect.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "new_cat") {
      DOM.customCategoryGroup.classList.remove("hidden");
      DOM.formCustomCategoryInput.required = true;
      DOM.customSubcategoryGroup.classList.remove("hidden");
      DOM.formCustomSubcategoryInput.required = true;
      
      DOM.formSubcategorySelect.innerHTML = `<option value="new_sub" selected>+ Crear Nueva Subcategoría...</option>`;
      DOM.formSubcategorySelect.disabled = true;
    } else {
      DOM.customCategoryGroup.classList.add("hidden");
      DOM.formCustomCategoryInput.required = false;
      DOM.formCustomCategoryInput.value = "";
      
      DOM.customSubcategoryGroup.classList.add("hidden");
      DOM.formCustomSubcategoryInput.required = false;
      DOM.formCustomSubcategoryInput.value = "";
      
      populateFormSubcategories(val);
    }
  });

  // Selector Formulario Admin - Subcategoría dinámica
  DOM.formSubcategorySelect.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "new_sub") {
      DOM.customSubcategoryGroup.classList.remove("hidden");
      DOM.formCustomSubcategoryInput.required = true;
    } else {
      DOM.customSubcategoryGroup.classList.add("hidden");
      DOM.formCustomSubcategoryInput.required = false;
      DOM.formCustomSubcategoryInput.value = "";
    }
  });

  // Selector Formulario Admin - Foto
  DOM.formImageFile.addEventListener("change", handleFormImageUpload);
  DOM.removeImgBtn.addEventListener("click", removeFormImage);

  // Formulario Admin - Cancelar Edición
  DOM.formCancelBtn.addEventListener("click", resetAdminForm);

  // Formulario Admin - Submit
  DOM.productForm.addEventListener("submit", handleProductFormSubmit);

  // Buscador en Tabla de Administración
  DOM.adminSearchInput.addEventListener("input", renderAdminProductsTable);

  // Backups
  DOM.backupExportBtn.addEventListener("click", exportCatalogJSON);
  DOM.backupImportFile.addEventListener("change", importCatalogJSON);
  DOM.backupResetBtn.addEventListener("click", resetCatalogToSeeded);

  // Gestión de Categorías
  DOM.manageCategorySelect.addEventListener("change", handleManageCategorySelectChange);
  DOM.manageSubcategorySelect.addEventListener("change", handleManageSubcategorySelectChange);
  DOM.deleteCategoryBtn.addEventListener("click", handleDeleteCategory);
  DOM.deleteSubcategoryBtn.addEventListener("click", handleDeleteSubcategory);

  // Escuchar Tecla Esc para cerrar modales
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(DOM.productDetailModal);
      closeModal(DOM.adminAuthModal);
      closeModal(DOM.adminDashboardModal);
    }
  });
}

// --- Lógica del Catálogo (Renderizado y Filtrado) ---
function renderCategoryTabs() {
  let html = `
    <button class="tab-btn ${state.currentCategory === 'all' ? 'active' : ''}" data-category="all">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon"><path d="M2 12c4-5 9-5 13-2c2-2 4-3 7-3c-1 2-1 4 0 6c-2-1-4-2-5-3c-4 4-9 4-13 0z" /><circle cx="6" cy="11" r="1" /></svg>
      <span>Ver Todo</span>
    </button>
  `;
  
  Object.keys(categories).forEach(cat => {
    let iconSvg = '';
    if (cat === "Cañas") {
      iconSvg = `<path d="M2 22L22 2M6 18l1.5 1.5M10 14l1.5 1.5M14 10l1.5 1.5M18 6l1.5 1.5" /><circle cx="4" cy="20" r="2" /><path d="M3 21l1.5-1.5" />`;
    } else if (cat === "Reeles") {
      iconSvg = `<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="7" r="1" fill="currentColor" /><circle cx="12" cy="17" r="1" fill="currentColor" /><circle cx="7" cy="12" r="1" fill="currentColor" /><circle cx="17" cy="12" r="1" fill="currentColor" /><circle cx="16" cy="8" r="1.5" />`;
    } else if (cat === "Tanzas") {
      iconSvg = `<circle cx="12" cy="5" r="1.5" /><path d="M12 6.5v8a4 4 0 0 1-8 0v-2l2 2" />`;
    } else if (cat === "Accesorios") {
      iconSvg = `<circle cx="12" cy="12" r="5" /><line x1="12" y1="7" x2="12" y2="2" /><line x1="12" y1="17" x2="12" y2="22" /><line x1="7" y1="12" x2="17" y2="12" />`;
    } else {
      iconSvg = `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>`;
    }
    
    html += `
      <button class="tab-btn ${state.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">${iconSvg}</svg>
        <span>${cat}</span>
      </button>
    `;
  });
  
  DOM.categoryTabsContainer.innerHTML = html;
  
  const categoryButtons = DOM.categoryTabsContainer.querySelectorAll(".tab-btn");
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const category = btn.getAttribute("data-category");
      selectCategory(category);
    });
  });
}

function selectCategory(category) {
  state.currentCategory = category;
  state.currentSubcategory = null; // Resetea la subcategoría al cambiar de categoría principal
  
  if (category === "all") {
    DOM.subcategoryGroup.classList.add("hidden");
  } else {
    // Generar subcategorías dinámicamente
    renderSubcategoryTabs(category);
    DOM.subcategoryGroup.classList.remove("hidden");
  }
  
  renderCatalog();
}

function renderSubcategoryTabs(category) {
  const subcategories = categories[category] || [];
  
  // Crear HTML de las pestañas
  let html = `<button class="sub-tab-btn active" data-subcategory="all">Todos</button>`;
  subcategories.forEach(sub => {
    html += `<button class="sub-tab-btn" data-subcategory="${sub}">${sub}</button>`;
  });
  
  DOM.subcategoryTabsContainer.innerHTML = html;
  
  // Agregar event listeners a las nuevas pestañas
  const subBtns = DOM.subcategoryTabsContainer.querySelectorAll(".sub-tab-btn");
  subBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const subcat = btn.getAttribute("data-subcategory");
      state.currentSubcategory = subcat === "all" ? null : subcat;
      renderCatalog();
    });
  });
}

function resetAllFilters() {
  state.currentCategory = "all";
  state.currentSubcategory = null;
  state.searchQuery = "";
  
  DOM.searchInput.value = "";
  DOM.subcategoryGroup.classList.add("hidden");
  
  renderCategoryTabs();
  renderCatalog();
}

// Filtrado de productos en base a categorías, subcategorías y términos de búsqueda
function getFilteredProducts() {
  return state.products.filter(p => {
    // Filtro Categoría Principal
    const matchCategory = state.currentCategory === "all" || p.category === state.currentCategory;
    
    // Filtro Subcategoría
    const matchSubcategory = !state.currentSubcategory || p.subcategory === state.currentSubcategory;
    
    // Filtro Término de Búsqueda (busca en Nombre y Descripción)
    const matchQuery = !state.searchQuery || 
                       p.name.toLowerCase().includes(state.searchQuery) || 
                       p.description.toLowerCase().includes(state.searchQuery);
                       
    return matchCategory && matchSubcategory && matchQuery;
  });
}

function renderCatalog() {
  const filtered = getFilteredProducts();
  
  // Actualizar contador
  const count = filtered.length;
  DOM.resultsCounter.textContent = count === 1 ? "Mostrando 1 producto" : `Mostrando ${count} productos`;
  
  // Renderizar filtros activos
  renderActiveFiltersBar();

  if (count === 0) {
    DOM.productGrid.innerHTML = "";
    DOM.emptyState.classList.remove("hidden");
    return;
  }
  
  DOM.emptyState.classList.add("hidden");
  
  let gridHtml = "";
  filtered.forEach(p => {
    // Formatear precios en moneda argentina ARS
    const wholesalePriceStr = p.priceWholesale.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
    const retailPriceStr = p.priceRetail.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
    
    gridHtml += `
      <article class="product-list-row" data-id="${p.id}" onclick="openProductDetail('${p.id}')">
        <div class="product-list-img-sec">
          <img src="${p.image}" alt="${p.name}" class="product-list-img" loading="lazy">
        </div>
        <div class="product-list-details">
          <h3>${p.name}</h3>
          <div class="product-list-badges">
            <span class="badge badge-category">${p.category}</span>
            <span class="badge badge-subcategory">${p.subcategory}</span>
          </div>
          <p class="product-list-desc">${p.description}</p>
        </div>
        <div class="product-list-prices">
          <div class="product-list-price-item wholesale">
            <span class="p-label">Mayorista</span>
            <span class="p-val">${wholesalePriceStr}</span>
          </div>
          <div class="product-list-price-item retail">
            <span class="p-label">Minorista</span>
            <span class="p-val">${retailPriceStr}</span>
          </div>
        </div>
      </article>
    `;
  });
  
  DOM.productGrid.innerHTML = gridHtml;
}

function renderActiveFiltersBar() {
  let hasFilters = false;
  let badgesHtml = "";
  
  if (state.currentCategory !== "all") {
    hasFilters = true;
    badgesHtml += `
      <span class="filter-badge">
        Categoría: ${state.currentCategory}
        <button class="remove-filter-btn" onclick="removeCategoryFilter()">&times;</button>
      </span>
    `;
  }
  
  if (state.currentSubcategory) {
    hasFilters = true;
    badgesHtml += `
      <span class="filter-badge">
        Subcat: ${state.currentSubcategory}
        <button class="remove-filter-btn" onclick="removeSubcategoryFilter()">&times;</button>
      </span>
    `;
  }
  
  if (state.searchQuery) {
    hasFilters = true;
    badgesHtml += `
      <span class="filter-badge">
        Búsqueda: "${state.searchQuery}"
        <button class="remove-filter-btn" onclick="removeSearchFilter()">&times;</button>
      </span>
    `;
  }
  
  if (hasFilters) {
    DOM.filtersBadgesContainer.innerHTML = badgesHtml;
    DOM.activeFiltersBar.classList.remove("hidden");
  } else {
    DOM.activeFiltersBar.classList.add("hidden");
  }
}

// Funciones para remover filtros específicos desde los badges
window.removeCategoryFilter = () => {
  selectCategory("all");
  renderCategoryTabs();
};

window.removeSubcategoryFilter = () => {
  state.currentSubcategory = null;
  // Resetear active de subcategorías
  const subBtns = DOM.subcategoryTabsContainer.querySelectorAll(".sub-tab-btn");
  subBtns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-subcategory") === "all") btn.classList.add("active");
  });
  renderCatalog();
};

window.removeSearchFilter = () => {
  state.searchQuery = "";
  DOM.searchInput.value = "";
  renderCatalog();
};

// --- Modales (Apertura y Cierre con Clases CSS) ---
function openModal(modalElement) {
  modalElement.classList.remove("hidden");
  modalElement.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Deshabilita scroll de fondo
}

function closeModal(modalElement) {
  modalElement.classList.add("hidden");
  modalElement.setAttribute("aria-hidden", "true");
  // Si no quedan modales abiertos, devolvemos el scroll al body
  const openModals = document.querySelectorAll(".modal:not(.hidden)");
  if (openModals.length === 0) {
    document.body.style.overflow = "";
  }
}

// --- Detalle de Producto Modal ---
window.openProductDetail = (productId) => {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  DOM.modalProductImg.src = product.image;
  DOM.modalProductImg.alt = product.name;
  DOM.modalProductCategory.textContent = product.category;
  DOM.modalProductSubcategory.textContent = product.subcategory;
  DOM.modalProductTitle.textContent = product.name;
  DOM.modalProductDesc.textContent = product.description;
  
  DOM.modalProductPriceWholesale.textContent = product.priceWholesale.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  DOM.modalProductPriceRetail.textContent = product.priceRetail.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
  
  // Configurar enlace de WhatsApp
  const phone = "5491123456789"; // Número de WhatsApp configurado para ChimiPesca
  const messageText = `Hola ChimiPesca! Vi en el catálogo online el producto: *${product.name}* (${product.category} - ${product.subcategory}).\nPrecio minorista: ${product.priceRetail.toLocaleString('es-AR', {style:'currency', currency:'ARS', minimumFractionDigits:0})}\nPrecio mayorista: ${product.priceWholesale.toLocaleString('es-AR', {style:'currency', currency:'ARS', minimumFractionDigits:0})}\n\nQuería consultarles si tienen stock disponible y cómo puedo realizar la compra. Gracias!`;
  
  DOM.whatsappInquiryBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
  
  openModal(DOM.productDetailModal);
};

// --- Panel de Administración: Login / Logout ---
function triggerAdminAction() {
  if (state.isAdmin) {
    // Si ya está logueado, abrimos el panel de control directo
    openAdminDashboard();
  } else {
    // Si no, abre el login modal
    openModal(DOM.adminAuthModal);
    DOM.adminPasswordInput.focus();
  }
}

async function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const password = DOM.adminPasswordInput.value;
  
  DOM.loginErrorMsg.classList.add("hidden");
  DOM.adminPasswordInput.disabled = true;
  
  const submitBtn = DOM.adminLoginForm.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Verificando...";
  submitBtn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "auth", password })
    });
    
    if (res.ok) {
      state.isAdmin = true;
      safeStorage.setItem("chimipesca_admin_logged", "true", true);
      safeStorage.setItem("chimipesca_admin_password", password, true);
      
      // Cambiar estilos del botón lock del header para indicar login
      DOM.adminLoginTrigger.classList.add("logged-in");
      DOM.adminLoginTrigger.style.color = "var(--primary-color)";
      DOM.adminLoginTrigger.setAttribute("title", "Abrir Panel Administrador");
      
      DOM.adminPasswordInput.value = "";
      closeModal(DOM.adminAuthModal);
      openAdminDashboard();
    } else {
      DOM.loginErrorMsg.classList.remove("hidden");
      DOM.adminPasswordInput.focus();
      DOM.adminPasswordInput.select();
    }
  } catch (error) {
    alert("Error de conexión al verificar credenciales con el servidor.");
    console.error(error);
  } finally {
    DOM.adminPasswordInput.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Maneja el logout del administrador
function handleAdminLogout() {
  state.isAdmin = false;
  safeStorage.removeItem("chimipesca_admin_logged", true);
  safeStorage.removeItem("chimipesca_admin_password", true);
  
  // Restaurar icono del lock del header
  DOM.adminLoginTrigger.classList.remove("logged-in");
  DOM.adminLoginTrigger.style.color = "";
  DOM.adminLoginTrigger.setAttribute("title", "Acceso Administrador");
  
  closeModal(DOM.adminDashboardModal);
  resetAdminForm();
}

// --- Panel de Administración: Funciones del Dashboard ---
function openAdminDashboard() {
  renderAdminProductsTable();
  resetAdminForm();
  populateManageCategories();
  openModal(DOM.adminDashboardModal);
}

// Poblado dinámico del selector de categorías principales
function populateFormCategories(selectedCategory = "") {
  let html = `<option value="" disabled selected>Seleccione...</option>`;
  Object.keys(categories).forEach(cat => {
    html += `<option value="${cat}">${cat}</option>`;
  });
  html += `<option value="new_cat" style="font-weight: bold; color: var(--primary-color);">+ Crear Nueva Categoría...</option>`;
  DOM.formCategorySelect.innerHTML = html;
  
  if (selectedCategory) {
    DOM.formCategorySelect.value = selectedCategory;
  }
}

// Poblado dinámico del selector de subcategorías en el formulario admin
function populateFormSubcategories(category, selectedSubcategory = "") {
  if (!category || category === "new_cat") {
    DOM.formSubcategorySelect.innerHTML = `<option value="" disabled selected>Seleccione una categoría primero...</option>`;
    DOM.formSubcategorySelect.disabled = true;
    return;
  }
  
  const subcategories = categories[category] || [];
  let html = `<option value="" disabled selected>Seleccione subcategoría...</option>`;
  subcategories.forEach(sub => {
    html += `<option value="${sub}">${sub}</option>`;
  });
  html += `<option value="new_sub" style="font-weight: bold; color: var(--primary-color);">+ Crear Nueva Subcategoría...</option>`;
  
  DOM.formSubcategorySelect.innerHTML = html;
  DOM.formSubcategorySelect.disabled = false;
  
  if (selectedSubcategory) {
    if (subcategories.includes(selectedSubcategory)) {
      DOM.formSubcategorySelect.value = selectedSubcategory;
      DOM.customSubcategoryGroup.classList.add("hidden");
      DOM.formCustomSubcategoryInput.required = false;
    } else {
      DOM.formSubcategorySelect.value = "new_sub";
      DOM.customSubcategoryGroup.classList.remove("hidden");
      DOM.formCustomSubcategoryInput.required = true;
      DOM.formCustomSubcategoryInput.value = selectedSubcategory;
    }
  }
}

// Renderizado de tabla de administración
function renderAdminProductsTable() {
  const searchTerm = DOM.adminSearchInput.value.toLowerCase().trim();
  
  // Filtrar artículos para la tabla
  const filtered = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    p.category.toLowerCase().includes(searchTerm)
  );
  
  if (filtered.length === 0) {
    DOM.adminProductsTbody.innerHTML = "";
    DOM.adminNoProducts.classList.remove("hidden");
    return;
  }
  
  DOM.adminNoProducts.classList.add("hidden");
  
  let tbodyHtml = "";
  filtered.forEach(p => {
    tbodyHtml += `
      <tr>
        <td>
          <div class="td-img-container">
            <img src="${p.image}" alt="${p.name}" class="td-img">
          </div>
        </td>
        <td>
          <div class="td-name" title="${p.name}">${p.name}</div>
        </td>
        <td>
          <span class="badge badge-category" style="font-size: 0.7rem; padding: 2px 6px;">${p.category}</span>
        </td>
        <td>
          <div class="td-prices-box">
            <span>May: <strong>$${p.priceWholesale.toLocaleString('es-AR')}</strong></span>
            <span>Min: <strong>$${p.priceRetail.toLocaleString('es-AR')}</strong></span>
          </div>
        </td>
        <td>
          <div class="td-actions">
            <button class="action-btn edit-btn" onclick="startEditProduct('${p.id}')" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete-btn" onclick="handleDeleteProduct('${p.id}')" title="Eliminar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  
  DOM.adminProductsTbody.innerHTML = tbodyHtml;
}

// --- Compresión y Lectura de Imagen a Base64 ---
function handleFormImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  DOM.fileNameSpan.textContent = file.name;
  
  // Mostrar feedback visual de carga
  DOM.fileNameSpan.style.color = "var(--secondary-color)";
  DOM.fileNameSpan.style.fontWeight = "700";
  
  // Comprimir imagen y convertir a Base64 para guardado seguro en localStorage
  compressImage(file, (base64Result) => {
    state.currentUploadedImageBase64 = base64Result;
    DOM.imagePreview.src = base64Result;
    DOM.imagePreview.classList.remove("hidden");
    DOM.removeImgBtn.classList.remove("hidden");
  });
}

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 450;
      const MAX_HEIGHT = 450;
      
      // Ajustar dimensiones manteniendo relación de aspecto
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      // Dibujar imagen reducida en el canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Exportar a base64 como JPEG de calidad media (0.7) para optimizar almacenamiento
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      callback(compressedBase64);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function removeFormImage() {
  DOM.formImageFile.value = "";
  DOM.fileNameSpan.textContent = "Ningún archivo seleccionado";
  DOM.fileNameSpan.style.color = "";
  DOM.fileNameSpan.style.fontWeight = "";
  state.currentUploadedImageBase64 = null;
  
  DOM.imagePreview.src = "";
  DOM.imagePreview.classList.add("hidden");
  DOM.removeImgBtn.classList.add("hidden");
}

async function handleDeleteProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  if (confirm(`¿Estás seguro de que deseas eliminar el artículo "${product.name}"?`)) {
    const password = safeStorage.getItem("chimipesca_admin_password", true);
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteProduct",
          password,
          productId
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al eliminar el producto");
      }
      
      // Si estamos editando el mismo producto que eliminamos, cancelar la edición primero
      if (state.editingProductId === productId) {
        resetAdminForm();
      }
      
      state.products = state.products.filter(p => p.id !== productId);
      saveCatalogLocal();
      
      renderCatalog();
      renderAdminProductsTable();
    } catch (error) {
      alert(`Error al eliminar el producto: ${error.message}`);
      console.error(error);
    }
  }
}

window.startEditProduct = (productId) => {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  state.editingProductId = productId;
  
  // Rellenar formulario
  DOM.formActionTitle.textContent = "Editar Artículo";
  DOM.editProductIdInput.value = product.id;
  DOM.formNameInput.value = product.name;
  
  populateFormCategories(product.category);
  populateFormSubcategories(product.category, product.subcategory);
  
  DOM.formDescTextarea.value = product.description;
  DOM.formPriceWholesaleInput.value = product.priceWholesale;
  DOM.formPriceRetailInput.value = product.priceRetail;
  
  // Carga de imagen preview
  state.currentUploadedImageBase64 = product.image;
  DOM.imagePreview.src = product.image;
  DOM.imagePreview.classList.remove("hidden");
  DOM.removeImgBtn.classList.remove("hidden");
  DOM.fileNameSpan.textContent = "Mantener imagen actual";
  
  // Mostrar botón Cancelar
  DOM.formCancelBtn.classList.remove("hidden");
  DOM.formSubmitBtn.textContent = "Guardar Cambios";
  
  // Scroll hacia el formulario de edición (útil en móviles)
  DOM.productForm.scrollIntoView({ behavior: 'smooth' });
};

async function handleProductFormSubmit(e) {
  e.preventDefault();
  
  const id = DOM.editProductIdInput.value;
  const name = DOM.formNameInput.value.trim();
  let category = DOM.formCategorySelect.value;
  let subcategory = DOM.formSubcategorySelect.value;
  const description = DOM.formDescTextarea.value.trim();
  const priceWholesale = parseFloat(DOM.formPriceWholesaleInput.value);
  const priceRetail = parseFloat(DOM.formPriceRetailInput.value);
  
  let categoriesChanged = false;
  
  // Manejo de categoría personalizada
  if (category === "new_cat") {
    const newCatName = DOM.formCustomCategoryInput.value.trim();
    if (!newCatName) {
      alert("Por favor ingresa el nombre de la nueva categoría.");
      return;
    }
    category = newCatName;
    if (!categories[category]) {
      categories[category] = [];
      categoriesChanged = true;
    }
  }
  
  // Manejo de subcategoría personalizada
  if (subcategory === "new_sub") {
    const newSubName = DOM.formCustomSubcategoryInput.value.trim();
    if (!newSubName) {
      alert("Por favor ingresa el nombre de la nueva subcategoría.");
      return;
    }
    subcategory = newSubName;
    if (categories[category] && !categories[category].includes(subcategory)) {
      categories[category].push(subcategory);
      categoriesChanged = true;
    }
  }
  
  // Asignar imagen (la subida comprimida en base64, o la imagen por defecto correspondiente si es nuevo y no subió nada)
  let image = state.currentUploadedImageBase64;
  if (!image) {
    if (category === "Cañas") {
      image = "assets/default-rod.png";
    } else if (category === "Tanzas") {
      image = "assets/default-line.png";
    } else {
      image = "assets/default-reel.png";
    }
  }
  
  const productToSave = {
    id: state.editingProductId || ("prod_" + Date.now()),
    name,
    category,
    subcategory,
    description,
    priceWholesale,
    priceRetail,
    image
  };
  
  const password = safeStorage.getItem("chimipesca_admin_password", true);
  const originalSubmitText = DOM.formSubmitBtn.textContent;
  DOM.formSubmitBtn.disabled = true;
  DOM.formSubmitBtn.textContent = "Guardando...";
  
  try {
    // 1. Guardar el producto en el servidor
    const prodRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveProduct",
        password,
        product: productToSave
      })
    });
    
    if (!prodRes.ok) {
      const errData = await prodRes.json();
      throw new Error(errData.error || "Error al guardar el producto");
    }
    
    // 2. Si las categorías cambiaron, sincronizarlas en el servidor
    if (categoriesChanged) {
      const catRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveCategories",
          password,
          categories
        })
      });
      
      if (!catRes.ok) {
        const errData = await catRes.json();
        console.error("Error guardando categorías:", errData.error);
      }
    }
    
    // Actualizar estado local
    if (state.editingProductId) {
      const idx = state.products.findIndex(p => p.id === state.editingProductId);
      if (idx !== -1) {
        state.products[idx] = productToSave;
      }
    } else {
      state.products.unshift(productToSave);
    }
    
    saveCatalogLocal();
    saveCategoriesLocal();
    
    renderCategoryTabs();
    renderCatalog();
    renderAdminProductsTable();
    resetAdminForm();
  } catch (error) {
    alert(`Error al guardar en el servidor: ${error.message}`);
    console.error(error);
  } finally {
    DOM.formSubmitBtn.disabled = false;
    DOM.formSubmitBtn.textContent = originalSubmitText;
  }
}

function resetAdminForm() {
  state.editingProductId = null;
  state.currentUploadedImageBase64 = null;
  
  DOM.productForm.reset();
  DOM.editProductIdInput.value = "";
  DOM.formActionTitle.textContent = "Agregar Nuevo Artículo";
  DOM.formSubmitBtn.textContent = "Subir al Catálogo";
  DOM.formCancelBtn.classList.add("hidden");
  
  populateFormCategories();
  
  DOM.formSubcategorySelect.disabled = true;
  DOM.formSubcategorySelect.innerHTML = `<option value="" disabled selected>Seleccione una categoría primero...</option>`;
  
  DOM.customCategoryGroup.classList.add("hidden");
  DOM.formCustomCategoryInput.required = false;
  DOM.formCustomCategoryInput.value = "";
  
  DOM.customSubcategoryGroup.classList.add("hidden");
  DOM.formCustomSubcategoryInput.required = false;
  DOM.formCustomSubcategoryInput.value = "";
  
  // Limpiar preview de imagen
  DOM.imagePreview.src = "";
  DOM.imagePreview.classList.add("hidden");
  DOM.removeImgBtn.classList.add("hidden");
  DOM.fileNameSpan.textContent = "Ningún archivo seleccionado";
  DOM.fileNameSpan.style.color = "";
  DOM.fileNameSpan.style.fontWeight = "";
}

// --- Respaldos y Backups (JSON Import / Export) ---
function exportCatalogJSON() {
  if (state.products.length === 0) {
    alert("El catálogo está vacío. No hay nada para exportar.");
    return;
  }
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.products, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  
  const dateStr = new Date().toISOString().slice(0,10);
  downloadAnchor.setAttribute("download", `chimipesca_catalogo_${dateStr}.json`);
  
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importCatalogJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(evt) {
    try {
      const importedProducts = JSON.parse(evt.target.result);
      
      // Validación básica de estructura de datos
      if (Array.isArray(importedProducts)) {
        const isValid = importedProducts.every(p => 
          p.id && p.name && p.category && p.subcategory && 
          typeof p.priceWholesale === 'number' && typeof p.priceRetail === 'number'
        );
        
        if (isValid) {
          if (confirm(`Se detectaron ${importedProducts.length} productos. ¿Deseas sobreescribir el catálogo actual con este archivo de copia de seguridad?`)) {
            const password = safeStorage.getItem("chimipesca_admin_password", true);
            
            // Reconstruir categorías a partir de productos
            const tempCategories = JSON.parse(JSON.stringify(CATEGORIES_DATA));
            importedProducts.forEach(p => {
              if (!tempCategories[p.category]) {
                tempCategories[p.category] = [];
              }
              if (!tempCategories[p.category].includes(p.subcategory)) {
                tempCategories[p.category].push(p.subcategory);
              }
            });
            
            try {
              const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "importCatalog",
                  password,
                  products: importedProducts,
                  categories: tempCategories
                })
              });
              
              if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error al importar el catálogo");
              }
              
              state.products = importedProducts;
              categories = tempCategories;
              
              saveCatalogLocal();
              saveCategoriesLocal();
              
              renderCategoryTabs();
              renderCatalog();
              renderAdminProductsTable();
              resetAdminForm();
              populateManageCategories();
              alert("Catálogo importado exitosamente.");
            } catch (error) {
              alert(`Error al importar: ${error.message}`);
              console.error(error);
            }
          }
        } else {
          alert("Error: El archivo JSON no tiene la estructura correcta de un catálogo de productos ChimiPesca.");
        }
      } else {
        alert("Error: El formato del archivo JSON debe ser una lista de artículos.");
      }
    } catch (err) {
      alert("Error leyendo el archivo JSON. Asegúrate de que sea un respaldo válido.");
      console.error(err);
    }
    // Limpiar input file para permitir volver a cargar el mismo archivo
    DOM.backupImportFile.value = "";
  };
  reader.readAsText(file);
}

async function resetCatalogToSeeded() {
  if (confirm("¿Estás seguro de que deseas restablecer el catálogo a los artículos predeterminados? Se borrarán todos los cambios y productos que hayas agregado.")) {
    const password = safeStorage.getItem("chimipesca_admin_password", true);
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resetCatalog",
          password
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al restablecer el catálogo");
      }
      
      state.products = [...DEFAULT_PRODUCTS];
      categories = JSON.parse(JSON.stringify(CATEGORIES_DATA));
      
      saveCatalogLocal();
      saveCategoriesLocal();
      
      renderCategoryTabs();
      renderCatalog();
      renderAdminProductsTable();
      resetAdminForm();
      populateManageCategories();
      alert("Catálogo restablecido a valores predeterminados.");
    } catch (error) {
      alert(`Error al restablecer catálogo: ${error.message}`);
      console.error(error);
    }
  }
}

// --- Gestión de Categorías y Subcategorías (Panel Admin) ---
function populateManageCategories() {
  let html = `<option value="" disabled selected>Seleccione categoría...</option>`;
  Object.keys(categories).forEach(cat => {
    html += `<option value="${cat}">${cat}</option>`;
  });
  DOM.manageCategorySelect.innerHTML = html;
  
  DOM.manageSubcategorySelect.innerHTML = `<option value="" disabled selected>Seleccione categoría primero...</option>`;
  DOM.manageSubcategorySelect.disabled = true;
  DOM.deleteCategoryBtn.disabled = true;
  DOM.deleteSubcategoryBtn.disabled = true;
}

function populateManageSubcategories(category) {
  const subcats = categories[category] || [];
  let html = `<option value="" disabled selected>Seleccione subcategoría...</option>`;
  subcats.forEach(sub => {
    html += `<option value="${sub}">${sub}</option>`;
  });
  DOM.manageSubcategorySelect.innerHTML = html;
  DOM.manageSubcategorySelect.disabled = false;
  DOM.deleteSubcategoryBtn.disabled = true;
}

function handleManageCategorySelectChange(e) {
  const cat = e.target.value;
  if (cat) {
    DOM.deleteCategoryBtn.disabled = false;
    populateManageSubcategories(cat);
  } else {
    DOM.deleteCategoryBtn.disabled = true;
    DOM.deleteSubcategoryBtn.disabled = true;
  }
}

function handleManageSubcategorySelectChange(e) {
  const sub = e.target.value;
  DOM.deleteSubcategoryBtn.disabled = !sub;
}

async function handleDeleteCategory() {
  const cat = DOM.manageCategorySelect.value;
  if (!cat) return;
  
  // Contar productos asociados
  const associatedProducts = state.products.filter(p => p.category === cat);
  const count = associatedProducts.length;
  
  let confirmMsg = `¿Estás seguro de que deseas eliminar la categoría "${cat}"?`;
  if (count > 0) {
    confirmMsg += `\n\nATENCIÓN: Hay ${count} producto(s) en esta categoría que también serán eliminados de forma permanente.`;
  }
  
  if (confirm(confirmMsg)) {
    const password = safeStorage.getItem("chimipesca_admin_password", true);
    
    try {
      const nextCats = { ...categories };
      delete nextCats[cat];
      
      const remainingProducts = state.products.filter(p => p.category !== cat);
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "importCatalog",
          password,
          products: remainingProducts,
          categories: nextCats
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al eliminar la categoría");
      }
      
      categories = nextCats;
      state.products = remainingProducts;
      
      saveCatalogLocal();
      saveCategoriesLocal();
      
      renderCategoryTabs();
      renderCatalog();
      renderAdminProductsTable();
      populateFormCategories();
      populateManageCategories();
      resetAdminForm();
      
      alert(`Categoría "${cat}" eliminada exitosamente.`);
    } catch (error) {
      alert(`Error al eliminar categoría: ${error.message}`);
      console.error(error);
    }
  }
}

async function handleDeleteSubcategory() {
  const cat = DOM.manageCategorySelect.value;
  const sub = DOM.manageSubcategorySelect.value;
  if (!cat || !sub) return;
  
  // Contar productos asociados
  const associatedProducts = state.products.filter(p => p.category === cat && p.subcategory === sub);
  const count = associatedProducts.length;
  
  let confirmMsg = `¿Estás seguro de que deseas eliminar la subcategoría "${sub}" de la categoría "${cat}"?`;
  if (count > 0) {
    confirmMsg += `\n\nATENCIÓN: Hay ${count} producto(s) en esta subcategoría que también serán eliminados de forma permanente.`;
  }
  
  if (confirm(confirmMsg)) {
    const password = safeStorage.getItem("chimipesca_admin_password", true);
    
    try {
      const nextCats = JSON.parse(JSON.stringify(categories));
      if (nextCats[cat]) {
        nextCats[cat] = nextCats[cat].filter(s => s !== sub);
      }
      
      const remainingProducts = state.products.filter(p => !(p.category === cat && p.subcategory === sub));
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "importCatalog",
          password,
          products: remainingProducts,
          categories: nextCats
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al eliminar la subcategoría");
      }
      
      categories = nextCats;
      state.products = remainingProducts;
      
      saveCatalogLocal();
      saveCategoriesLocal();
      
      renderCategoryTabs();
      renderCatalog();
      renderAdminProductsTable();
      populateFormCategories();
      populateManageCategories();
      resetAdminForm();
      
      alert(`Subcategoría "${sub}" eliminada exitosamente.`);
    } catch (error) {
      alert(`Error al eliminar subcategoría: ${error.message}`);
      console.error(error);
    }
  }
}
