import {autoinject, TaskQueue} from 'aurelia-framework';
import {validateTrigger, ValidationController, ValidationRules} from "aurelia-validation";
import * as SVG from "svg.js";
import {BootstrapFormRenderer} from "./bootstrapFormRenderer";
import {BloqueImagen} from "./modelo";
import {GrowingPacker} from "./packerGrowing";
import {cargarImagenes, colorAleatorio, porcentage, descargarComoArchivo, copiarAlPortapapeles} from "./util";


@autoinject
export class App {
    private claseBase: string = "sprite-";
    private prefijo: string = "sprite-";
    private archivos: FileList;

    private cssGenerado: string;
    private ejemplo = "";
    private ejemploVertical = "";

    private packer: GrowingPacker<BloqueImagen>;

    private taskqeue: TaskQueue;
    private validationController: ValidationController;
    constructor(taskqeue: TaskQueue,
        validationController: ValidationController) {
        this.taskqeue = taskqeue;
        this.validationController = validationController;
        this.validationController.addRenderer(new BootstrapFormRenderer());
        this.validationController.validateTrigger = validateTrigger.changeOrBlur;
    }
    attached(): void {
        ValidationRules
            .ensure((s: App) => s.claseBase)
            .required().withMessage(`Clase base requerida`)
            .matches(/^[a-zA-Z_].*$/).withMessage(`Debe de empezar con alguna letra o guión bajo`)
            .matches(/^(?!__).*$/).withMessage(`No puede empezar con dos guiones bajos`)
            .matches(/^[a-zA-Z0-9_-]*$/).withMessage(`Sólo puede contener letras, numeros o guiones`)
            .ensure((s: App) => s.prefijo)
            .required().withMessage(`Prefijo requerido`)
            .matches(/^[a-zA-Z_].*$/).withMessage(`Debe de empezar con alguna letra o guión bajo`)
            .matches(/^(?!__).*$/).withMessage(`No puede empezar con dos guiones bajos`)
            .matches(/^[a-zA-Z0-9_-]*$/).withMessage(`Sólo puede contener letras, numeros o guiones`)
            .ensure((s: App) => s.archivos)
            .required().withMessage(`Selecciona imágenes`)
            .on(this);
    }
    procesar(): void {
        this.validationController.validate().then(result => {
            if (result.valid) {
                this.generar();
            }
        });
    }
    private generar(): void {
        this.cargarBloques().then((bloques) => {
            this.packer = new GrowingPacker(bloques);
            this.packer.acomodar();
            this.dibujarImagenes();
            this.generarCss();
            this.taskqeue.queueMicroTask(() => {
                document.getElementById("divGenerado").scrollIntoView({behavior: "smooth", block: "start"});
            });
        })
    }
    private async cargarBloques(): Promise<BloqueImagen[]> {
        let imagenes = await cargarImagenes(this.archivos);
        return imagenes.map(imagen => new BloqueImagen(imagen));
    }
    private dibujarImagenes() {
        if (this.archivos === undefined || this.archivos.length <= 0) {
            console.log("Imagenes requeridas");
            return;
        }
        var areaDibujo = document.getElementById("dibujo");
        areaDibujo.innerText = "";

        var dibujo = SVG(areaDibujo).size(this.packer.dimension.x, this.packer.dimension.y);
        dibujo.viewbox(0, 0, this.packer.dimension.x, this.packer.dimension.y);
        dibujo.addClass("img-fluid");
        dibujo.addClass("center-block");
        var mouseover = function () {
            this.fill({opacity: 1});
        }
        var mouseout = function () {
            this.fill({opacity: .1});
        }
        for (var i = 0; i < this.packer.bloques.length; i++) {
            var bloque = this.packer.bloques[i];
            if (bloque.posicion) {
                var rec = dibujo.rect(bloque.dimension.x, bloque.dimension.y).move(bloque.posicion.x, bloque.posicion.y).fill({color: colorAleatorio(), opacity: .1}).stroke("#000000");
                dibujo.image(bloque.imagen.src).move(bloque.posicion.x, bloque.posicion.y).style("pointer-events", "none");
                rec.on("mouseover", mouseover);
                rec.on("mouseout", mouseout);
                dibujo.plain((i + 1).toString()).move(bloque.posicion.x, bloque.posicion.y).font({size: 24, family: "Georgia"}).fill("#000000");
            }
        }
    }
    private generarCss(): void {
        this.packer.bloques.sort((a, b) => {
            var an = a.nombre.toLowerCase();
            var bn = b.nombre.toLowerCase();
            if (an > bn) {
                return 1;
            } else if (an < bn) {
                return -1;
            } else {
                return 0;
            }
        });
        const anchoTotal = this.packer.dimension.x, altoTotal = this.packer.dimension.y;
        const reglaBase = ".".concat(this.claseBase, " { width: 100%; height: auto; display: inline-block; background-size: 0%; background-image: url(", this.claseBase, ".png);}\n");
        const ajuste = "svg.".concat(this.claseBase, ".vertical, img.", this.claseBase, ".vertical{ height: 100%!important; width: auto!important; padding-top: 0!important;}\n");
        let css = reglaBase + ajuste;
        this.packer.bloques.forEach(bloque => {
            if (bloque.posicion) {
                var posX = porcentage(bloque.posicion.x, anchoTotal, bloque.dimension.x);
                var posY = porcentage(bloque.posicion.y, altoTotal, bloque.dimension.y);
                var sizeX = anchoTotal / bloque.dimension.x * 100;
                var sizeY = altoTotal / bloque.dimension.y * 100;
                var relacionAspecto = bloque.dimension.y / bloque.dimension.x * 100;
                var regla = ".".concat(this.claseBase, ".", this.prefijo, bloque.nombre, " { padding-top: ", relacionAspecto.toString(), "%; background-position: ", posX.toString(), "% ", posY.toString(), "%; background-size: ", sizeX.toString(), "% ", sizeY.toString(), "%;}\n");
                css += regla;
            }
        });
        this.ejemplo = "&lt;span class=&quot;" + this.claseBase + " " + this.prefijo + this.packer.bloques[0].nombre + "&quot;&gt;&lt;&#x2F;span&gt;";
        this.ejemploVertical = "&lt;svg viewBox=&quot;0 0 100 150&quot; class=&quot;" + this.claseBase + " " + this.prefijo + this.packer.bloques[0].nombre + " vertical&quot;&gt;&lt;&#x2F;svg&gt;";
        this.cssGenerado = css;
    }

    descargarSpriteSheet() {
        if (this.packer != null && this.packer.bloques !== null) {
            const canvas = this.dibujarEnNuevoCanvas();
            const contenido = canvas.toDataURL("image/png");
            descargarComoArchivo(contenido, "sprites.png", document);
        }
    }
    private dibujarEnNuevoCanvas(): HTMLCanvasElement {
        var canvas = document.createElement("canvas");
        canvas.width = this.packer.dimension.x;
        canvas.height = this.packer.dimension.y;
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < this.packer.bloques.length; i++) {
            var bloque = this.packer.bloques[i];
            if (bloque.posicion
            ) {
                ctx.drawImage(bloque.imagen, bloque.posicion.x, bloque.posicion.y);
            }
        }
        return canvas;
    }
    copiarTextoCSS(): void {
        if (this.cssGenerado !== null) {
            copiarAlPortapapeles(this.cssGenerado, document);
        }
    }
    descargarTextoCSS(): void {
        if (this.cssGenerado !== null) {
            const contenido = "data:text/plain;charset=utf-8," + encodeURIComponent(this.cssGenerado);
            descargarComoArchivo(contenido, "sprite.css", document);
        }
    }


}