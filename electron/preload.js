"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aggredateDesktop", {
  platform: process.platform,
  copyText: function (text) {
    return ipcRenderer.invoke("clipboard:write", text);
  },
  exportProject: function (project) {
    return ipcRenderer.invoke("project:save", project);
  },
  importProject: function () {
    return ipcRenderer.invoke("project:open");
  }
});
