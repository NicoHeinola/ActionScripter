const { default: axios } = require('axios');
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

const axiosInstance = axios.create({
    baseURL: `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`,
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

    if (process.env.BUILD_MODE == "DEBUG") {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.loadFile(path.join(__dirname, '/frontend/index.html'));
    }

    mainWindow.on('close', async (event) => {
        // Prevent the window from closing immediately
        event.preventDefault();

        // Your custom logic here, like making an API call
        try {
            await axiosInstance.post(`/app/quit`);
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
    if (process.env.BUILD_MODE == "DEBUG") {
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