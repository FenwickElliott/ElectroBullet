const https = require('https');
const fs = require('fs');
const path = require('path');

let keys;
let options = {
    hostname: 'api.pushbullet.com'
};

fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
    if (err) { throw e }
    keys = JSON.parse(res);
    options.headers = {"Access-Token": keys.token}
    getMagazine();
});

let magazine;

function getMagazine() {
    get(`/v2/permanents/${keys.deviceIden}_threads`)
    .then( res => {
        magazine = JSON.parse(res).threads;
        fs.writeFile(path.join(__dirname, 'db', 'magazine.json'), res);
        // updateThreads();
    }).catch( e => { throw e });
}

function get(path) {
    return new Promise( (resolve, reject) => {
        options.path = path;
        let temp = '';
        req = https.request(options, (res) => {
            res.on('data', (d) => {
                temp += d;
            });
            res.on('end', () => {
                resolve(temp)
            });
            res.on('error', (e) => { reject(e) });
        });
        req.end();
    })
}