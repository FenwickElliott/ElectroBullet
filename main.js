const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');

let bounds = {width:800, height:600}

app.on('ready', createWindow)

function createWindow () {
    mainWindow = new BrowserWindow(bounds)
    mainWindow.loadURL(`file://${__dirname}/index.html`)
}