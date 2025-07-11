class userDTO { 
    constructor({id, nombre, apellido, telefono, cargo, email, cumpleanos, password, googleAuth}) { 
        this.id = Number(id);
        this.nombre = String(nombre);   
        this.apellido = String(apellido);
        this.telefono = String(telefono);
        this.password = password
        this.cargo = String(cargo);
        this.email = email;
        this.cumpleanos = new Date(cumpleanos).toISOString().split("T")[0];
    }
    static fromJson(data) { 
        console.log(new userDTO(data));
        return new userDTO(data); 
    }
}

export default userDTO;