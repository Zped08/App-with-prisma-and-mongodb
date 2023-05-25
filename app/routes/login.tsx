import Layout from "./components/Layout";

export default function login() {
    
  return (
    <Layout>
      <div className="h-screen flex justify-center items-center flex-col gap-y-4">
        <h2 className="text-yellow-300 font-extrabold text-5xl">login</h2>
        <p className="font-semibold text-slate-300">
          Login in to give some praise
        </p>
        <form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
          <label htmlFor="email" className="text-blue-600 font-semibold">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="w-full p-2 rounded-xl my-2"
          />
          <label htmlFor="password" className="text-blue-600 font-semibold">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-2 rounded-xl my-2"
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
