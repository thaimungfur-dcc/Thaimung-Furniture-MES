import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Google Sheets Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SERVICE_ACCOUNT_KEY_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

let sheetsClient: any = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_KEY_BASE64) {
    console.warn("Google Sheets credentials missing. Database integration disabled.");
    return null;
  }

  try {
    const keyJson = JSON.parse(Buffer.from(SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString());
    const auth = new JWT({
      email: keyJson.client_email,
      key: keyJson.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error);
    return null;
  }
}

// Module Definitions and Headers
const MODULES = {
  MASTER_CODES: {
    name: "MasterCodes",
    headers: ["groups", "category", "catCode", "subCategory", "subCatCode", "note", "id"]
  },
  ITEM_MASTER: {
    name: "ItemMaster",
    headers: ["itemId", "itemName", "group", "category", "subCategory", "uom", "minStock", "maxStock", "location", "note", "id"]
  },
  PLANNING: {
    name: "Planning",
    headers: ["planId", "product", "quantity", "dueDate", "status", "id"]
  },
  PRODUCTION: {
    name: "Production",
    headers: ["lineId", "jobId", "product", "target", "actual", "status", "progress", "id"]
  },
  USER_PERMISSIONS: {
    name: "UserPermissions",
    headers: ["userId", "name", "position", "email", "avatar", "permissions", "id"]
  }
};

// Initialize Sheets and Headers
async function initializeDatabase() {
  const sheets = await getSheetsClient();
  if (!sheets) return;

  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = spreadsheet.data.sheets?.map((s: any) => s.properties.title) || [];

    for (const moduleKey of Object.keys(MODULES)) {
      const module = (MODULES as any)[moduleKey];
      if (!existingSheets.includes(module.name)) {
        console.log(`Creating sheet: ${module.name}`);
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{ addSheet: { properties: { title: module.name } } }]
          }
        });

        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${module.name}!A1`,
          valueInputOption: "RAW",
          requestBody: { values: [module.headers] }
        });
      }
    }
    console.log("Database initialization complete.");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

// API Routes
app.get("/api/db-status", async (req, res) => {
  const sheets = await getSheetsClient();
  res.json({
    connected: !!sheets,
    spreadsheetId: SPREADSHEET_ID || "Not Set",
    configured: !!(SPREADSHEET_ID && SERVICE_ACCOUNT_KEY_BASE64)
  });
});

// Generic CRUD helper
async function getSheetData(sheetName: string) {
  const sheets = await getSheetsClient();
  if (!sheets) throw new Error("Database not connected");

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return [];

  const headers = rows[0];
  return rows.slice(1).map((row: any) => {
    const obj: any = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

async function appendSheetData(sheetName: string, data: any) {
  const sheets = await getSheetsClient();
  if (!sheets) throw new Error("Database not connected");

  const module = Object.values(MODULES).find(m => m.name === sheetName);
  if (!module) throw new Error("Invalid sheet name");

  const row = module.headers.map(header => data[header] || "");

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    requestBody: { values: [row] }
  });
}

// Specific Routes for Master Codes
app.get("/api/master-codes", async (req, res) => {
  try {
    const data = await getSheetData(MODULES.MASTER_CODES.name);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/master-codes", async (req, res) => {
  try {
    await appendSheetData(MODULES.MASTER_CODES.name, { ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Specific Routes for Item Master
app.get("/api/item-master", async (req, res) => {
  try {
    const data = await getSheetData(MODULES.ITEM_MASTER.name);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/item-master", async (req, res) => {
  try {
    await appendSheetData(MODULES.ITEM_MASTER.name, { ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Specific Routes for Planning
app.get("/api/planning", async (req, res) => {
  try {
    const data = await getSheetData(MODULES.PLANNING.name);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/planning", async (req, res) => {
  try {
    await appendSheetData(MODULES.PLANNING.name, { ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Specific Routes for Production
app.get("/api/production", async (req, res) => {
  try {
    const data = await getSheetData(MODULES.PRODUCTION.name);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/production", async (req, res) => {
  try {
    await appendSheetData(MODULES.PRODUCTION.name, { ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Specific Routes for User Permissions
app.get("/api/user-permissions", async (req, res) => {
  try {
    const data = await getSheetData(MODULES.USER_PERMISSIONS.name);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user-permissions", async (req, res) => {
  try {
    await appendSheetData(MODULES.USER_PERMISSIONS.name, { ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    initializeDatabase();
  });
}

startServer();
