export default class Grid {

    constructor(width, height) {
        this._width = width;
        this._height = height;
    }

    width() {
        return this._width;
    }

    height() {
        return this._height;
    }

    size(){
        return this.width() * this.height();
    }

    index(x, y) {
        const width = this.width();
        const height = this.height();
        const index = x + width * y;
        if (this.inGrid(index) && x >= 0 && y >= 0 && x < width && y < height) {
            return index;
        }
        return -1;
    }

    coord(index){
        const width = this.width();
        const height = this.height();
        return {
            x: index % width,
            y: Math.floor((index / width) % height)
        }
    }

    inGrid(index) {
        if (index < 0 || index >= this._width * this._height) {
            return false;
        }

        return true;
    }

}