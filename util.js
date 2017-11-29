class Wait {
    constructor(count, callback) {
        this.count = count;
        this.callback = callback;
    };
  
    done() {
        this.count--;
        if (this.count == 0) {
            this.callback();
        };
    };
};

function get(path, hostname, encoding) {
    return new Promise( (resolve, reject) => {
        let options = {
            hostname: hostname || 'api.pushbullet.com',
            path: path,
            headers: {
                'Access-Token': keys.token,
                'Content-Type': 'application/json'
            }
        };
        let temp = '';
        req = https.request(options, (res) => {
            if ( res.statusCode != 200 ) { reject( res.statusCode + " on " + path ) };
            if (encoding) { res.setEncoding(encoding) };
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

exports.Wait = Wait;
exports.get = get;
exports.post = post;