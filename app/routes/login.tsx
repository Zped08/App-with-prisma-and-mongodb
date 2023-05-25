import { useState } from "react";
import Layout from "./components/Layout";
import FormField from "./components/form-field";

export default function login() {
  const [action, setAction] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //  se encargará de actualizar el estado formData
  // recibe dos argumentos
  const handleInputChange = (
    // evento de cambio de entrada
    event: React.ChangeEvent<HTMLInputElement>,
    //clave del campo que se va a actualizar en formData
    field: string
  ) => {
    //actualiza el estado de formData mediante
    // la función de actualización pasada como argumento
    setFormData((form) => ({ ...form, [field]: event.target.value }));
    //(form)función de actualización del estado que se pasa a setFormData
    // setFormData realiza una copia utilizando el operador spread (...form)
    //La función de actualización toma el estado actual de formData (form en este caso)
    // realiza una copia del mismo utilizando el operador spread (...form)
    //y luego reemplaza el valor del campo especificado
    //([field]) con el nuevo valor del evento (event.target.value)
  };

  return (
    <Layout>
      <div className="h-screen flex justify-center items-center flex-col gap-y-4">
        <button
          onClick={() => setAction(action == "login" ? "register" : "login")}
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === "login" ? "Sign Up" : "Sign In"}
        </button>
       {/* mostrar un mensaje diferente en cada formulario: */}
        <p className="font-semibold text-slate-300">
          {action === "login"
            ? "Log In To Give Some Praise!"
            : "Sign Up To Get Started!"}
        </p>
        <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />
          <div className="w-full text-center">
            <input
              type="submit"
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
              value="Sign In"
            />
          </div>
        </form>
      </div>
    </Layout>
  );
}
