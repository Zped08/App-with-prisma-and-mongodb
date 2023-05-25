import { registerForm, LoginForm } from "./types.server";
import { prisma } from "./prisma.server";
import {redirect, json, createCookieSessionStorage } from "@remix-run/node";
import { createUser } from "./user.server";
import bcrypt from 'bcryptjs'


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

//crea una nueva sesión
export async function createUserSession(userId: string, redirectTo: string) {
  // Se utiliza la función storage.getSession() para obtener la sesión actual.
  const session = await storage.getSession()
  //establece el ID de usuario de esa sesión en el ID del usuario que ha iniciado sesión.
  session.set('userId', userId)
  //redirige al usuario a una ruta que puede especificar al llamar a esta función.
  return redirect(redirectTo, {
    //confirma la sesión al configurar el encabezado de la cookie.
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

//recibe un parámetro users de tipo registerForm,
//que probablemente sea un objeto que contiene información
//sobre el usuario que se está registrando.
export async function register(users: registerForm) {
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
    return createUserSession(newUser.id, '/');
}

export async function login({ email, password }: LoginForm) {
  console.log(login)
  // 2
  const user = await prisma.user.findUnique({
    where: { email },
  })

  // 3
  if (!user || !(await bcrypt.compare(password, user.password)))
  return json({ error: `Incorrect login` }, { status: 400 })

  // 4
  //return { id: user.id, email }
  return createUserSession(user.id, "/");
}


/* ***Authorize users on private routes*** */


// request representa el objeto de solicitud HTTP recibido 
//por el servidor
// redirectTo es una cadena opcional que representa la URL a la que se 
//redirigirá si no se encuentra un ID de usuario en la sesión.
export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  // getuserSession obtiene la sesión del usuario.
  const session = await getUserSession(request)
  //userId intenta obtener el ID de usuario
  //Si no se encuentra un ID de usuario o el ID de usuario no es una cadena,
  // significa que el usuario no está autenticado.
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
  //se crea un objeto URLSearchParams que contiene el parámetro redirectTo 
  //con el valor de la URL a la que se debe redirigir. 
  //Luego, se lanza una excepción utilizando throw redirect(...)
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  //Si se encuentra un ID de usuario válido en la sesión, se devuelve el ID de usuario.
  return userId
}

// Toma la sesión del usuario actual en función de la cookie de la solicitud.
function getUserSession(request: Request) {
  // utiliza la función storage.getSession para obtener 
//la sesión del usuario. 
  //request.headers.get('Cookie') se utiliza para obtener el valor de la 
  //cabecera Cookie de la solicitud y pasarlo a la función getSession
  return storage.getSession(request.headers.get('Cookie'))
}

// utiliza la función getUserSession para obtener la sesión del usuario basada en la solicitud recibida.
async function getUserId(request: Request) {
  const session = await getUserSession(request)
  //se utiliza el método get de la sesión para obtener el valor asociado a la clave 'userId'
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') return null
  return userId
}

export async function getUser(request: Request) {
  //utiliza la función getUserId para obtener el ID del 
  //usuario asociado a la sesión actual, basándose en la solicitud recibida.
  const userId = await getUserId(request)
  if (typeof userId !== 'string') {
    return null
  }
//Se utiliza el objeto select para especificar qué propiedades del usuario deseamos obtener en la respuesta
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true },
    })
    return user
  } catch {
    throw logout(request)
  }
}
//Destruye la sesión actual y redirige al usuario a la pantalla de inicio de sesión
export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}