import { createContext, useContext, useState } from "react";
//para configuraciones globales
const globalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [tema, setTema] = useState("light"); // Ejemplo de variable global
  const [idioma, setIdioma] = useState("es");

  return (
    <globalContext.Provider value={{ tema, setTema, idioma, setIdioma }}>
      {children}
    </globalContext.Provider>
  );
};

export const useGlobal = () => useContext(globalContext);
