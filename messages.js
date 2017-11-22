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

function getMagazine() {
    new Promise( (resolve, reject) => {
        let magazine = get(`/v2/permanents/${keys.deviceIden}_threads`);
        return magazine
    }).then((magazine) => {
        console.log(magazine);
    });

}

function get(path) {
    options.path = path;
    let temp = '';
    req = https.request(options, (res) => {
        res.on('data', (d) => {
            temp += d;
        });
        res.on('end', () => {
            console.log(temp)
            return temp
        });
        res.on('error', (e) => { throw e });
    });
    req.end();
};