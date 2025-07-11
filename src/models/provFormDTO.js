class provFormDTO { 
    constructor({nombre, activo, cuil, telefono, email, ref, nombreReferencia, razonSocial, rubro}) { 
        this.nombre = String(nombre);   
        this.ref = String(ref);
        this.telefono = String(telefono);
        this.email = email;
        this.nombreReferencia = String(nombreReferencia);
        this.razonSocial = String(razonSocial);
        this.cuil = String(cuil);
        this.rubro = String(rubro);
        this.activo = Boolean(activo);
    }
}

export default provFormDTO;