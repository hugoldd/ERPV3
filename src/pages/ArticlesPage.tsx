import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { ManageArticleModal } from '../components/modals/ManageArticleModal';
import { Toast } from '../components/Toast';

export type Article = {
  id: string;
  name: string;
  type: 'Installation' | 'Paramétrage' | 'Formation' | 'Reprise de données' | 'Support' | 'Migration';
  service: string;
  competencesRequired: string[];
  standardDuration: number; // in days
  mode: 'Sur site' | 'À distance' | 'Hybride';
  description: string;
};

const mockArticles: Article[] = [
  {
    id: '1',
    name: 'Installation SIRH Paie',
    type: 'Installation',
    service: 'SIRH',
    competencesRequired: ['Paie', 'Installation'],
    standardDuration: 5,
    mode: 'Sur site',
    description: 'Installation complète du module Paie'
  },
  {
    id: '2',
    name: 'Formation GTA Utilisateurs',
    type: 'Formation',
    service: 'SIRH',
    competencesRequired: ['GTA', 'Formation'],
    standardDuration: 2,
    mode: 'Hybride',
    description: 'Formation des utilisateurs finaux au module GTA'
  },
  {
    id: '3',
    name: 'Paramétrage SIGF Standard',
    type: 'Paramétrage',
    service: 'Finance',
    competencesRequired: ['SIGF', 'Paramétrage'],
    standardDuration: 8,
    mode: 'À distance',
    description: 'Paramétrage du système de gestion financière'
  },
  {
    id: '4',
    name: 'Reprise données Paie',
    type: 'Reprise de données',
    service: 'SIRH',
    competencesRequired: ['Paie', 'Reprise de données'],
    standardDuration: 3,
    mode: 'À distance',
    description: 'Migration des données de paie depuis l\'ancien système'
  },
  {
    id: '5',
    name: 'Formation SIGF Administrateurs',
    type: 'Formation',
    service: 'Finance',
    competencesRequired: ['SIGF', 'Formation'],
    standardDuration: 3,
    mode: 'Sur site',
    description: 'Formation des administrateurs du système SIGF'
  }
];

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArticle = (newArticle: Omit<Article, 'id'>) => {
    const article: Article = {
      ...newArticle,
      id: Date.now().toString()
    };
    setArticles([...articles, article]);
    setToastMessage('Article ajouté avec succès');
    setShowToast(true);
  };

  const handleEditArticle = (updatedArticle: Omit<Article, 'id'>) => {
    if (editingArticle) {
      setArticles(articles.map(a =>
        a.id === editingArticle.id ? { ...updatedArticle, id: editingArticle.id } : a
      ));
      setToastMessage('Article mis à jour');
      setShowToast(true);
      setEditingArticle(undefined);
    }
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setArticles(articles.filter(a => a.id !== id));
      setToastMessage('Article supprimé');
      setShowToast(true);
    }
  };

  const getModeColor = (mode: Article['mode']) => {
    switch (mode) {
      case 'Sur site':
        return 'bg-blue-100 text-blue-700';
      case 'À distance':
        return 'bg-green-100 text-green-700';
      case 'Hybride':
        return 'bg-purple-100 text-purple-700';
    }
  };

  const getTypeColor = (type: Article['type']) => {
    const colors: Record<Article['type'], string> = {
      'Installation': 'bg-orange-100 text-orange-700',
      'Paramétrage': 'bg-blue-100 text-blue-700',
      'Formation': 'bg-green-100 text-green-700',
      'Reprise de données': 'bg-purple-100 text-purple-700',
      'Support': 'bg-gray-100 text-gray-700',
      'Migration': 'bg-pink-100 text-pink-700'
    };
    return colors[type];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAddArticle(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un article</span>
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">{article.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-sm ${getTypeColor(article.type)}`}>
                    {article.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${getModeColor(article.mode)}`}>
                    {article.mode}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingArticle(article)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Service</div>
                <div className="text-gray-900">{article.service}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Compétences requises</div>
                <div className="flex flex-wrap gap-1">
                  {article.competencesRequired.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Durée standard</div>
                <div className="text-gray-900">{article.standardDuration} jour{article.standardDuration > 1 ? 's' : ''}</div>
              </div>

              {article.description && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Description</div>
                  <div className="text-gray-600 text-sm">{article.description}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Aucun article trouvé</div>
        </div>
      )}

      <ManageArticleModal
        isOpen={showAddArticle}
        onClose={() => setShowAddArticle(false)}
        onSave={handleAddArticle}
      />

      {editingArticle && (
        <ManageArticleModal
          isOpen={!!editingArticle}
          onClose={() => setEditingArticle(undefined)}
          onSave={handleEditArticle}
          article={editingArticle}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
