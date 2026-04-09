import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface AttendanceEntry {
  date: string;
  status: "present" | "absent";
}

interface AttendanceCalendarProps {
  month: string;
  attendance: AttendanceEntry[];
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AttendanceCalendar = ({ month, attendance }: AttendanceCalendarProps) => {
  const parsed = useMemo(() => {
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    return {
      year,
      monthIndex,
      firstWeekDay: firstDay.getDay(),
      totalDays: lastDay.getDate(),
      label: firstDay.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    };
  }, [month]);

  const presentDates = useMemo(() => {
    return new Set(attendance.filter((entry) => entry.status === "present").map((entry) => entry.date));
  }, [attendance]);

  const todayIso = new Date().toISOString().split("T")[0];
  const days = [];

  for (let i = 0; i < parsed.firstWeekDay; i += 1) {
    days.push(<div key={`empty-${i}`} className="h-12 rounded-md bg-slate-50" />);
  }

  for (let day = 1; day <= parsed.totalDays; day += 1) {
    const dayIso = `${parsed.year}-${String(parsed.monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isFuture = dayIso > todayIso;
    const isPresent = presentDates.has(dayIso);

    let tone = "bg-slate-100 text-slate-700";
    if (!isFuture && isPresent) {
      tone = "bg-emerald-500 text-white";
    } else if (!isFuture && !isPresent) {
      tone = "bg-rose-500 text-white";
    }

    days.push(
      <div
        key={dayIso}
        className={cn(
          "h-12 rounded-md flex items-center justify-center text-sm font-semibold border",
          tone,
          dayIso === todayIso ? "ring-2 ring-amber-300 border-amber-300" : "border-transparent"
        )}
        title={isFuture ? "Future day" : isPresent ? "Present" : "Absent"}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-800">{parsed.label}</h3>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Present
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-rose-500" /> Absent
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{days}</div>
    </div>
  );
};

export default AttendanceCalendar;
