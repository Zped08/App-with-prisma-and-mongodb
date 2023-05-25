// app/utils/prisma.server.ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient
declare global {
  var __db: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
  prisma.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
    global.__db.$connect()
  }
  prisma = global.__db
}

export { prisma }

/* Declaraciones globales: Se declara una variable global __db de tipo 
PrismaClient | undefined. Esto permite que la variable sea accesible desde cualquier lugar dentro del proyecto.

Condicional de entorno de producción: Si el entorno de ejecución es production, 
se crea una nueva instancia de PrismaClient llamada prisma y se establece la conexión 
a la base de datos utilizando prisma.$connect().

En caso contrario (entorno de desarrollo), se verifica si la variable global __db está definida. 
Si no lo está, se crea una nueva instancia de PrismaClient y se establece la conexión a la base de datos utilizando __db.$connect(). Luego, se asigna la instancia __db a la variable prisma.

Exportación: Se exporta la variable prisma para que pueda ser utilizada en otros archivos del proyecto. */