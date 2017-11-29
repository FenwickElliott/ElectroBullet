const {app, BrowserWindow, Menu} = require('electron');

const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');

app.on('ready', () => {
    fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
        if (err && err.errno == -2) {
            require('./init');
        } else if (err) {
            throw e;
        } else {
            fs.readFile(path.join(__dirname, 'db', 'bounds.json'), 'utf8', (err, res) => {
                if(err) { throw e };
                createWindow(JSON.parse(res));
            })
        };
    });
});

function createWindow (bounds) {
    win = new BrowserWindow(bounds);
    win.loadURL(`file://${__dirname}/index.html`);
    win.webContents.openDevTools();
    win.on('closed', () => { win = null });
    win.on('move', () => {
        fs.writeFileSync(path.join(__dirname, 'db', 'bounds.json'), JSON.stringify(win.getBounds()));
    });
    win.on('resize', () => {
        fs.writeFileSync(path.join(__dirname, 'db', 'bounds.json'), JSON.stringify(win.getBounds()));
    });
};

app.on('activate', () => { createWindow() });