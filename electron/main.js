"use strict";

const fs = require("fs/promises");
const path = require("path");
const { app, BrowserWindow, clipboard, dialog, ipcMain, shell } = require("electron");

const ROOT = path.join(__dirname, "..");

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: "Aggredate Studio",
    backgroundColor: "#f2f4ee",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.once("ready-to-show", function () {
    win.show();
  });

  win.webContents.setWindowOpenHandler(function (details) {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", function (event, url) {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadFile(path.join(ROOT, "index.html"));
}

app.whenReady().then(function () {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("clipboard:write", function (_event, text) {
  clipboard.writeText(String(text || ""));
  return true;
});

ipcMain.handle("project:save", async function (_event, payload) {
  const result = await dialog.showSaveDialog({
    title: "Export Aggredate project",
    defaultPath: "aggredate-project.json",
    filters: [{ name: "Aggredate Project", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.writeFile(result.filePath, JSON.stringify(payload, null, 2), "utf8");
  return { canceled: false, filePath: result.filePath };
});

ipcMain.handle("project:open", async function () {
  const result = await dialog.showOpenDialog({
    title: "Import Aggredate project",
    properties: ["openFile"],
    filters: [{ name: "Aggredate Project", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePaths || !result.filePaths[0]) return { canceled: true };
  const raw = await fs.readFile(result.filePaths[0], "utf8");
  return { canceled: false, filePath: result.filePaths[0], project: JSON.parse(raw) };
});
