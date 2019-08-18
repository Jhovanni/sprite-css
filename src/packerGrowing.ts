/******************************************************************************
 
 This is a binary tree based bin packing algorithm that is more complex than
 the simple Packer (packer.js). Instead of starting off with a fixed width and
 height, it starts with the width and height of the first block passed and then
 grows as necessary to accomodate each subsequent block. As it grows it attempts
 to maintain a roughly square ratio by making 'smart' choices about whether to
 grow right or down.
 
 When growing, the algorithm can only grow to the right OR down. Therefore, if
 the new block is BOTH wider and taller than the current target then it will be
 rejected. This makes it very important to initialize with a sensible starting
 width and height. If you are providing sorted input (largest first) then this
 will not be an issue.
 
 A potential way to solve this limitation would be to allow growth in BOTH
 directions at once, but this requires maintaining a more complex tree
 with 3 children (down, right and center) and that complexity can be avoided
 by simply chosing a sensible starting block.
 
 Best results occur when the input blocks are sorted by height, or even better
 when sorted by max(width,height).
 
 Inputs:
 ------
 
 blocks: array of any objects that have .w and .h attributes
 
 Outputs:
 -------
 
 marks each block that fits with a .fit attribute pointing to a
 node with .x and .y coordinates
 
 Example:
 -------
 
 var blocks = [
 { w: 100, h: 100 },
 { w: 100, h: 100 },
 { w:  80, h:  80 },
 { w:  80, h:  80 },
 etc
 etc
 ];
 
 var packer = new GrowingPacker();
 packer.fit(blocks);
 
 for(var n = 0 ; n < blocks.length ; n++) {
 var block = blocks[n];
 if (block.fit) {
 Draw(block.fit.x, block.fit.y, block.w, block.h);
 }
 }
 
 
 ******************************************************************************/
import {Bloque, Coord} from "./modelo";

export class GrowingPacker<T extends Bloque> {
    private raiz: Nodo;
    dimension: Coord;
    bloques: T[];
    constructor(bloques: T[]) {
        this.bloques = bloques
    };
    acomodar() {
        this.bloques.sort((a, b) => {
            return (b.dimension.x + b.dimension.y) - (a.dimension.x + a.dimension.y);
        });
        var cantidad = this.bloques.length;
        var anchoRaiz = cantidad > 0 ? this.bloques[0].dimension.x : 0;
        var altoRaiz = cantidad > 0 ? this.bloques[0].dimension.y : 0;
        this.raiz = <Nodo> {posX: 0, posY: 0, ancho: anchoRaiz, alto: altoRaiz};

        this.bloques.forEach(bloque => {
            var nodo = this.encontrarNodo(this.raiz, bloque.dimension);

            let nodoParaBloque = null;
            if (nodo) {
                nodoParaBloque = this.dividirNodo(nodo, bloque.dimension);
            } else {
                nodoParaBloque = this.crecerNodo(bloque.dimension);
            }
            bloque.posicion = new Coord(nodoParaBloque.posX, nodoParaBloque.posY);
        });
        this.dimension = new Coord(this.raiz.ancho, this.raiz.alto);
    }

    private encontrarNodo(raiz: Nodo, dimension: Coord): Nodo {
        if (raiz.usado)
            return this.encontrarNodo(raiz.derecha, dimension) || this.encontrarNodo(raiz.abajo, dimension);
        else if ((dimension.x <= raiz.ancho) && (dimension.y <= raiz.alto))
            return raiz;
        else
            return null;
    }

    private dividirNodo(nodo: Nodo, dimension: Coord): Nodo {
        nodo.usado = true;
        nodo.abajo = <Nodo> {posX: nodo.posX, posY: nodo.posY + dimension.y, ancho: nodo.ancho, alto: nodo.alto - dimension.y};
        nodo.derecha = <Nodo> {posX: nodo.posX + dimension.x, posY: nodo.posY, ancho: nodo.ancho - dimension.x, alto: dimension.y};
        return nodo;
    }

    private crecerNodo(dimension: Coord): Nodo {
        var puedeCrecerAbajo = (dimension.x <= this.raiz.ancho);
        var puedeCrecerDerecha = (dimension.y <= this.raiz.alto);

        var debeCrecerAbajo = puedeCrecerDerecha && (this.raiz.alto >= (this.raiz.ancho + dimension.x)); // attempt to keep square-ish by growing right when height is much greater than width
        var debeCrecerDerecha = puedeCrecerAbajo && (this.raiz.ancho >= (this.raiz.alto + dimension.y)); // attempt to keep square-ish by growing down  when width  is much greater than height

        if (debeCrecerAbajo)
            return this.crecerDerecha(dimension);
        else if (debeCrecerDerecha)
            return this.crecerBajo(dimension);
        else if (puedeCrecerDerecha)
            return this.crecerDerecha(dimension);
        else if (puedeCrecerAbajo)
            return this.crecerBajo(dimension);
        else
            return null; // need to ensure sensible root starting size to avoid this happening
    }

    private crecerDerecha(dimension: Coord): Nodo {
        this.raiz = <Nodo> {
            usado: true,
            posX: 0,
            posY: 0,
            ancho: this.raiz.ancho + dimension.x,
            alto: this.raiz.alto,
            abajo: this.raiz,
            derecha: {posX: this.raiz.ancho, posY: 0, ancho: dimension.x, alto: this.raiz.alto}
        };
        var nodo = this.encontrarNodo(this.raiz, dimension);
        if (nodo)
            return this.dividirNodo(nodo, dimension);
        else
            return null;
    }

    private crecerBajo(dimension: Coord): Nodo {
        this.raiz = <Nodo> {
            usado: true,
            posX: 0,
            posY: 0,
            ancho: this.raiz.ancho,
            alto: this.raiz.alto + dimension.y,
            abajo: {posX: 0, posY: this.raiz.alto, ancho: this.raiz.ancho, alto: dimension.y},
            derecha: this.raiz
        };
        var nodo = this.encontrarNodo(this.raiz, dimension);
        if (nodo)
            return this.dividirNodo(nodo, dimension);
        else
            return null;
    }

};
class Nodo {
    posX: number;
    posY: number;
    ancho: number;
    alto: number;
    derecha: Nodo;
    abajo: Nodo;
    usado = false;
    constructor({posX, posY, alto, ancho}: {posX: number; posY: number; alto: number; ancho: number;}) {
        this.posX = posX;
        this.posY = posY;
        this.alto = alto;
        this.ancho = ancho;
    }
}