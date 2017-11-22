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

exports.Wait = Wait;