export class Coord {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export class Bloque {
    dimension: Coord;
    posicion: Coord;
}
export class BloqueImagen extends Bloque {
    imagen: HTMLImageElement;
    nombre: string;
    constructor(image: HTMLImageElement) {
        super();
        this.imagen = image;
        this.nombre = image.name.split(".")[0].replace(/\W/g, '-');
        this.dimension = new Coord(image.width, image.height);
    }
}