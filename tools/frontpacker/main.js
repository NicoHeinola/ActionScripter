const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
require('dotenv').config();

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    if (process.env.BUILD_MODE == "debug") {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.loadFile(path.join(__dirname, '/frontend/index.html'));
    }
}

app.on('ready', () => {
    createWindow();
})

app.on('browser-window-focus', function () {
    if (process.env.BUILD_MODE == "debug") {
        globalShortcut.registerAll(['CommandOrControl+W', 'CommandOrControl+O'], () => {
            return false
        });
        return;
    }

    globalShortcut.registerAll(['CommandOrControl+Shift+R', 'CommandOrControl+R', 'CommandOrControl+W', 'CommandOrControl+O', 'F5'], () => {
        return false
    });
})

// Unregister all global shortcuts when the app is about to quit
app.on('browser-window-blur', () => {
    globalShortcut.unregisterAll()
})