import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Consultant } from "../types";

interface ResourcesCalendarProps {
  consultants: Consultant[];
}

// Mock bookings data (à remplacer plus tard par une table Supabase de bookings/allocations)
const mockBookings: Record<
  string,
  { projectName: string; days: number; startDay: number }[]
> = {
  "1": [
    { projectName: "Client ABC - SIRH", days: 3, startDay: 2 },
    { projectName: "Client XYZ - Formation", days: 2, startDay: 8 },
  ],
  "2": [
    { projectName: "Client DEF - SIGF", days: 5, startDay: 1 },
    { projectName: "Client GHI - Installation", days: 3, startDay: 9 },
  ],
  "3": [{ projectName: "Client JKL - Paie", days: 2, startDay: 5 }],
  "4": [
    { projectName: "Client MNO - GTA", days: 4, startDay: 3 },
    { projectName: "Client PQR - Support", days: 2, startDay: 10 },
  ],
  "5": [{ projectName: "Client STU - SIGF", days: 3, startDay: 6 }],
  "6": [
    { projectName: "Client VWX - Installation", days: 6, startDay: 1 },
    { projectName: "Client YZA - Paramétrage", days: 2, startDay: 9 },
  ],
};

export function ResourcesCalendar({ consultants }: ResourcesCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  const daysInWeek = 14; // Afficher 2 semaines

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  };

  const getWeekDays = () => {
    const days: Date[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + currentWeek * 7);

    for (let i = 0; i < daysInWeek; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const previousWeek = () => setCurrentWeek((w) => w - 1);
  const nextWeek = () => setCurrentWeek((w) => w + 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
        <h3 className="text-gray-900">Planning de disponibilité</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-gray-700 min-w-[200px] text-center">
            {weekDays[0].toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}{" "}
            -{" "}
            {weekDays[daysInWeek - 1].toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Days Header */}
          <div className="grid grid-cols-[200px_repeat(14,1fr)] border-b border-gray-200 bg-gray-50">
            <div className="p-3 border-r border-gray-200">
              <span className="text-gray-700">Consultant</span>
            </div>

            {weekDays.map((day, idx) => (
              <div key={idx} className="p-3 text-center border-r border-gray-200">
                <div className="text-sm text-gray-600">
                  {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                </div>
                <div className="text-gray-900">{day.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Consultant Rows */}
          {consultants.map((consultant) => {
            // NOTE: dans votre mock, les clés sont "1","2"... alors que vos ids Supabase seront des UUID.
            // On garde le fallback tableau vide.
            const bookings = mockBookings[consultant.id] || [];

            return (
              <div
                key={consultant.id}
                className="grid grid-cols-[200px_repeat(14,1fr)] border-b border-gray-200 hover:bg-gray-50"
              >
                {/* Consultant Info */}
                <div className="p-3 border-r border-gray-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-sm">
                      {getInitials(consultant.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-900 text-sm truncate">
                      {consultant.name}
                    </div>
                    <div className="text-gray-500 text-xs">{consultant.service}</div>
                  </div>
                </div>

                {/* Calendar Cells */}
                {weekDays.map((_, dayIdx) => {
                  const booking = bookings.find(
                    (b) => dayIdx >= b.startDay && dayIdx < b.startDay + b.days
                  );
                  const isBookingStart = !!booking && dayIdx === booking.startDay;

                  return (
                    <div
                      key={dayIdx}
                      className="border-r border-gray-200 p-1 relative min-h-[60px]"
                    >
                      {booking ? (
                        isBookingStart ? (
                          <div
                            className="absolute top-1 left-1 h-[calc(100%-8px)] bg-blue-500 text-white rounded px-2 py-1 text-xs overflow-hidden"
                            style={{
                              width: `calc(${booking.days * 100}% + ${(booking.days - 1) * 1}px)`,
                            }}
                          >
                            <div className="truncate">{booking.projectName}</div>
                          </div>
                        ) : null
                      ) : (
                        <div className="w-full h-full bg-green-50 rounded"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span className="text-sm text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Réservé</span>
        </div>
      </div>

      {consultants.length === 0 && (
        <div className="py-12 text-center text-gray-500">Aucun consultant à afficher</div>
      )}
    </div>
  );
}
