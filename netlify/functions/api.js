const { createClient } = require("@libsql/client");

// Datos predeterminados para sembrado (se usan si la base de datos está vacía)
const DEFAULT_CATEGORIES = {
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

// Configuración del cliente Turso / Local SQLite
const dbUrl = process.env.TURSO_DATABASE_URL || "file:local_chimipesca.db";
const dbToken = process.env.TURSO_AUTH_TOKEN || "";

const client = createClient({
  url: dbUrl,
  authToken: dbToken,
});

let isInitialized = false;

// Inicializa las tablas y el sembrado si no existen
async function ensureTablesExist() {
  if (isInitialized) return;

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      description TEXT NOT NULL,
      priceWholesale REAL NOT NULL,
      priceRetail REAL NOT NULL,
      image TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Sembrar productos si la tabla está vacía
  const prodCountRes = await client.execute("SELECT COUNT(*) as count FROM products");
  const count = prodCountRes.rows[0].count;
  if (count === 0) {
    const statements = DEFAULT_PRODUCTS.map(p => ({
      sql: "INSERT INTO products (id, name, category, subcategory, description, priceWholesale, priceRetail, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [p.id, p.name, p.category, p.subcategory, p.description, p.priceWholesale, p.priceRetail, p.image]
    }));
    await client.batch(statements);
  }

  // Sembrar categorías iniciales si no existen
  const catRes = await client.execute("SELECT value FROM settings WHERE key = 'categories'");
  if (catRes.rows.length === 0) {
    await client.execute({
      sql: "INSERT INTO settings (key, value) VALUES ('categories', ?)",
      args: [JSON.stringify(DEFAULT_CATEGORIES)]
    });
  }

  isInitialized = true;
}

exports.handler = async function(event, context) {
  // Configuración de cabeceras CORS básicas
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Asegurar estructura de tablas
    await ensureTablesExist();

    if (event.httpMethod === "GET") {
      // 1. Obtener productos
      const prodRes = await client.execute("SELECT * FROM products");
      const products = prodRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        subcategory: row.subcategory,
        description: row.description,
        priceWholesale: row.priceWholesale,
        priceRetail: row.priceRetail,
        image: row.image
      }));

      // 2. Obtener categorías
      const catRes = await client.execute("SELECT value FROM settings WHERE key = 'categories'");
      let categories = DEFAULT_CATEGORIES;
      if (catRes.rows.length > 0) {
        try {
          categories = JSON.parse(catRes.rows[0].value);
        } catch (e) {
          console.error("Error al parsear categorías guardadas:", e);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ products, categories })
      };
    }

    if (event.httpMethod === "POST") {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Cuerpo de solicitud vacío" })
        };
      }

      let data;
      try {
        data = JSON.parse(event.body);
      } catch (err) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Formato JSON inválido" })
        };
      }

      // Validar contraseña
      if (data.password !== "chimi2026") {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: "No autorizado: Contraseña de administración incorrecta" })
        };
      }

      const action = data.action;

      switch (action) {
        case "auth": {
          // Solo valida la contraseña
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Autenticación correcta" })
          };
        }

        case "saveProduct": {
          const p = data.product;
          if (!p || !p.id || !p.name || !p.category || !p.subcategory) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: "Faltan datos requeridos del producto" })
            };
          }

          await client.execute({
            sql: `INSERT OR REPLACE INTO products (id, name, category, subcategory, description, priceWholesale, priceRetail, image)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              p.id,
              p.name,
              p.category,
              p.subcategory,
              p.description || "",
              p.priceWholesale || 0,
              p.priceRetail || 0,
              p.image || ""
            ]
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Producto guardado exitosamente" })
          };
        }

        case "deleteProduct": {
          const { productId } = data;
          if (!productId) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: "ID del producto requerido" })
            };
          }

          await client.execute({
            sql: "DELETE FROM products WHERE id = ?",
            args: [productId]
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Producto eliminado exitosamente" })
          };
        }

        case "saveCategories": {
          const { categories: nextCats } = data;
          if (!nextCats) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: "Categorías requeridas" })
            };
          }

          await client.execute({
            sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('categories', ?)",
            args: [JSON.stringify(nextCats)]
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Categorías guardadas exitosamente" })
          };
        }

        case "importCatalog": {
          const { products, categories: newCats } = data;
          if (!Array.isArray(products)) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: "El catálogo debe ser un array de productos" })
            };
          }

          const batchQueries = [];
          
          // Limpiar catálogo y categorías antiguas
          batchQueries.push({ sql: "DELETE FROM products", args: [] });
          
          // Insertar los productos nuevos
          products.forEach(p => {
            batchQueries.push({
              sql: `INSERT INTO products (id, name, category, subcategory, description, priceWholesale, priceRetail, image)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                p.id,
                p.name,
                p.category,
                p.subcategory,
                p.description || "",
                p.priceWholesale || 0,
                p.priceRetail || 0,
                p.image || ""
              ]
            });
          });

          // Insertar categorías si se proveen
          if (newCats) {
            batchQueries.push({
              sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('categories', ?)",
              args: [JSON.stringify(newCats)]
            });
          }

          await client.batch(batchQueries);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Catálogo completo importado exitosamente" })
          };
        }

        case "resetCatalog": {
          const batchQueries = [];

          // Limpiar
          batchQueries.push({ sql: "DELETE FROM products", args: [] });
          batchQueries.push({ sql: "DELETE FROM settings WHERE key = 'categories'", args: [] });

          // Sembrar por defecto
          DEFAULT_PRODUCTS.forEach(p => {
            batchQueries.push({
              sql: `INSERT INTO products (id, name, category, subcategory, description, priceWholesale, priceRetail, image)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [p.id, p.name, p.category, p.subcategory, p.description, p.priceWholesale, p.priceRetail, p.image]
            });
          });

          batchQueries.push({
            sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('categories', ?)",
            args: [JSON.stringify(DEFAULT_CATEGORIES)]
          });

          await client.batch(batchQueries);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Catálogo restablecido correctamente" })
          };
        }

        default: {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Acción no soportada: ${action}` })
          };
        }
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método HTTP no permitido" })
    };

  } catch (error) {
    console.error("Error en la ejecución de la función serverless:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error interno del servidor", details: error.message })
    };
  }
};
