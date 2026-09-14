"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { NewAppointmentModal } from "@/components/appointments/new-appointment-modal";
import { AppointmentDetailModal } from "@/components/appointments/appointment-detail-modal";
import type { AgendaGrid } from "@/services/appointments/agenda-grid";
import type { Client, Professional, Service } from "@prisma/client";

export function DayGrid({
  grid,
  date,
  clients,
  services,
  professionals,
}: {
  grid: AgendaGrid;
  date: string;
  clients: Client[];
  services: Service[];
  professionals: Professional[];
}) {
  const [newSlot, setNewSlot] = useState<{ time: string; professionalId: string } | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const selected = selectedAppointmentId ? grid.appointmentsById[selectedAppointmentId] : null;

  if (grid.columns.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted">
        Nenhum profissional ativo para exibir na agenda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `5rem repeat(${grid.columns.length}, 1fr)` }}
      >
        <div className="sticky left-0 bg-surface" />
        {grid.columns.map((col) => (
          <div key={col.professionalId} className="px-3 py-2 text-sm font-semibold text-foreground border-b border-border">
            {col.professionalName}
          </div>
        ))}

        {grid.times.map((time, rowIdx) => (
          <FragmentRow
            key={time}
            time={time}
            columns={grid.columns}
            rowIdx={rowIdx}
            appointmentsById={grid.appointmentsById}
            onSlotClick={(professionalId) => setNewSlot({ time, professionalId })}
            onAppointmentClick={setSelectedAppointmentId}
          />
        ))}
      </div>

      <NewAppointmentModal
        open={!!newSlot}
        onClose={() => setNewSlot(null)}
        clients={clients}
        services={services}
        professionals={newSlot ? professionals.filter((p) => p.id === newSlot.professionalId) : professionals}
        defaultDate={date}
      />
      <AppointmentDetailModal appointment={selected ?? null} onClose={() => setSelectedAppointmentId(null)} />
    </div>
  );
}

function FragmentRow({
  time,
  columns,
  rowIdx,
  appointmentsById,
  onSlotClick,
  onAppointmentClick,
}: {
  time: string;
  columns: AgendaGrid["columns"];
  rowIdx: number;
  appointmentsById: AgendaGrid["appointmentsById"];
  onSlotClick: (professionalId: string) => void;
  onAppointmentClick: (id: string) => void;
}) {
  return (
    <>
      <div className="px-2 py-2 text-xs text-muted border-b border-border sticky left-0 bg-surface tabular-nums">
        {time}
      </div>
      {columns.map((col) => {
        const cell = col.cells[rowIdx];
        return (
          <div key={col.professionalId} className="border-b border-l border-border min-h-[2.75rem] p-1">
            {cell.type === "free" && (
              <button
                onClick={() => onSlotClick(col.professionalId)}
                className="w-full h-full min-h-[2.5rem] rounded-md text-xs text-muted hover:bg-brand/5 hover:text-brand transition-colors"
              >
                Livre
              </button>
            )}
            {cell.type === "closed" && <div className="w-full h-full min-h-[2.5rem] bg-neutral-bg/40 rounded-md" />}
            {cell.type === "blocked" && (
              <div className="w-full h-full min-h-[2.5rem] rounded-md bg-neutral-bg text-neutral text-xs flex items-center justify-center px-1 text-center">
                {cell.reason || "Bloqueado"}
              </div>
            )}
            {cell.type === "appointment" && cell.isStart && (
              <button
                onClick={() => onAppointmentClick(cell.appointmentId)}
                className={cn(
                  "w-full h-full min-h-[2.5rem] rounded-md text-left px-2 py-1 text-xs bg-brand/10 text-brand hover:bg-brand/20 transition-colors overflow-hidden"
                )}
              >
                <AppointmentCellLabel appointment={appointmentsById[cell.appointmentId]} />
              </button>
            )}
            {cell.type === "appointment" && !cell.isStart && (
              <div className="w-full h-full min-h-[2.5rem] rounded-md bg-brand/10" />
            )}
          </div>
        );
      })}
    </>
  );
}

function AppointmentCellLabel({
  appointment,
}: {
  appointment?: AgendaGrid["appointmentsById"][string];
}) {
  if (!appointment) return null;
  return (
    <span className="line-clamp-2 block">
      <span className="font-medium">{appointment.client.name}</span>
      <br />
      {appointment.service.name}
    </span>
  );
}
