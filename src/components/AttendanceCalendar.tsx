import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface AttendanceEntry {
    date: string;
    status: "present" | "absent";
}

interface AttendanceCalendarProps {
    month: string;
    attendance: AttendanceEntry[];
    practiceDates?: string[];
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ATTENDANCE_FEATURE_START_DATE = "2026-04-10";

const getTodayInIST = () => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return formatter.format(new Date());
};

const AttendanceCalendar = ({ month, attendance, practiceDates = [] }: AttendanceCalendarProps) => {
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

    const practiceDateSet = useMemo(() => {
        return new Set(practiceDates);
    }, [practiceDates]);

    const todayIso = getTodayInIST();
    const days = [];

    for (let i = 0; i < parsed.firstWeekDay; i += 1) {
        days.push(<div key={`empty-${i}`} className="h-9 rounded-md bg-slate-50 sm:h-12" />);
    }

    for (let day = 1; day <= parsed.totalDays; day += 1) {
        const dayIso = `${parsed.year}-${String(parsed.monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isBeforeFeatureStart = dayIso < ATTENDANCE_FEATURE_START_DATE;
        const isFuture = dayIso > todayIso;
        const isPast = dayIso < todayIso;
        const isPresent = presentDates.has(dayIso);
        const isPracticeDone = practiceDateSet.has(dayIso);

        let tone = "bg-slate-100 text-slate-700";
        if (isBeforeFeatureStart) {
            tone = "bg-white text-slate-500 border-slate-200";
        } else if (!isFuture && isPresent) {
            tone = "bg-green-600 text-white";
        } else if (isPast && !isPracticeDone) {
            tone = "bg-blue-900 text-white";
        } else if (!isFuture && !isPresent) {
            tone = "bg-red-500 text-white";
        }

        let title = "Future day";
        if (isBeforeFeatureStart) {
            title = "Attendance not started";
        } else if (!isFuture && isPresent) {
            title = "Present";
        } else if (isPast && !isPracticeDone) {
            title = "Practice Not Done";
        } else if (!isFuture) {
            title = "Absent";
        }

        days.push(
            <div
                key={dayIso}
                className={cn(
                    "h-9 rounded-md flex items-center justify-center text-xs font-semibold border sm:h-12 sm:text-sm",
                    tone,
                    dayIso === todayIso ? "ring-2 ring-amber-300 border-amber-300" : "border-transparent"
                )}
                title={title}
            >
                {day}
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-3 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-800 sm:text-lg">{parsed.label}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium sm:gap-3">
                        <span className="inline-flex items-center gap-1">
                            <span className="h-3 w-3 rounded-sm border border-slate-300 bg-white" /> Not Started
                        </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm bg-green-600" /> Present
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm bg-red-500" /> Absent
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 rounded-sm bg-blue-900" /> Practice Not Done
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 sm:gap-2 sm:text-xs">
                {weekDays.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">{days}</div>
        </div>
    );
};

export default AttendanceCalendar;
