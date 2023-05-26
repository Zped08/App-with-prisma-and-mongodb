import { json, LoaderFunction } from "@remix-run/node";
import { getOtherUsers } from "~/utils/user.server";
import { requireUserId } from "~/utils/auth.server";
import Layout from "~/components/Layout";
import { UserPanel } from "../components/user-panel";
import { useLoaderData, Outlet } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  /* 
  await requireUserId(request)
   return null // <- A loader always has to return some value, even if that is null */
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);
  console.log(users)
  return json({ users });
};

export default function Home() {
  const { users } = useLoaderData()
  return (
    <Layout>
      <Outlet/> 
      <div className="h-full flex">
        <UserPanel  users={users} />
      </div>
    </Layout>
  );
}
