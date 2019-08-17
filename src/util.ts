export function cargarImagenes(archivos: FileList): Promise<HTMLImageElement[]> {
    var promesas = [];
    for (var i = 0; i < archivos.length; i++) {
        promesas.push(cargarImagen(archivos.item(i)));
    }
    return Promise.all(promesas);
}

export function cargarImagen(archivo: File): Promise<HTMLImageElement> {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        var reader = new FileReader();
        reader.onload = () => {
            image.src = reader.result;
        }
        image.onload = () => {
            image.name = archivo.name;
            resolve(image);
        }
        image.onerror = error => {
            reject("Problema al crear imagen " + archivo.name + "\n. Error es: " + JSON.stringify(error));
        };
        reader.onerror = error => {
            reject("Problema al leer archivo " + archivo.name + "\n. Error es: " + JSON.stringify(error));
        };
        reader.readAsDataURL(archivo);
    });
}

export function porcentage(posicion: number, dimensionContenedor: number, dimensionImagen: number): number {
    var diferencia = dimensionContenedor - dimensionImagen;
    if (diferencia === 0) {
        return 0;
    }
    return posicion / diferencia * 100;
}
export function colorAleatorio(opacidad?: number): string {
    var opacidadHex = "ff";
    if (opacidad && opacidad <= 1 && opacidad >= 0) {
        opacidadHex = Math.floor(opacidad * 256).toString(16);
        if (opacidadHex.length < 2) {
            opacidadHex = "00".substr(0, 2 - opacidadHex.length) + opacidadHex;
        }
    }
    var colorHex = Math.floor(Math.random() * 16777215).toString(16);
    if (colorHex.length < 6) {
        colorHex = "000000".substr(0, 6 - colorHex.length) + colorHex;
    }
    return "#".concat(colorHex).concat(opacidadHex);
}