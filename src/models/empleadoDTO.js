class empleadoDTO { 
    constructor({nombre, password, telefono, cargo, email, cumpleanos}) { 
        this.nombre = String(nombre);   
        this.password = String(password);
        this.telefono = Number(telefono);
        this.cargo = String(cargo);
        this.email = String(email);
        this.cumpleanos = new Date(cumpleanos).toISOString();
    }
}

module.exports = empleadoDTO;