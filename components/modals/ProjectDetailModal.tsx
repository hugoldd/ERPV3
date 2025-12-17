import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2, SplitSquareVertical } from "lucide-react";
import { Modal } from "./Modal";
import type { Article, Consultant, Project, ProjectLine } from "../../types";
import {
  createProjectLine,
  deleteProjectLine,
  fetchProjectLines,
  reportProjectLineRemainder,
  updateProjectLine,
  type ProjectLineUpsertInput,
} from "../../api/projects";
import { Toast } from "../Toast";
import { ManageProjectLineModal } from "./ManageProjectLineModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  articles: Article[];
  consultants: Consultant[];
}

function formatMoneyEUR(n: number): string {
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n || 0);
  } catch {
    return `${(n || 0).toFixed(2)} €`;
  }
}

function statusLabel(status: Project["status"]): string {
  const map: Record<Project["status"], string> = {
    devis_en_cours: "Devis en cours",
    commande_receptionnee: "Commande réceptionnée",
    attente_affectation_dp: "En attente d'affectation de DP",
    en_cours_deploiement: "En cours de déploiement",
    facture: "Facturé",
    paye: "Payé",
    termine: "Terminé",
  };
  return map[status] ?? status;
}

function statusBadge(status: Project["status"]): string {
  const map: Record<Project["status"], string> = {
    devis_en_cours: "bg-gray-100 text-gray-700",
    commande_receptionnee: "bg-blue-50 text-blue-700",
    attente_affectation_dp: "bg-amber-50 text-amber-700",
    en_cours_deploiement: "bg-indigo-50 text-indigo-700",
    facture: "bg-purple-50 text-purple-700",
    paye: "bg-green-50 text-green-700",
    termine: "bg-green-100 text-green-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function ProjectDetailModal({ isOpen, onClose, project, articles, consultants }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lines, setLines] = useState<ProjectLine[]>([]);

  const [showAddLine, setShowAddLine] = useState(false);
  const [editingLine, setEditingLine] = useState<ProjectLine | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchProjectLines(project.id);
      setLines(data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void refresh();
  }, [isOpen, project.id]);

  const totals = useMemo(() => {
    const amount = lines.reduce((s, l) => s + (l.amount || 0), 0);
    const sold = lines.reduce((s, l) => s + (l.soldQuantity || 0), 0);
    const planned = lines.reduce((s, l) => s + (l.plannedQuantity || 0), 0);
    const realized = lines.reduce((s, l) => s + (l.realizedQuantity || 0), 0);
    return {
      amount,
      sold,
      planned,
      realized,
      remaining: Math.max(0, sold - planned),
    };
  }, [lines]);

  const handleCreateLine = async (payload: ProjectLineUpsertInput) => {
    await createProjectLine(project.id, payload);
    await refresh();
    setToastMessage("Ligne ajoutée");
    setShowToast(true);
  };

  const handleUpdateLine = async (payload: ProjectLineUpsertInput) => {
    if (!editingLine) return;
    await updateProjectLine(editingLine.id, payload);
    await refresh();
    setEditingLine(undefined);
    setToastMessage("Ligne mise à jour");
    setShowToast(true);
  };

  const handleDeleteLine = async (id: string) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    await deleteProjectLine(id);
    await refresh();
    setToastMessage("Ligne supprimée");
    setShowToast(true);
  };

  const handleReport = async (line: ProjectLine) => {
    if (!confirm("Créer une nouvelle ligne avec le reliquat non planifié ?")) return;
    await reportProjectLineRemainder(line.id);
    await refresh();
    setToastMessage("Reliquat reporté");
    setShowToast(true);
  };

  const contactLine = useMemo(() => {
    const parts = [project.clientContactName, project.clientContactEmail, project.clientContactPhone].filter(Boolean);
    return parts.length ? parts.join(" • ") : "—";
  }, [project]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="xl">
        <div className="space-y-6">
          {/* Encart projet */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">Client</div>
                <div className="text-gray-900">
                  {project.clientNumber} — {project.clientName}
                </div>
                <div className="text-gray-600 text-sm">{project.clientAddress || "—"}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Interlocuteur</div>
                <div className="text-gray-900">{contactLine}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Commercial</div>
                <div className="text-gray-900">{project.commercialName || "—"}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Directeur de projet</div>
                <div className="text-gray-900">{project.projectManagerName || "Non affecté"}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Commande</div>
                <div className="text-gray-900">{project.orderDate || "—"}</div>
                <div className="text-gray-600 text-sm">{project.salesType || "—"}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">État</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm ${statusBadge(project.status)}`}>
                  {statusLabel(project.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Synthèse */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Montant total</div>
              <div className="text-gray-900">{formatMoneyEUR(totals.amount)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Qté vendue</div>
              <div className="text-gray-900">{totals.sold}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Qté planifiée</div>
              <div className="text-gray-900">{totals.planned}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Qté réalisée</div>
              <div className="text-gray-900">{totals.realized}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Reste à planifier</div>
              <div className="text-gray-900">{totals.remaining}</div>
            </div>
          </div>

          {/* Lignes */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-gray-900">Lignes (articles)</div>
                <div className="text-gray-500 text-sm">Planification et suivi par prestation vendue</div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLine(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter une ligne
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-gray-600">Chargement…</div>
            ) : errorMsg ? (
              <div className="p-6 text-red-700 bg-red-50 border-t border-red-200">{errorMsg}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">Article</th>
                      <th className="px-4 py-3 text-right text-gray-700">Qté vendue</th>
                      <th className="px-4 py-3 text-right text-gray-700">Montant</th>
                      <th className="px-4 py-3 text-left text-gray-700">Ressource</th>
                      <th className="px-4 py-3 text-left text-gray-700">Dates prévues</th>
                      <th className="px-4 py-3 text-right text-gray-700">Qté planifiée</th>
                      <th className="px-4 py-3 text-right text-gray-700">Qté réalisée</th>
                      <th className="px-4 py-3 text-right text-gray-700">Reste</th>
                      <th className="px-4 py-3 text-right text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lines.map((l) => {
                      const remaining = Math.max(0, (l.soldQuantity || 0) - (l.plannedQuantity || 0));
                      const canReport = (l.plannedQuantity || 0) > 0 && remaining > 0;
                      return (
                        <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-900">
                            <div className="text-gray-900">{l.articleName}</div>
                            <div className="text-xs text-gray-500">{l.articleService || ""}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">{l.soldQuantity}</td>
                          <td className="px-4 py-3 text-right text-gray-900">{formatMoneyEUR(l.amount)}</td>
                          <td className="px-4 py-3 text-gray-700">{l.consultantName || "—"}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {l.plannedStartDate ? (
                              <span>
                                {l.plannedStartDate}
                                {l.plannedEndDate && l.plannedEndDate !== l.plannedStartDate ? ` → ${l.plannedEndDate}` : ""}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">{l.plannedQuantity}</td>
                          <td className="px-4 py-3 text-right text-gray-900">{l.realizedQuantity}</td>
                          <td className="px-4 py-3 text-right text-gray-900">{remaining}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {canReport && (
                                <button
                                  type="button"
                                  onClick={() => void handleReport(l)}
                                  className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                                  title="Reporter le reliquat"
                                >
                                  <SplitSquareVertical className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingLine(l)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteLine(l.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {lines.length === 0 && <div className="py-10 text-center text-gray-500">Aucune ligne pour ce projet</div>}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ManageProjectLineModal
        isOpen={showAddLine}
        onClose={() => setShowAddLine(false)}
        onSave={handleCreateLine}
        articles={articles}
        consultants={consultants}
      />

      {editingLine && (
        <ManageProjectLineModal
          isOpen={!!editingLine}
          onClose={() => setEditingLine(undefined)}
          onSave={handleUpdateLine}
          articles={articles}
          consultants={consultants}
          line={editingLine}
        />
      )}

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
}
