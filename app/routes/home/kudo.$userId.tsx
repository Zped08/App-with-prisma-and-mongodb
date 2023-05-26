import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserById } from "~/utils/user.server";
import { Portal } from '~/components/portal'

// 1Extrae el campo params de la función del cargador.
export const loader: LoaderFunction = async ({ request, params }) => {
  // 2Luego userId toma el valor
  const { userId } = params;
  if (typeof userId !== "string") {
    return json({ userId });
  }
  const recipient = await getUserById(userId);
  return json({ recipient });
};

export default function KudoModal() {
  // 3 recupera los datos del loader function using
  //Remix's userLoaderData hook and renders the userId en la pantalla.
  const data = useLoaderData();
/*   return <h2> User: {data.userId} </h2>; */
  return <Portal wrapperId="kudo-modal">{/* ... */}</Portal>
}
