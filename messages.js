"use strict";
const https = require('https');
const fs = require('fs');
const path = require('path');
const get = require('./util').get;
const post = require('./util').post;

let keys;
let magazine;
let currentThread;

fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
    if (err) { console.log(err) };
    keys = JSON.parse(res);
    getMagazine();
    openWebSocket();
});

function getMagazine() {
    get(`/v2/permanents/${keys.deviceIden}_threads`)
    .then( res => {
        magazine = JSON.parse(res).threads;
        postMagazine();
        updateThreads();
        getAvatars();
        fs.writeFileSync(path.join(__dirname, 'db', 'magazine.json'), res);
    }).catch( e => { console.log(e) });
};

function getAvatars() {
    for (let i = 0; i < magazine.length; i++) {
        if (magazine[i].recipients[0].image_url && ! fs.existsSync(path.join(__dirname, 'db', 'avatars', `${magazine[i].id}.jpg`))) {
            get(magazine[i].recipients[0].image_url, {hostname: 'dl2.pushbulletusercontent.com', encoding:'binary'})
            .then( res => {
                fs.writeFileSync(path.join(__dirname, 'db', 'avatars', `${magazine[i].id}.jpg`), res, 'binary');
            })
            .catch( (e) => { console.log(e) });
        };
    };
};

function updateThreads() {
    for(let i = 0; i < magazine.length; i++) {
        fs.readFile(path.join(__dirname, 'db', 'threads', `${magazine[i].id}.json`), 'utf8', (err, res) => {
            if (err || magazine[i].latest.timestamp != JSON.parse(res).thread[0].timestamp) {
                getThread(magazine[i].id);
            };
        });
    };
};

function getThread(id) {
    get(`/v2/permanents/${keys.deviceIden}_thread_${id}`)
    .then( res => {
        let thread = JSON.parse(res);
        fs.writeFileSync(path.join(__dirname, 'db', 'threads', `${id}.json`), res);
        if (id == currentThread.id) { postThread(id) };
    }).catch( e => { console.log(e) });
};

function postMagazine() {
    let avatar;
    sideBar.innerHTML = '';
    for (let i = 0; i < magazine.length; i++) {
        if (fs.existsSync(path.join(__dirname, 'db', 'avatars', `${magazine[i].id}.jpg`))) {
            avatar = path.join(__dirname, 'db', 'avatars', `${magazine[i].id}.jpg`);
        } else {
            avatar = './assets/generic_avatar.png';
        };
        sideBar.innerHTML += `
            <div class="leader" onclick="postThread(${magazine[i].id})">
                <img src="${avatar}" class="avatar">
                <p class="name">${magazine[i].recipients[0].name}</p>
                <p>${magazine[i].latest.body}</p>
            </div>
            <hr/>
        `
    };
    if (bulk.innerHTML == '') { postThread(magazine[0].id) };
}

function postThread(id) {
    currentThread = magazine.find(x => x.id == id);
    fs.readFile(path.join(__dirname, 'db', 'threads', `${id}.json`), 'utf8', (err, res) => {
        if (err) { getThread() };
        let thread = JSON.parse(res).thread;
        bulk.innerHTML = '';
        for (let i = thread.length-1; i >= 0; i--) {
            bulk.innerHTML += `<p class="${thread[i].direction}">${thread[i].body}</p>`
        };
        bulk.scrollTop = bulk.scrollHeight;
    });
};

function openWebSocket() {
    const websocket = new WebSocket('wss://stream.pushbullet.com/websocket/' + keys.token);
    websocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.push && data.push.type == 'sms_changed') {
            getMagazine();
            if (data.push.notifications && data.push.notifications[0]) {
                new Notification(data.push.notifications[0].title, {
                    body: data.push.notifications[0].body
                });
            };
        };
    };
};

function send(body) {
    let payload = JSON.stringify({
        push: {
                conversation_iden: currentThread.recipients[0].number,
                message: body,
                package_name: "com.pushbullet.android",
                source_user_iden: keys.iden,
                target_device_iden: keys.deviceIden,
                type: "messaging_extension_reply"
            },
        type: "push"
    });
    post(payload, '/v2/ephemerals')
    .then( res => { console.log(res) })
    .catch( e => { console.log(e) });
};