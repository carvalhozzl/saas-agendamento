import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comece grátis por 14 dias</CardTitle>
        <CardDescription>Sem cartão de crédito. Configure sua agenda em minutos.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
