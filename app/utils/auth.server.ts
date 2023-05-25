import { registerForm } from "./types.server";
import { prisma } from "./prisma.server";
import { json } from "@remix-run/node";
import { createUser } from "./user.server";

//recibe un parámetro users de tipo registerForm,
//que probablemente sea un objeto que contiene información
//sobre el usuario que se está registrando.
export default async function register(users: registerForm) {
  //se utiliza await para realizar una consulta a la base de datos utilizando prisma
  //La consulta verifica si ya existe un usuario con el mismo correo electrónico (email) en la base de datos.
  const exists = await prisma.user.count({ where: { email: users.email } });
  //prisma.user.count() cuenta el número de usuarios que cumplen con la condición especificada en el objeto where
  if (exists) {
    return json(
      { error: `User already exists with that email` },
      { status: 400 }
    );
  }

  const newUser = await createUser(users);
  if (!newUser) {
    return json(
      {
        error: "ha ocurrido algun error ",
        fields: { email: users.email, password: users.password },
      },
      { status: 400 }
    );
  }
}
