class Normalize {
    static width(w: number) {
        return Math.abs(w - 3) < Math.abs(w - 15) ? 3 : 15;
    }

    static distance(d: number) {
        return Math.abs(d - 30) < Math.abs(d - 150) ? 30 : 150;
    }

    static difficulty(w: number, d: number) {
        const width = this.width(w);
        const distance = this.distance(d);
        if (width === 3) return distance === 30 ? 3.5 : 5.7;
        return distance === 30 ? 1.6 : 3.5;
    }
}

export { Normalize };
