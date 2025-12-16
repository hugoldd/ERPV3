import { useState } from 'react';
import { Modal } from './Modal';
import { Plus, X } from 'lucide-react';
import { Toast } from '../Toast';
import { Article } from '../pages/ArticlesPage';

interface ManageArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: Omit<Article, 'id'>) => void;
  article?: Article;
}

export function ManageArticleModal({ isOpen, onClose, onSave, article }: ManageArticleModalProps) {
  const [name, setName] = useState(article?.name || '');
  const [type, setType] = useState<Article['type']>(article?.type || 'Installation');
  const [service, setService] = useState(article?.service || 'SIRH');
  const [competencesRequired, setCompetencesRequired] = useState<string[]>(article?.competencesRequired || []);
  const [newCompetence, setNewCompetence] = useState('');
  const [standardDuration, setStandardDuration] = useState(article?.standardDuration || 1);
  const [mode, setMode] = useState<Article['mode']>(article?.mode || 'Sur site');
  const [description, setDescription] = useState(article?.description || '');
  const [showToast, setShowToast] = useState(false);

  const availableCompetences = ['Paie', 'GTA', 'SIGF', 'Formation', 'Installation', 'Paramétrage', 'Reprise de données', 'Support', 'Migration'];

  const handleAddCompetence = () => {
    if (newCompetence && !competencesRequired.includes(newCompetence)) {
      setCompetencesRequired([...competencesRequired, newCompetence]);
      setNewCompetence('');
    }
  };

  const handleRemoveCompetence = (comp: string) => {
    setCompetencesRequired(competencesRequired.filter(c => c !== comp));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      name,
      type,
      service,
      competencesRequired,
      standardDuration,
      mode,
      description
    });

    setShowToast(true);
    setTimeout(() => {
      onClose();
      // Reset form
      if (!article) {
        setName('');
        setType('Installation');
        setService('SIRH');
        setCompetencesRequired([]);
        setStandardDuration(1);
        setMode('Sur site');
        setDescription('');
      }
    }, 1000);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={article ? 'Modifier l\'article' : 'Créer un article'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nom de l'article *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Installation SIRH Paie"
            />
          </div>

          {/* Type & Service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Type de prestation *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Article['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Installation">Installation</option>
                <option value="Paramétrage">Paramétrage</option>
                <option value="Formation">Formation</option>
                <option value="Reprise de données">Reprise de données</option>
                <option value="Support">Support</option>
                <option value="Migration">Migration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Service propriétaire *
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
          </div>

          {/* Duration & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Durée standard (jours) *
              </label>
              <input
                type="number"
                min="1"
                value={standardDuration}
                onChange={(e) => setStandardDuration(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Mode d'intervention *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Article['mode'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sur site">Sur site</option>
                <option value="À distance">À distance</option>
                <option value="Hybride">Hybride</option>
              </select>
            </div>
          </div>

          {/* Competences */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Compétences nécessaires *
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={newCompetence}
                onChange={(e) => setNewCompetence(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une compétence</option>
                {availableCompetences
                  .filter(c => !competencesRequired.includes(c))
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
              {competencesRequired.map((comp) => (
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

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description de la prestation..."
            />
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
              {article ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={article ? 'Article mis à jour' : 'Article créé avec succès'}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
