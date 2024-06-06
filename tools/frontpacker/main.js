const { default: axios } = require('axios');
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
require('dotenv').config();

const axiosInstance = axios.create({
    baseURL: `${process.env.API_URL}:${process.env.API_PORT}`,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    if (process.env.BUILD_MODE == "debug") {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.loadFile(path.join(__dirname, '/frontend/index.html'));
    }

    mainWindow.on('close', async (event) => {
        // Prevent the window from closing immediately
        event.preventDefault();

        // Your custom logic here, like making an API call
        try {
            await axiosInstance.post(`${process.env.API_URL}:${process.env.API_PORT}/app/quit`);
        } catch (error) {
            console.error('API call failed', error);
        }

        mainWindow.destroy();
    });
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
});