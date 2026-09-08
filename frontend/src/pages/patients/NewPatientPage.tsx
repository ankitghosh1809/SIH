import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/routes";
import { useCreatePatient } from "./hooks";

// Every field is a plain (possibly empty) string at the form-state
// level — text/select inputs never produce `undefined` — so "optional"
// is handled by treating "" as not-provided when building the API
// payload in onSubmit, not by making these zod fields `.optional()`.
const formSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  age: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || (/^\d{1,3}$/.test(val) && Number(val) > 0 && Number(val) < 130),
      { message: "Enter a valid age" }
    ),
  gender: z.string().trim(),
  phone: z
    .string()
    .trim()
    .refine((val) => val === "" || /^[0-9+\-\s()]{7,15}$/.test(val), {
      message: "Enter a valid phone number",
    }),
  diabetes_type: z.string().trim(),
});

type FormValues = z.infer<typeof formSchema>;

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

export default function NewPatientPage() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      age: "",
      gender: "",
      phone: "",
      diabetes_type: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const newPatient = await createPatient.mutateAsync({
        full_name: values.full_name,
        age: values.age ? Number(values.age) : null,
        gender: values.gender || null,
        phone: values.phone || null,
        diabetes_type: values.diabetes_type || null,
      });
      toast.success(`${newPatient.full_name} registered`);
      navigate(ROUTES.patientDetail(newPatient.id));
    } catch (error) {
      toast.error("Couldn't register patient. Please try again.");
    }
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <Link
        to={ROUTES.patients}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Register a new patient</CardTitle>
          <CardDescription>
            Only full name is required. The rest can be filled in later from the
            patient's profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                autoFocus
                {...register("full_name")}
                aria-invalid={Boolean(errors.full_name)}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  {...register("age")}
                  aria-invalid={Boolean(errors.age)}
                />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                {...register("phone")}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diabetes_type">Diabetes type</Label>
              <Input
                id="diabetes_type"
                placeholder="e.g. Type 2, Gestational, Pre-diabetic"
                {...register("diabetes_type")}
              />
              <p className="text-xs text-muted-foreground">
                Free text, in the patient's or referring clinician's own words.
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Registering..." : "Register patient"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
