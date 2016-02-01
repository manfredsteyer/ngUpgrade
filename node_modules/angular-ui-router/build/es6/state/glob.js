export class Glob {
    constructor(text) {
        this.text = text;
        this.glob = text.split('.');
    }
    matches(name) {
        let segments = name.split('.');
        for (let i = 0, l = this.glob.length; i < l; i++) {
            if (this.glob[i] === '*')
                segments[i] = '*';
        }
        if (this.glob[0] === '**') {
            segments = segments.slice(segments.indexOf(this.glob[1]));
            segments.unshift('**');
        }
        if (this.glob[this.glob.length - 1] === '**') {
            segments.splice(segments.indexOf(this.glob[this.glob.length - 2]) + 1, Number.MAX_VALUE);
            segments.push('**');
        }
        if (this.glob.length != segments.length)
            return false;
        return segments.join('') === this.glob.join('');
    }
    static is(text) {
        return text.indexOf('*') > -1;
    }
    static fromString(text) {
        if (!this.is(text))
            return null;
        return new Glob(text);
    }
}
//# sourceMappingURL=glob.js.map