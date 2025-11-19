import logo from '~/images/logo.webp'
import { LoginForm } from "~/components/login-form"
import { type ActionFunction, type MiddlewareFunction } from 'react-router'
import { verifyPassword } from '~/.server/auth'
import { getSession, pass } from '~/.server/session'
import { User } from '~/.server/model'

export const middleware: MiddlewareFunction[] = [
  async ({ request }, next) => {
    const session = await getSession(request.headers.get("Cookie"))
    if (session.get("userId")) {
      return await pass(session, "/")
    }
    return next()
  }
]

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const existingUser = await User.query().where('email', email).first()

  if (!existingUser) {
    return {
      error: "Email tidak ditemukan"
    }
  }

  const isValid = await verifyPassword(password, existingUser.password)

  if (!isValid) {
    return {
      error: "Password salah"
    }
  }

  session.set("userId", existingUser.id);

  return await pass(session, "/")
}

export default () => {

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
