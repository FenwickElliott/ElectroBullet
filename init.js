const electron = require('electron');
const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');

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
        headers: headers,
        // body: dataString
    };

    let req = https.request(options, (res) => {
        console.log("res.statusCode: " + res.statusCode);
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });
    req.on('error', (e) => {
        console.log("req.on('error' :" +e);
    });
    req.write(dataString);
    req.end();
}