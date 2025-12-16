import { useState } from 'react';
import { Plus, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { ResourcesTable } from '../components/ResourcesTable';
import { ResourcesCalendar } from '../components/ResourcesCalendar';
import { ManageConsultantModal } from '../components/modals/ManageConsultantModal';

export type Consultant = {
  id: string;
  name: string;
  competences: string[];
  location: string;
  service: string;
  availability: number; // % disponible
  email: string;
  phone: string;
};

const mockConsultants: Consultant[] = [
  {
    id: '1',
    name: 'Marie Lefebvre',
    competences: ['Paie', 'GTA', 'Formation'],
    location: 'Paris',
    service: 'SIRH',
    availability: 60,
    email: 'marie.lefebvre@example.com',
    phone: '+33 6 12 34 56 78'
  },
  {
    id: '2',
    name: 'Thomas Durand',
    competences: ['SIGF', 'Paramétrage', 'Installation'],
    location: 'Lyon',
    service: 'Finance',
    availability: 30,
    email: 'thomas.durand@example.com',
    phone: '+33 6 23 45 67 89'
  },
  {
    id: '3',
    name: 'Sophie Martin',
    competences: ['Formation', 'Paie', 'Reprise de données'],
    location: 'Bordeaux',
    service: 'SIRH',
    availability: 80,
    email: 'sophie.martin@example.com',
    phone: '+33 6 34 56 78 90'
  },
  {
    id: '4',
    name: 'Lucas Bernard',
    competences: ['GTA', 'Paramétrage', 'Support'],
    location: 'Paris',
    service: 'SIRH',
    availability: 45,
    email: 'lucas.bernard@example.com',
    phone: '+33 6 45 67 89 01'
  },
  {
    id: '5',
    name: 'Emma Rousseau',
    competences: ['SIGF', 'Formation', 'Migration'],
    location: 'Nantes',
    service: 'Finance',
    availability: 70,
    email: 'emma.rousseau@example.com',
    phone: '+33 6 56 78 90 12'
  },
  {
    id: '6',
    name: 'Alexandre Petit',
    competences: ['Installation', 'Paramétrage', 'SIGF'],
    location: 'Lille',
    service: 'Finance',
    availability: 20,
    email: 'alexandre.petit@example.com',
    phone: '+33 6 67 89 01 23'
  }
];

export function ResourcesPage() {
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [consultants, setConsultants] = useState<Consultant[]>(mockConsultants);
  const [showAddConsultant, setShowAddConsultant] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompetence, setFilterCompetence] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const allCompetences = Array.from(new Set(consultants.flatMap(c => c.competences)));
  const allLocations = Array.from(new Set(consultants.map(c => c.location)));

  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompetence = !filterCompetence || consultant.competences.includes(filterCompetence);
    const matchesLocation = !filterLocation || consultant.location === filterLocation;
    return matchesSearch && matchesCompetence && matchesLocation;
  });

  const handleAddConsultant = (newConsultant: Omit<Consultant, 'id'>) => {
    const consultant: Consultant = {
      ...newConsultant,
      id: Date.now().toString()
    };
    setConsultants([...consultants, consultant]);
  };

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un consultant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Competence Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterCompetence}
              onChange={(e) => setFilterCompetence(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les compétences</option>
              {allCompetences.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les localisations</option>
            {allLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                view === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Planning
            </button>
          </div>

          {/* Add Consultant Button */}
          <button
            onClick={() => setShowAddConsultant(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un consultant</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'table' ? (
        <ResourcesTable consultants={filteredConsultants} />
      ) : (
        <ResourcesCalendar consultants={filteredConsultants} />
      )}

      <ManageConsultantModal
        isOpen={showAddConsultant}
        onClose={() => setShowAddConsultant(false)}
        onSave={handleAddConsultant}
      />
    </div>
  );
}
