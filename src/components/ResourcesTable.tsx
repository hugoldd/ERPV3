import { Mail, Phone, MapPin, Award } from "lucide-react";
import type { Consultant } from "../types";

interface ResourcesTableProps {
  consultants: Consultant[];
}

export function ResourcesTable({ consultants }: ResourcesTableProps) {
  const getAvailabilityColor = (availability: number) => {
    if (availability >= 70) return "bg-green-100 text-green-700";
    if (availability >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Consultant</th>
              <th className="px-6 py-3 text-left text-gray-700">Service</th>
              <th className="px-6 py-3 text-left text-gray-700">Compétences</th>
              <th className="px-6 py-3 text-left text-gray-700">Localisation</th>
              <th className="px-6 py-3 text-left text-gray-700">Contact</th>
              <th className="px-6 py-3 text-left text-gray-700">Disponibilité</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {consultants.map((consultant) => (
              <tr key={consultant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700">
                        {getInitials(consultant.name)}
                      </span>
                    </div>
                    <div>
                      <div className="text-gray-900">{consultant.name}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {consultant.service}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {consultant.competences.map((comp, idx) => (
                      <span
                        key={`${comp}-${idx}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        <Award className="w-3 h-3" />
                        {comp}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {consultant.location}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-3 h-3" />
                      <a
                        href={`mailto:${consultant.email}`}
                        className="hover:text-blue-600"
                      >
                        {consultant.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone className="w-3 h-3" />
                      {consultant.phone ? (
                        <a
                          href={`tel:${consultant.phone}`}
                          className="hover:text-blue-600"
                        >
                          {consultant.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            consultant.availability >= 70
                              ? "bg-green-500"
                              : consultant.availability >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${consultant.availability}%` }}
                        />
                      </div>
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-sm ${getAvailabilityColor(
                        consultant.availability
                      )}`}
                    >
                      {consultant.availability}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {consultants.length === 0 && (
        <div className="py-12 text-center text-gray-500">Aucun consultant trouvé</div>
      )}
    </div>
  );
}
