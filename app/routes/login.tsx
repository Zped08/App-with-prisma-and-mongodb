import { useRef, useEffect } from 'react'
import { useState } from "react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useActionData } from '@remix-run/react'
import Layout from "../components/Layout";
import FormField from "../components/form-field";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/utils/validators.server";
import {register, login, getUser} from "../utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect('/') : null
}


// función de acción asincrónica que se ejecuta cuando se realiza una solicitud a la ruta correspondiente.
//Extrae los datos del formulario del objeto Request.
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("_action");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");
  

  if (
    typeof action !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  if (
    action === "register" &&
    (typeof firstName !== "string" || typeof lastName !== "string")
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }
  

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === "register"
      ? {
          firstName: validateName((firstName as string) || ""),
          lastName: validateName((lastName as string) || ""),
        }
      : {}),
  };

  
  // Se verifica si hay errores en la validación, revisando los valores del objeto errors. Si algún error existe, se
  //devuelve una respuesta JSON con los errores, los campos del formulario y
  // la acción, junto con el estado HTTP 400 (Bad Request).

  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 400 }
    );

      switch (action) {
    case 'login': {
        return await login({ email, password })
    }
    case 'register': {
        firstName = firstName as string
        lastName = lastName as string
        return await register({ email, password, firstName, lastName })
    }
    default:
        return json({ error: `Invalid Form Data` }, { status: 400 });
  }
};

export default function Login() {
  const actionData = useActionData()
  const firstLoad = useRef(true)
  const [action, setAction] = useState("login");
/*   const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  }); */
  // 2
  const [errors, setErrors] = useState(actionData?.errors || {})
  const [formError, setFormError] = useState(actionData?.error || '')
  // 3
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
    firstName: actionData?.fields?.lastName || '',
    lastName: actionData?.fields?.firstName || '',
  })

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

    useEffect(() => {
    if (!firstLoad.current) {
      const newState = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      }
      setErrors(newState)
      setFormError('')
      setFormData(newState)
    }
  }, [action])

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError('')
    }
  }, [formData])

  useEffect(() => { firstLoad.current = false }, [])

  return (
    <Layout>
      <div className="h-screen flex justify-center items-center flex-col gap-y-4">
        <h2 className="text-5xl font-extrabold text-yellow-300">
          Welcome to Kudos!
        </h2>
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
           <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div>
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
            error={errors?.email}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
            error={errors?.password}
          />
          {/*  campos que se representan condicionalmente en función de si está 
          viendo el formulario de inicio de sesión o de registro. */}
          {action === "register" && (
            <>
              <FormField
                htmlFor="firstName"
                label="First Name"
                onChange={(e) => handleInputChange(e, "firstName")}
                value={formData.firstName}
                error={errors?.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                onChange={(e) => handleInputChange(e, "lastName")}
                value={formData.lastName}
                error={errors?.lastName}
              />
            </>
          )}

          <div className="w-full text-center">
            {/*  El valor se establece en cualquiera que sea el estado action. Cuando se envía el formulario, 
            este valor se pasará junto con los datos del formulario como _action. */}
            <button
              type="submit"
              name="_action"
              value={action}
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >
              {action === "login" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
