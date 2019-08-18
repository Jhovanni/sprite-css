export class Coord {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export class Bloque {
    image: HTMLImageElement;
    name: string;
    dimension: Coord;
    posicion: Coord;
    constructor(image: HTMLImageElement) {
        this.image = image;
        this.name = image.name.split(".")[0].replace(/\W/g, '-');
        this.dimension = new Coord(image.width, image.height);
    }
}