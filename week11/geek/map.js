class GameMap {
    constructor(id) {
        this.el = document.getElementById(id);
        this._map = [];
        this._mouse = false;
        this._clear = false;
        this.init();
    }

    init() {
        this.draw();
        this.bindMouseEvents();
    }

    draw() {
        this._map = this._getMap();

        for (let y = 0; y < 100; y++) {
            for (let x = 0; x < 100; x++) {
                let cell = document.createElement('div');
                cell.classList.add('cell');
        
                if (this._map[y * 100 + x] === 1) {
                    cell.classList.add('selected');
                }
        
                cell.addEventListener('mousemove', () => {
                    if (this._mouse) {
                        if (this._clear) {
                            cell.classList.remove('selected');
                            this.map[y * 100 + x] = 0;
                        } else {
                            cell.classList.add('selected');
                            this.map[y * 100 + x] = 1;
                        }
                    }
                });
        
                container.appendChild(cell);
            }
        }

    }

    bindMouseEvents() {
        document.addEventListener('mousedown', e => {
            this._mouse = true;
            this._clear = (e.which === 3);
        });
        
        document.addEventListener('mouseup', () => {
            this._mouse = false;
        });
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    save() {
        localStorage.map = JSON.stringify(this._map);
        alert('保存成功！');
    }

    clear() {
        localStorage.map = '';
        this._map = new Array(10000).fill(0);
        this.el.innerHTML = "";
        this.draw();
        alert('清除缓存成功！');
    }

    _getMap() {
        return localStorage.map ? JSON.parse(localStorage.map) : new Array(10000).fill(0);
    }

    get map() {
        return this._map;
    }
}