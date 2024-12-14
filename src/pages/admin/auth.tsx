import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCallback } from "react"
import { trpc } from "@/utils/trpc"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/router"
function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const loginMutation = trpc.admin.auth.login.useMutation()
  const router = useRouter()
  const {setAccessToken} = useAuth()

  const onSubmit = useCallback(async (formData: FormData) => {
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()

    if (!username || !password) throw new Error('hehe')

    try {
    const result = await loginMutation.mutateAsync({username,password})
    setAccessToken(result.accessToken)
    router.replace('/admin')
    } catch {}
  }, [loginMutation, router, setAccessToken])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            This is not for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          {loginMutation.error && (
            <p className="text-red-900">
              {loginMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminAuthPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-100">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
