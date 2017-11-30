"use strict";
const https = require('https');
const path = require('path');
const fs = require('fs');

function get(path, params = {}) {
    return new Promise( (resolve, reject) => {
        let options = {
            hostname: params.hostname || 'api.pushbullet.com',
            path: path,
            headers: {
                'Access-Token': params.token || keys.token,
                'Content-Type': 'application/json'
            }
        };
        let temp = '';
        let req = https.request(options, (res) => {
            if ( res.statusCode != 200 ) { reject( res.statusCode + " on " + path ) };
            if (params.encoding) { res.setEncoding(params.encoding) };
            res.on('data', (d) => { temp += d });
            res.on('end', () => { resolve(temp) });
            res.on('error', (e) => { reject(e) });
        });
        req.end();
    });
};

function post(payload, path, token) {
    return new Promise( (resolve, reject) => {
        let options = {
            hostname: 'api.pushbullet.com',
            path: path,
            method: 'POST',
            headers: {
                'Access-Token': token || keys.token,
                'Content-Type': 'application/json'
            }
        };
        let temp = '';
        let req = https.request(options, (res) => {
            res.on('data', (d) => { temp += d });
            res.on('end', () => { resolve(temp) });
            res.on('error', (e) => { reject(e) });
        });
        req.write(payload);
        req.end();
    });
};

function rmDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach( (ent) => {
            let entPath = path.join(dirPath, ent)
            if (fs.lstatSync(entPath).isDirectory()) {
                rmDir(entPath);
            } else {
                fs.unlinkSync(entPath);
            };
        });
        fs.rmdirSync(dirPath);
    };
};

exports.get = get;
exports.post = post;
exports.purge = rmDir;