"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type FormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState: FormState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="businessName" required>
          Nome do seu negócio
        </Label>
        <Input id="businessName" name="businessName" placeholder="Barbearia do João" required />
      </div>
      <div>
        <Label htmlFor="name" required>
          Seu nome
        </Label>
        <Input id="name" name="name" placeholder="João Silva" required />
      </div>
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
        <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-danger bg-danger-bg rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" isLoading={isPending}>
        Criar conta grátis
      </Button>
      <p className="text-sm text-muted text-center">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
