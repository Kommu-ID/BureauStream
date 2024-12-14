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
import { LandmarkIcon } from "lucide-react"
import Link from "next/link"
function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const loginMutation = trpc.login.useMutation()
  const router = useRouter()
  const {setAccessToken} = useAuth()

  const onSubmit = useCallback(async (formData: FormData) => {
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()

    if (!username || !password) throw new Error('hehe')

    try {
    const result = await loginMutation.mutateAsync({username,password})
    setAccessToken(result.accessToken)
    router.replace('/')
    } catch {}
  }, [loginMutation, router, setAccessToken])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Login into your account
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
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
            </div>
          </form>
          {loginMutation.error && (
            <p className="mt-4 text-red-900">
              {loginMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LandmarkIcon className="size-4" />
          </div>
          BureauStream
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
