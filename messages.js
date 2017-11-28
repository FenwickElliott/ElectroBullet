const https = require('https');
const fs = require('fs');
const path = require('path');
const get = require('./util').get;

let keys;
let magazine;
let currentThread;

fs.readFile(path.join(__dirname, 'db', 'keys.json'), 'utf8', (err, res) => {
    if (err) { throw e };
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
        getImages();
        fs.writeFileSync(path.join(__dirname, 'db', 'magazine.json'), res);
    }).catch( e => { throw e });
};

function getImages() {
    magazine.forEach( thread => {
        thread.recipients[0].image_url
    })
    for (let i = 0; i < magazine.length; i++) {
        if (magazine[i].recipients[0].image_url && ! fs.existsSync(path.join(__dirname, 'db', 'images', `${magazine[i].id}.jpg`))) {
            get(magazine[i].recipients[0].image_url, 'dl2.pushbulletusercontent.com', 'binary')
            .then( res => {
                fs.writeFile(path.join(__dirname, 'db', 'images', `${magazine[i].id}.jpg`), res, 'binary');
            })
            .catch( (e) => { throw e });
        };
    };
};

function updateThreads() {
    magazine.forEach( thread => {
        fs.readFile(path.join(__dirname, 'db', 'threads', `${thread.id}.json`), 'utf8', (err, res) => {
            if (err || thread.latest.timestamp != JSON.parse(res).thread[0].timestamp) {
                getThread(thread.id);
            };
        });
    });
};

function getThread(id) {
    get(`/v2/permanents/${keys.deviceIden}_thread_${id}`)
    .then( res => {
        let thread = JSON.parse(res);
        fs.writeFileSync(path.join(__dirname, 'db', 'threads', `${id}.json`), res);
    }).catch( e => { throw e });
};

function postMagazine() {
    sideBar.innerHTML = '';
    for (let i = 0; i < magazine.length; i++) {
        sideBar.innerHTML += `
            <div class="leader" onclick="postThread(${magazine[i].id})">
                <img src="./assets/generic_avitar.png" class="avitar">
                <p class="name">${magazine[i].recipients[0].name}</p>
                <p>${magazine[i].latest.body}</p>
            </div>
            <hr/>
        `
    };
    if (bulk.innerHTML == '') { postThread(magazine[0].id) };
}

function postThread(id) {
    currentThread = id;
    fs.readFile(path.join(__dirname, 'db', 'threads', `${id}.json`), 'utf8', (err, res) => {
        if (err) { getThread };
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
        if (data.push && data.push.notifications) {
            getMagazine();
            new Notification(data.push.notifications[0].title, {
                body: data.push.notifications[0].body
            });
        };
    };
};

function currentRecipient() {
    for (let i = 0; i < magazine.length; i++) {
        if (magazine[i].id == currentThread) {
            return magazine[i].recipients[0].address;
        };
    };
};

function send(body) {
    let recipient = currentRecipient();
    options.path = '/v2/ephemerals';
    options.method = 'POST';
    let payload = JSON.stringify({
        push: {
                conversation_iden: recipient,
                message: body,
                package_name: "com.pushbullet.android",
                source_user_iden: keys.iden,
                target_device_iden: keys.deviceIden,
                type: "messaging_extension_reply"
            },
        type: "push"
    });

    let req = https.request(options, (res) => { });
    req.on('error', (e) => { throw e });
    req.write(payload);
    req.end();
    return false;
};