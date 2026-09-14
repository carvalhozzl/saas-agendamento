"use server";

import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";
import { signupSchema, loginSchema } from "@/lib/validations/auth";
import { signUpOwner } from "@/services/organizations/organization.service";

export type FormState = { error?: string; success?: boolean };

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    // NEXT_REDIRECT is thrown by signIn on success; let it propagate.
    throw error;
  }
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    businessName: formData.get("businessName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await signUpOwner(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível criar sua conta." };
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/onboarding",
  });

  return { success: true };
}
