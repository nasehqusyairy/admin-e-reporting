import logo from '~/images/logo.webp'
import { LoginForm } from "~/components/login-form"
import { redirect, type ClientLoaderFunction } from 'react-router';
import { getUser } from '~/lib/get-user';

export const clientLoader: ClientLoaderFunction = async () => {
  const user = await getUser();
  if (user) {
    throw redirect("/");
  }
}

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center gap-6 bg-muted p-6 md:p-10 min-h-svh">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <a href="#" className="flex items-center self-center gap-2 font-medium">
          <img src={logo} alt="Logo" className="w-6" />
          E-Reporting Surabaya
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
