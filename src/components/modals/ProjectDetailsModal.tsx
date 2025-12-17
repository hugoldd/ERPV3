
import type { Article, Consultant, Project } from "../../types";
import { Modal } from "./Modal";
import { ProjectDetailModal } from "./ProjectDetailModal";

type LegacyProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FullProps = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  articles: Article[];
  consultants: Consultant[];
};

type Props = LegacyProps | FullProps;

/**
 * Compatibilité : certains widgets (ex: Dashboard/ProjectSummary) ouvrent encore
 * un modal "ProjectDetailsModal" sans disposer des données nécessaires.
 *
 * - Si les props complètes sont fournies => on affiche la vraie fiche Projet (ProjectDetailModal).
 * - Sinon => on affiche un placeholder propre (évite crash + build OK).
 */
export function ProjectDetailsModal(props: Props) {
  const { isOpen, onClose } = props;

  if ("project" in props) {
    return (
      <ProjectDetailModal
        isOpen={isOpen}
        onClose={onClose}
        project={props.project}
        articles={props.articles}
        consultants={props.consultants}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du projet" size="xl">
      <div className="p-6">
        <div className="text-gray-900 font-medium">Cette vue a été remplacée par le module Projets.</div>
        <div className="mt-2 text-gray-600">
          Ouvrez un projet depuis le portefeuille pour afficher la fiche complète (articles, planification, reliquats).
        </div>

        <div className="mt-6 flex justify-end">
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
