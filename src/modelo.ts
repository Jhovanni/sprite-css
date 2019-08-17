export class Bloque {
    image: HTMLImageElement;
    name: string;
    w: number;
    h: number;
    fit: Nodo;
    constructor(image: HTMLImageElement) {
        this.image = image;
        this.name = image.name.split(".")[0].replace(/\W/g, '-');
        this.w = image.width;
        this.h = image.height;
    }
}
export class Nodo {
    x: number;
    y: number;
    h: number;
    w: number;
    right: Nodo;
    down: Nodo;
    used = false;
    constructor(x: number, y: number, h: number, w: number) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
    }
}