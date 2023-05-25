import bcrypt from "bcryptjs";
import type { registerForm } from "./types.server";
import { prisma } from "./prisma.server";

//Esta función toma un parámetro user de tipo registerForm,
//que probablemente contiene información sobre el usuario que se va a crear.
export const createUser = async (user: registerForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  // bcrypt.hash() generar el hash de la contraseña del usuario.
  //El primer argumento es la contraseña sin procesar (user.password)
  //el segundo argumento es el número de rondas de sal para el hash.
  const newUser = await prisma.user.create({
    // Se utiliza la instancia prisma para crear un nuevo usuario
    //en la base de datos utilizando prisma.user.create()
    data: {
      // Se especifica la información del usuario en el objeto data
      email: user.email,
      password: passwordHash,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
  });
  // La función retorna un objeto que contiene el ID del nuevo usuario
  //(newUser.id) y el correo electrónico del usuario (user.email).
  return { id: newUser.id, email: user.email };
};
