class GamePath {
    constructor(map, Collection) {
        this.map = map;
        this.Collection = Collection;
    }

    distance([x, y], end) {
        return (x - end[0]) ** 2 + (y - end[1]) ** 2;
    }

    async find(start, end) {
        let map = this.map.slice();

        let collection = new this.Collection([start], (a, b) => (this.distance(a, end) - this.distance(b, end)));

        container.children[end[1] * 100 + end[0]].classList.add('red');

        async function insert([x, y], pre) {
            if (map[y * 100 + x] !== 0) {
                return;
            }
            if (x < 0 || y < 0 || x >= 100 || y >= 100) {
                return;
            }
            map[y * 100 + x] = pre;
            container.children[y * 100 + x].classList.add('lightgreen');

            await sleep(1);
            collection.insert([x, y]);
        }

        while (collection.length > 0) {
            let [x, y] = collection.take();

            if (x === end[0] && y === end[1]) {
                let path = [];
                while (x !== start[0] || y !== start[1]) {
                    path.push([x, y]);
                    container.children[y * 100 + x].classList.add('pink');

                    [x, y] = map[y * 100 + x];
                }
                container.children[start[1] * 100 + start[0]].classList.add('pink');

                return path;
            }

            await insert([x - 1, y], [x, y]);
            await insert([x + 1, y], [x, y]);
            await insert([x, y - 1], [x, y]);
            await insert([x, y + 1], [x, y]);

            await insert([x - 1, y - 1], [x, y]);
            await insert([x + 1, y - 1], [x, y]);
            await insert([x - 1, y + 1], [x, y]);
            await insert([x + 1, y + 1], [x, y]);
        }
        return null;
    }
}