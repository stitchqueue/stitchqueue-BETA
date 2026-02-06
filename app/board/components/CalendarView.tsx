/**
 * CalendarView Component
 * 
 * Monthly calendar grid showing projects by due date.
 * 
 * @module board/components/CalendarView
 */

"use client";

import type { Project } from "../../types";
import { getDueBadge, getFullName } from "../utils";

interface CalendarViewProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Monthly calendar view showing projects by due date.
 * Projects appear on their requested completion date.
 */
export default function CalendarView({
  projects,
  onProjectClick,
  currentMonth,
  onMonthChange,
}: CalendarViewProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Calculate calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Build days array with leading nulls for alignment
  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  /**
   * Get projects due on a specific day
   */
  const getProjectsForDay = (day: number): Project[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return projects.filter(
      (p) =>
        p.requestedDateType === "specific_date" &&
        p.requestedCompletionDate === dateStr
    );
  };

  /**
   * Check if a day is today
   */
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-line bg-gray-50">
        <button
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          ←
        </button>
        <h2 className="text-lg font-bold text-plum">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-line">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-bold text-muted bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayProjects = day ? getProjectsForDay(day) : [];

          return (
            <div
              key={idx}
              className={`min-h-[100px] border-b border-r border-line p-1 ${
                day === null ? "bg-gray-50" : "bg-white"
              }`}
            >
              {day !== null && (
                <>
                  {/* Day Number */}
                  <div
                    className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(day) ? "bg-plum text-white" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>

                  {/* Projects for this day */}
                  <div className="space-y-1">
                    {dayProjects.slice(0, 3).map((project) => {
                      const fullName = getFullName(project);
                      const dueBadge = getDueBadge(project);

                      return (
                        <button
                          key={project.id}
                          onClick={() => onProjectClick(project.id)}
                          className={`w-full text-left px-1.5 py-1 rounded text-xs truncate ${
                            dueBadge?.urgent
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-plum/10 text-plum hover:bg-plum/20"
                          }`}
                        >
                          {fullName || "Unnamed"}
                        </button>
                      );
                    })}
                    {dayProjects.length > 3 && (
                      <div className="text-xs text-muted px-1">
                        +{dayProjects.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-line bg-gray-50 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-plum/20"></div>
          <span className="text-muted">Project due</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-200"></div>
          <span className="text-muted">Overdue / Due soon</span>
        </div>
      </div>
    </div>
  );
}
