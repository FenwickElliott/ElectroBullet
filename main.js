const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');

let bounds = {width:800, height:600}

app.on('ready', () => {
    fs.readFile(path.join(__dirname, 'db/keys.json'), 'utf8', (err, res) =>{
        if (err && err.errno == -2) {
            require('./init');
        } else if (err) {
            console.log(err)
        } else {
            createWindow()
        }
    })
})

function createWindow () {
    mainWindow = new BrowserWindow(bounds)
    mainWindow.loadURL(`file://${__dirname}/index.html`)
}