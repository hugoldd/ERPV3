import { Modal } from './Modal';
import { Calendar, TrendingUp, User, FileText, Edit } from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({ isOpen, onClose }: ProjectDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du projet - Client ABC" size="xl">
      <div className="space-y-6">
        {/* Project Info */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-gray-900 mb-2">Informations générales</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>Chef de projet : Jean Dupont</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Période : 15/06/2025 - 30/09/2025</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <TrendingUp className="w-4 h-4" />
                  <span>Type : Packagé</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          </div>
        </div>

        {/* Budget Details */}
        <div>
          <h3 className="text-gray-900 mb-4">Détails budgétaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm mb-1">Jours vendus</div>
              <div className="text-gray-900">35 jours</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm mb-1">Jours consommés</div>
              <div className="text-orange-600">18 jours (51%)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm mb-1">Jours restants</div>
              <div className="text-green-600">17 jours (49%)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm mb-1">Écarts internes</div>
              <div className="text-orange-600">+5 jours</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm mb-1">En attente d'avenant</div>
              <div className="text-blue-600">+13 jours</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-gray-600 text-sm mb-1">Budget total ajusté</div>
              <div className="text-gray-900">53 jours</div>
            </div>
          </div>
        </div>

        {/* Services Breakdown */}
        <div>
          <h3 className="text-gray-900 mb-4">Répartition par service</h3>
          <div className="space-y-3">
            {[
              { service: 'Service Technique', allocated: 8, consumed: 5, percentage: 63 },
              { service: 'Service SIRH', allocated: 15, consumed: 10, percentage: 67 },
              { service: 'Service Formation', allocated: 6, consumed: 3, percentage: 50 },
              { service: 'Service Data', allocated: 6, consumed: 0, percentage: 0 },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">{item.service}</span>
                  <span className="text-gray-700">{item.consumed} / {item.allocated} jours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.percentage > 75 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-gray-900 mb-4">Notes du projet</h3>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            placeholder="Ajoutez des notes sur le projet..."
            defaultValue="Projet d'implémentation SIRH complet. Client très réactif sur les prérequis. Attention à la formation : prévoir du temps supplémentaire pour les utilisateurs."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
