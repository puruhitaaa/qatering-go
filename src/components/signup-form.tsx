"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { authClient } from "@/server/better-auth/client"

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Must be a valid number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupValues) {
    setLoading(true)
    setError(null)
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        phoneNumber: Number(data.phoneNumber),
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully")
        },
        onError: (ctx) => {
          setError(ctx.error.message)
          setLoading(false)
          toast.error(ctx.error.message)
        },
      }
    )
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='name'>Full Name</FieldLabel>
              <Input id='name' placeholder='John Doe' {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input
                id='email'
                placeholder='m@example.com'
                type='email'
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor='phoneNumber'>Phone Number</FieldLabel>
              <Input
                id='phoneNumber'
                placeholder='08123456789'
                type='tel'
                {...register("phoneNumber")}
              />
              <FieldError errors={[errors.phoneNumber]} />
            </Field>

            <Field>
              <FieldLabel htmlFor='password'>Password</FieldLabel>
              <Input id='password' type='password' {...register("password")} />
              <FieldError errors={[errors.password]} />
            </Field>

            <Field>
              <FieldLabel htmlFor='confirm-password'>
                Confirm Password
              </FieldLabel>
              <Input
                id='confirm-password'
                type='password'
                {...register("confirmPassword")}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>

            {error && (
              <div className='text-center font-medium text-destructive text-sm'>
                {error}
              </div>
            )}

            <Field>
              <Button disabled={loading} type='submit'>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Create Account
              </Button>
              <Button disabled={loading} type='button' variant='outline'>
                Sign up with Google
              </Button>
              <FieldDescription className='px-6 text-center'>
                Already have an account?{" "}
                <a className='underline hover:text-primary' href='/login'>
                  Sign in
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
