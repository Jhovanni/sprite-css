import {RenderInstruction, ValidateResult} from "aurelia-validation";

export class BootstrapFormRenderer {
    render(instruccion: RenderInstruction) {
        for (let {result, elements} of instruccion.unrender) {
            for (let element of elements) {
                this.quitarMensajeError(element, result);
            }
        }

        for (let {result, elements} of instruccion.render) {
            for (let element of elements) {
                this.agregarMensajeError(element, result);
            }
        }
    }

    private agregarMensajeError(elemento: Element, resultado: ValidateResult) {
        if (resultado.valid) {
            return;
        }

        const formGroup = elemento.closest('.form-group');
        if (!formGroup) {
            return;
        }
        const input = formGroup.querySelector("input");
        input.classList.add(('is-invalid'));

        // agregar span de ayuda
        const message = document.createElement('small');
        message.className = 'invalid-feedback';
        message.textContent = resultado.message;
        message.id = `validation-message-${resultado.id}`;
        formGroup.appendChild(message);
    }

    private quitarMensajeError(elemento: Element, resultado: ValidateResult) {
        if (resultado.valid) {
            return;
        }

        const formGroup = elemento.closest('.form-group');
        if (!formGroup) {
            return;
        }

        // quitar span de ayuda
        const message = formGroup.querySelector(`#validation-message-${resultado.id}`);
        if (message) {
            formGroup.removeChild(message);

            // quitar clase is-invalid si no hay error de validacion
            if (formGroup.querySelectorAll('.help-block.validation-message').length === 0) {
                const input = formGroup.querySelector("input");
                input.classList.remove(('is-invalid'));
            }
        }
    }
}