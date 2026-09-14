"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email" required>
          E-mail
        </Label>
        <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
      </div>
      <div>
        <Label htmlFor="password" required>
          Senha
        </Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" isLoading={isPending}>
        Entrar
      </Button>
      <p className="text-sm text-muted text-center">
        Ainda não tem uma conta?{" "}
        <Link href="/registrar" className="text-brand font-medium hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}
