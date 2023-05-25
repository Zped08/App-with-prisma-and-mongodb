import { registerForm, LoginForm } from "./types.server";
import { prisma } from "./prisma.server";
import { json, createCookieSessionStorage } from "@remix-run/node";
import { createUser } from "./user.server";
import bcrypt from 'bcryptjs'

export async function login({ email, password }: LoginForm) {
  // 2
  const user = await prisma.user.findUnique({
    where: { email },
  })

  // 3
  if (!user || !(await bcrypt.compare(password, user.password)))
    return json({ error: `Incorrect login` }, { status: 400 })

  // 4
  return { id: user.id, email }
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    // El nombre de la cookie.
    name: 'kudos-session',
    // Si true, sólo permite que la cookie se envíe a través de HTTPS.
    secure: process.env.NODE_ENV === 'production',
    //El secreto de la sesión.
    secrets: [sessionSecret],
    //especifica si la cookie se puede enviar o no a través de solicitudes entre sitios.
    sameSite: 'lax',
    // una ruta que debe existir en la URL para enviar una cookie.
    path: '/',
    // Define un período de tiempo que se permite que la cookie viva antes de ser eliminada automáticamente.
    maxAge: 60 * 60 * 24 * 30,
  //Si true , no permite que JavaScript acceda a la cookie.
    httpOnly: true,
  },
})

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
