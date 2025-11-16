import { useState } from "react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"

import { signInWithEmailAndPassword } from "firebase/auth"
import { toast } from "sonner"
import { getFirebaseInstance } from "~/lib/get-firebase"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const { auth } = getFirebaseInstance()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const email = form.email.value
    const password = form.password.value

    try {
      await signInWithEmailAndPassword(auth, email, password)
      window.location.href = "/"

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Gagal login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Selamat Datang</CardTitle>
          <CardDescription>
            Masuk menggunakan akun Admin
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
