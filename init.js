const electron = require('electron');
const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');
const app = electron.app;

let box = {};

class Wait {
    constructor(count, callback){
        this.count = count;
        this.callback = callback;
    }
  
    done(){
        this.count--;
        if (this.count == 0){
            this.callback()
        }
    }
}

let waitForBox = new Wait(3, writeBox)

electron.shell.openExternal("https://www.pushbullet.com/authorize?client_id=Hjs2wOYTkl4bMWK2rZ2gzIk4CaYakUPc&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2F%3Fcode%3D&response_type=code&scope=everything")

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Thank you, you can now close this page");
    let qs = url.parse(req.url, true).query;
    exchange(qs.code);
    res.end();
}).listen(8081);

function exchange(code) {
    let headers = {
        'Access-Token': '<your_access_token_here>',
        'Content-Type': 'application/json'
    };

    let dataString = JSON.stringify({
        "client_id":"Hjs2wOYTkl4bMWK2rZ2gzIk4CaYakUPc",
        "client_secret":"VGY1npt6WrkaXVeMnIhvDB0SAQLGzOlQ",
        "code":code,
        "grant_type":"authorization_code"
    });

    let options = {
        hostname: 'api.pushbullet.com',
        path: '/oauth2/token',
        method: 'POST',
        headers: headers
    };

    let req = https.request(options, (res) => {
        let temp = "";
        res.on('data', (d) => {
            temp += d;
        });
        res.on('end', () => {
            getMe(JSON.parse(temp).access_token);
            getDevice(JSON.parse(temp).access_token);
            box.token = JSON.parse(temp).access_token;
            waitForBox.done();
        })
    });
    req.on('error', (e) => { throw e});
    req.write(dataString);
    req.end();
}

function getMe(token) {
    let options = {
        hostname: 'api.pushbullet.com',
        path: '/v2/users/me',
        headers: {"Access-Token": token}
    }
    let temp = "";
    req = https.request(options, (res) => {
        res.on('data', (d) => {
            temp += d;
        });
        res.on('end', () => {
            box.iden = JSON.parse(temp).iden
            waitForBox.done();
        });
        res.on('error', (e) => {throw e});
    });
    req.end();
}

function getDevice(token) {
    let options = {
        hostname: 'api.pushbullet.com',
        path: '/v2/devices',
        headers: {"Access-Token": token}
    }
    let temp = "";
    req = https.request(options, (res) => {
        res.on('data', (d) => {
            temp += d;
        });
        res.on('end', () => {
            temp = JSON.parse(temp)
            temp.devices.forEach((e) => {
                if (e.has_sms) {
                    box.deviceIden = e.iden;
                    waitForBox.done();
                }
            })
        });
        res.on('error', (e) => {throw e});
    });
    req.end();
}

function writeBox() {
    fs.writeFileSync(path.join(__dirname, '/db/keys.json'), JSON.stringify(box))
    app.relaunch();
    app.exit();
}