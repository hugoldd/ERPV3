import { useState } from 'react';
import { Modal } from './Modal';
import { Plus, X } from 'lucide-react';
import { Toast } from '../Toast';
import { Consultant } from '../pages/ResourcesPage';

interface ManageConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consultant: Omit<Consultant, 'id'>) => void;
  consultant?: Consultant;
}

export function ManageConsultantModal({ isOpen, onClose, onSave, consultant }: ManageConsultantModalProps) {
  const [name, setName] = useState(consultant?.name || '');
  const [email, setEmail] = useState(consultant?.email || '');
  const [phone, setPhone] = useState(consultant?.phone || '');
  const [service, setService] = useState(consultant?.service || 'SIRH');
  const [location, setLocation] = useState(consultant?.location || '');
  const [competences, setCompetences] = useState<string[]>(consultant?.competences || []);
  const [newCompetence, setNewCompetence] = useState('');
  const [availability, setAvailability] = useState(consultant?.availability || 100);
  const [showToast, setShowToast] = useState(false);

  const availableCompetences = ['Paie', 'GTA', 'SIGF', 'Formation', 'Installation', 'Paramétrage', 'Reprise de données', 'Support', 'Migration'];

  const handleAddCompetence = () => {
    if (newCompetence && !competences.includes(newCompetence)) {
      setCompetences([...competences, newCompetence]);
      setNewCompetence('');
    }
  };

  const handleRemoveCompetence = (comp: string) => {
    setCompetences(competences.filter(c => c !== comp));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      email,
      phone,
      service,
      location,
      competences,
      availability
    });

    setShowToast(true);
    setTimeout(() => {
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setService('SIRH');
      setLocation('');
      setCompetences([]);
      setAvailability(100);
    }, 1000);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={consultant ? 'Modifier le consultant' : 'Ajouter un consultant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jean.dupont@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Service & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Service *
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SIRH">SIRH</option>
                <option value="Finance">Finance</option>
                <option value="Support">Support</option>
                <option value="Formation">Formation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Localisation *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paris, Lyon, etc."
              />
            </div>
          </div>

          {/* Competences */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Compétences *
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={newCompetence}
                onChange={(e) => setNewCompetence(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une compétence</option>
                {availableCompetences
                  .filter(c => !competences.includes(c))
                  .map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddCompetence}
                disabled={!newCompetence}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {competences.map((comp) => (
                <span
                  key={comp}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {comp}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetence(comp)}
                    className="hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Disponibilité : {availability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={availability}
              onChange={(e) => setAvailability(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {consultant ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={consultant ? 'Consultant mis à jour' : 'Consultant ajouté avec succès'}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
