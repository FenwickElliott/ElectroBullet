const {app, BrowserWindow, Menu} = require('electron');

const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');

let bounds = {width:800, height:600};

app.on('ready', () => {
    fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
        if (err && err.errno == -2) {
            require('./init');
        } else if (err) {
            throw e;
        } else {
            createWindow();
        };
    });
});

function createWindow () {
    win = new BrowserWindow(bounds);
    win.loadURL(`file://${__dirname}/index.html`);
    // win.webContents.openDevTools();
    win.on('closed', () => { win = null });
};

app.on('activate', () => { createWindow() });