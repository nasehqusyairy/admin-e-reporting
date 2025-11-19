import { useEffect } from "react"
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
import { toast } from "sonner"
import { useFetcher } from "react-router"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {

  const fetcher = useFetcher()
  const loading = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(`Terjadi kesalahan saat masuk: ${fetcher.data?.error}`)
    }
  }, [fetcher.data?.error]);

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
          <fetcher.Form method="POST">
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
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  )
}
