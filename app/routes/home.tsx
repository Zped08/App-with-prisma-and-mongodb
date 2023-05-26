import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { getOtherUsers } from "~/utils/user.server";
import Layout from "~/components/Layout";
import { UserPanel } from "~/components/user-panel";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  //await requireUserId(request);
  //return null; // <- Un cargador siempre tiene que devolver algún valor, incluso si es nulo
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);
  return json({ users });
};

export default function Home() {
  const { users } = useLoaderData();
  return (
    <Layout>
      <div className="h-full flex">
        <UserPanel users={users} />
        <div className="flex-1"></div>
      </div>
    </Layout>
  );
}
