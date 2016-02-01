export class Queue {
    constructor(_items = []) {
        this._items = _items;
    }
    enqueue(item) {
        this._items.push(item);
        return item;
    }
    dequeue() {
        if (this.size())
            return this._items.splice(0, 1)[0];
    }
    clear() {
        var current = this._items;
        this._items = [];
        return current;
    }
    size() {
        return this._items.length;
    }
    remove(item) {
        var idx = this._items.indexOf(item);
        return idx > -1 && this._items.splice(idx, 1)[0];
    }
    peekTail() {
        return this._items[this._items.length - 1];
    }
    peekHead() {
        if (this.size())
            return this._items[0];
    }
}
//# sourceMappingURL=queue.js.map