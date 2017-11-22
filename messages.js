const https = require('https');
const fs = require('fs');
const path = require('path');

let keys;

fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
    if (err) { throw e }
    keys = JSON.parse(res);
    getMagazine();
});

let magazine;

function getMagazine() {
    get(`/v2/permanents/${keys.deviceIden}_threads`)
    .then( res => {
        magazine = JSON.parse(res).threads;
        fs.writeFile(path.join(__dirname, 'db', 'magazine.json'), res);
        updateThreads();
    }).catch( e => { throw e });
}

function updateThreads() {
    magazine.forEach( thread => {
        fs.readFile(path.join(__dirname, 'db', 'threads', `${thread.id}.json`), 'utf8', (err, res) => {
            if (err || thread.latest.timestamp != JSON.parse(res).thread[0].timestamp) {
                getThread(thread.id)
            }
        })
    })
}

function getThread(id) {
    get(`/v2/permanents/${keys.deviceIden}_thread_${id}`)
    .then( res => {
        let thread = JSON.parse(res)
        fs.writeFile(path.join(__dirname, 'db', 'threads', `${id}.json`), res)
    }).catch( e => {
        console.log(e)
    })
}

function get(path) {
    return new Promise( (resolve, reject) => {
        let options = {
            hostname: 'api.pushbullet.com',
            path: path,
            headers: {"Access-Token": keys.token}
        };
        let temp = '';
        req = https.request(options, (res) => {
            if (res.statusCode == 404) {
                reject("404: " + path)
            }
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