const {electron, app, shell} = require('electron');
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const post = require('./util').post;
const get = require('./util').get;

let keys = {};

shell.openExternal("https://www.pushbullet.com/authorize?client_id=Hjs2wOYTkl4bMWK2rZ2gzIk4CaYakUPc&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2F%3Fcode%3D&response_type=code&scope=everything")

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Thank you, you can now close this page");
    let qs = url.parse(req.url, true).query;
    exchange(qs.code);
    res.end();
}).listen(8081);

if (!fs.existsSync(path.join(__dirname, 'db'))) {
    fs.mkdir(path.join(__dirname, 'db'), (err, res) => {
        fs.mkdirSync(path.join(__dirname, 'db', 'threads'));
        fs.mkdirSync(path.join(__dirname, 'db', 'avatars'));
    });
};

function exchange(code) {

    let payload = JSON.stringify({
        "client_id":"Hjs2wOYTkl4bMWK2rZ2gzIk4CaYakUPc",
        "client_secret":"VGY1npt6WrkaXVeMnIhvDB0SAQLGzOlQ",
        "code":code,
        "grant_type":"authorization_code"
    });

    post(payload, '/oauth2/token', '<your_access_token_here>')
    .then( res => {
        keys.token = JSON.parse(res).access_token;
        get('/v2/users/me', {token: keys.token})
        .then( res => { getMe(res) }).catch( e => { throw e });
        get('/v2/devices', {token: keys.token})
        .then( res => { getDevice(res) }).catch( e => { throw e });
    })
    .catch( e => { throw e });
};

function getMe(res) {
    keys.iden = JSON.parse(res).iden;
    if(Object.keys(keys).length == 3) { writeKeys()};
}

function getDevice(res) {
    JSON.parse(res).devices.forEach( d => {
        if (d.has_sms) {
            keys.deviceIden = d.iden;
            if(Object.keys(keys).length == 3) { writeKeys()};
        };
    });
};


function writeKeys() {
    fs.writeFileSync(path.join(__dirname, '/db/keys.json'), JSON.stringify(keys));
    app.relaunch();
    app.exit();
};