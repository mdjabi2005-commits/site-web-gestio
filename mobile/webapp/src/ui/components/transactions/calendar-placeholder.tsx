"use client"

import { Calendar } from "@/components/ui/calendar"

export default function CalendarPlaceholder() {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Select Period</h3>
                <span className="text-[10px] font-medium text-primary">Février 2026</span>
            </div>
            <div className="flex justify-center py-2">
                <Calendar
                    mode="single"
                    className="rounded-md border bg-card shadow-sm scale-90 origin-top"
                    disabled
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded-lg bg-secondary/50 p-2 border border-border">
                    <p className="text-[8px] uppercase text-muted-foreground">Début</p>
                    <p className="text-[10px] font-bold">2026/02/01</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 border border-border">
                    <p className="text-[8px] uppercase text-muted-foreground">Fin</p>
                    <p className="text-[10px] font-bold">2026/02/28</p>
                </div>
            </div>
        </div>
    )
}
