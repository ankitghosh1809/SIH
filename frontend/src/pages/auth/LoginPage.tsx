import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";
import type { UserRole } from "@/types/api";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "patient", label: "Patient" },
  { value: "camp_staff", label: "Camp staff" },
  { value: "doctor", label: "Doctor" },
  { value: "admin", label: "Admin" },
];

const loginSchema = z.object({
  role: z.enum(["admin", "doctor", "camp_staff", "patient"]),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: Location;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "patient", username: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.username, values.password, values.role);
      const state = location.state as LocationState | null;
      const destination = state?.from
        ? `${state.from.pathname}${state.from.search}`
        : ROUTES.home;
      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.status === 401
          ? "Incorrect username or password."
          : axios.isAxiosError(error) && error.response?.status === 403
            ? "This account does not have the selected role."
          : "Something went wrong. Please try again.";
      form.setError("root", { message });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-12">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Sign in to SIH26139 Screening.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sign in as</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the
                          login form is the sole content of its page, so
                          autofocus here does not disorient anyone. */}
                      <Input autoComplete="username" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root ? (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
