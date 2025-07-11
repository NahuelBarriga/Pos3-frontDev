class clienteDTO { 
    constructor({nombre, password, telefono, email, cumpleanos}) { 
        this.nombre = String(nombre);   
        this.password = String(password);
        this.telefono = Number(telefono);
        this.email = String(email);
        this.cumpleanos = new Date(cumpleanos).toISOString();
        this.cargo = 'cliente';
    }
}

export default clienteDTO;