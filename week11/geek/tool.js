function sleep(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

class Sorted {
    constructor(data, comparator) {
        this.data = data;
        this.comparator = comparator;
    }

    take() {
        if (this.data.length <= 0) {
            return;
        }

        let min = this.data[0];
        let minIndex = 0;
        for (let i = 0; i < this.data.length; i++) {
            if (this.comparator(this.data[i], min) < 0) {
                min = this.data[i];
                minIndex = i;
            }
        }
        this.data[minIndex] = this.data[this.data.length - 1];
        this.data.pop();
        return min;
    }

    insert(v) {
        this.data.push(v);
    }

    get length() {
        return this.data.length;
    }
}

class BinaryHeap {
    constructor(data, comparator) {
        this.data = data;
        this.comparator = comparator;
    }

    take() {
        if (!this.data.length) {
            return;
        }

        let min = this.data[0];
        let i = 0;
        while (i < this.data.length) {
            if (i * 2 + 1 >= this.data.length) {
                break;
            }
            if (i * 2 + 2 >= this.data.length) {
                this.data[i] = this.data[i * 2 + 1];
                i = i * 2 + 1;
                break;
            }
            if (this.comparator(this.data[i * 2 + 1], this.data[i * 2 + 2]) < 0) {
                this.data[i] = this.data[i * 2 + 1];
                i = i * 2 + 1;
            } else {
                this.data[i] = this.data[i * 2 + 2];
                i = i * 2 + 2;
            }
        }

        if (i < this.data.length - 1) {
            this.insertAt(i, this.data.pop());
        } else {
            this.data.pop();
        }
        return min;
    }

    insertAt(i, v) {
        if (i < 0) {
            return;
        }
        this.data[i] = v;
        while (i > 0 && this.comparator(v, this.data[Math.floor((i - 1) / 2)]) < 0) {
            this.data[i] = this.data[Math.floor((i - 1) / 2)];
            this.data[Math.floor((i - 1) / 2)] = v;
            i = Math.floor((i - 1) / 2);
        }
    }

    insert(v) {
        this.insertAt(this.data.length, v);
    }

    get length() {
        return this.data.length;
    }
}