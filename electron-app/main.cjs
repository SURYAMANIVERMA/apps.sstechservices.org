const { app, BrowserWindow, ipcMain, clipboard, shell } = require("electron");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const API_BASE = "https://apps.sstechservices.org";
let currentSession = null;

function settingsPath() {
  return path.join(app.getPath("userData"), "quick-support.json");
}

function readSettings() {
  try { return JSON.parse(fs.readFileSync(settingsPath(), "utf8")); } catch { return {}; }
}

function writeSettings(next) {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(next, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 880,
    height: 600,
    minWidth: 760,
    minHeight: 520,
    backgroundColor: "#0a0f1c",
    title: "SSTECH Nexeus Quick Support",
    icon: path.join(__dirname, "renderer", "logo.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

ipcMain.handle("nexeus:generate-session", () => {
  const settings = readSettings();
  const id = settings.deviceId || `${rand(3)}-${rand(3)}-${rand(3)}`;
  const pin = rand(4);
  const next = { ...settings, deviceId: id, lastPin: pin };
  writeSettings(next);
  currentSession = { id, pin, server: "relay-fra1.sstechservices.org" };
  return currentSession;
});

ipcMain.handle("nexeus:get-profile", () => readSettings().profile || null);

ipcMain.handle("nexeus:save-profile", (_e, profile) => {
  const settings = readSettings();
  writeSettings({ ...settings, profile });
  return true;
});

ipcMain.handle("nexeus:register-device", async (_e, payload) => {
  try {
    const session = currentSession || payload;
    const res = await fetch(`${API_BASE}/api/public/remote/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId: session.id,
        pin: session.pin,
        alias: payload?.alias || readSettings().profile?.name || null,
        platform: process.platform,
        appVersion: app.getVersion(),
      }),
    });
    return { ok: res.ok };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "network" };
  }
});

ipcMain.handle("nexeus:copy", (_e, text) => {
  clipboard.writeText(String(text || ""));
  return true;
});

ipcMain.handle("nexeus:open-external", (_e, url) => {
  shell.openExternal(String(url));
  return true;
});

function rand(n) {
  const buf = crypto.randomBytes(n);
  let out = "";
  for (let i = 0; i < n; i++) out += (buf[i] % 10).toString();
  return out;
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
