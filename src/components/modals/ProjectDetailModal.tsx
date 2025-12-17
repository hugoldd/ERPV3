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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Zone principale : lignes (prioritaire) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-gray-900 font-medium">Articles du projet</div>
                  <div className="text-gray-500 text-sm">
                    Planification, réalisation et reliquats (scission).
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    Total&nbsp;{formatMoneyEUR(totals.amount)}
                  </span>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700">
                    Reste&nbsp;{totals.remaining}
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowAddLine(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-6 text-gray-600">Chargement…</div>
              ) : errorMsg ? (
                <div className="p-6 text-red-700 bg-red-50 border-t border-red-200">{errorMsg}</div>
              ) : (
                <div className="max-h-[60vh] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700">Article</th>
                        <th className="px-4 py-3 text-left text-gray-700">Affectation</th>
                        <th className="px-4 py-3 text-left text-gray-700">Quantités</th>
                        <th className="px-4 py-3 text-right text-gray-700">Montant</th>
                        <th className="px-4 py-3 text-right text-gray-700">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {lines.map((l) => {
                        const sold = l.soldQuantity || 0;
                        const planned = l.plannedQuantity || 0;
                        const realized = l.realizedQuantity || 0;
                        const remaining = Math.max(0, sold - planned);
                        const pct = sold > 0 ? Math.min(100, Math.round((planned / sold) * 100)) : 0;

                        const canReport = planned > 0 && remaining > 0;

                        return (
                          <tr key={l.id} className="hover:bg-gray-50 transition-colors align-top">
                            {/* Article */}
                            <td className="px-4 py-3">
                              <div className="text-gray-900 font-medium">{l.articleName}</div>
                              {l.articleService ? (
                                <div className="mt-1 text-xs text-gray-500">{l.articleService}</div>
                              ) : null}
                            </td>

                            {/* Affectation */}
                            <td className="px-4 py-3">
                              <div className="text-gray-900">{l.consultantName || "Non attribuée"}</div>
                              <div className="mt-1 text-xs text-gray-500">
                                {l.plannedStartDate ? (
                                  <span>
                                    {l.plannedStartDate}
                                    {l.plannedEndDate && l.plannedEndDate !== l.plannedStartDate ? ` → ${l.plannedEndDate}` : ""}
                                  </span>
                                ) : (
                                  "Dates non définies"
                                )}
                              </div>
                            </td>

                            {/* Quantités (regroupées pour lisibilité) */}
                            <td className="px-4 py-3">
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                                <div className="text-gray-500">Vendu</div>
                                <div className="text-right text-gray-900">{sold}</div>

                                <div className="text-gray-500">Planifié</div>
                                <div className="text-right text-gray-900">{planned}</div>

                                <div className="text-gray-500">Réalisé</div>
                                <div className="text-right text-gray-900">{realized}</div>

                                <div className="text-gray-500">Reste</div>
                                <div className={`text-right ${remaining > 0 ? "text-amber-700" : "text-gray-900"}`}>
                                  {remaining}
                                </div>
                              </div>

                              <div className="mt-2">
                                <div className="h-1.5 bg-gray-100 rounded">
                                  <div className="h-1.5 bg-blue-600 rounded" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="mt-1 text-xs text-gray-500">{pct}% planifié</div>
                              </div>
                            </td>

                            {/* Montant */}
                            <td className="px-4 py-3 text-right text-gray-900 whitespace-nowrap">
                              {formatMoneyEUR(l.amount)}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {canReport && (
                                  <button
                                    type="button"
                                    onClick={() => void handleReport(l)}
                                    className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                                    title="Scinder (reporter le reliquat)"
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

                  {lines.length === 0 && (
                    <div className="py-10 text-center text-gray-500">Aucune ligne pour ce projet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panneau latéral : infos projet/client (compact, secondaire) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-500">Client</div>
                  <div className="text-gray-900 font-medium">
                    {project.clientNumber} — {project.clientName}
                  </div>
                </div>

                <div className={`inline-flex px-3 py-1 rounded-full text-xs ${statusBadge(project.status)}`}>
                  {statusLabel(project.status)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Commercial</div>
                  <div className="text-gray-900">{project.commercialName || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Directeur de projet</div>
                  <div className="text-gray-900">{project.projectManagerName || "Non affecté"}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Date commande</div>
                    <div className="text-gray-900">{project.orderDate || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Type de vente</div>
                    <div className="text-gray-900">{project.salesType || "—"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Interlocuteur</div>
                  <div className="text-gray-900">{contactLine}</div>
                </div>

                <details className="pt-2 border-t border-gray-200">
                  <summary className="text-xs text-gray-600 cursor-pointer select-none">
                    Coordonnées client
                  </summary>
                  <div className="mt-2 text-sm text-gray-700">
                    {project.clientAddress || "—"}
                  </div>
                </details>
              </div>
            </div>
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
