"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function AppointmentsChart({ data }: { data: { date: string; agendamentos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          cursor={{ fill: "var(--muted-surface)" }}
        />
        <Bar dataKey="agendamentos" fill="var(--brand)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
