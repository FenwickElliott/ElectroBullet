"use strict";
const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

app.on('ready', () => {
    fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
        if (err && err.errno == -2) {
            require('./init');
        } else if (err) {
            console.log(err);
        } else {
            fs.readFile(path.join(__dirname, 'db', 'bounds.json'), 'utf8', (err, res) => {
                if (err) {
                    createWindow({width:800, height:600});
                } else {
                    createWindow(JSON.parse(res));
                };
            });
        };
    });
});

function createWindow (bounds) {
    let win = new BrowserWindow(bounds);
    win.loadURL(`file://${__dirname}/index.html`);
    // win.webContents.openDevTools();
    win.on('closed', () => { win = null });
    win.on('move', () => {
        fs.writeFileSync(path.join(__dirname, 'db', 'bounds.json'), JSON.stringify(win.getBounds()));
    });
    win.on('resize', () => {
        fs.writeFileSync(path.join(__dirname, 'db', 'bounds.json'), JSON.stringify(win.getBounds()));
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate([{
        label: 'Application',
        submenu: [
            { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
            { type: 'separator' },
            { label: 'Quit', accelerator: 'Command+Q', click: () => { app.quit() }}
        ]}, {
        label: 'Edit',
        submenu: [
            { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
            { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
            { type: 'separator' },
            { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
            { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
            { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
            { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
        ]}, {
        label: 'Window',
        submenu: [
            { label: 'Close Window', accelerator: 'CmdOrCtrl-W', role: 'close'},
            { label: 'Refresh', accelerator: 'CmdOrCtrl+R', role: 'reload'},
            { label: 'Toggle Developer Tools', role: 'toggledevtools'}
        ]}, {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click: () => { require('electron').shell.openExternal('https://fenwickelliott.io/ElectroBullet.html') }
            }
          ]
        }
    ]));
};

app.on('activate', () => { if (win == null) { createWindow() }});