import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { AdministrationPage } from "./pages/AdministrationPage";
import { PlanningPage } from "./pages/PlanningPage";
import { ReportingPage } from "./pages/ReportingPage";
import { supabase } from "./lib/supabase";

export type NavigationPage =
  | "portfolio"
  | "planning"
  | "resources"
  | "articles"
  | "reporting"
  | "administration";

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>("portfolio");
  const [supabaseStatus, setSupabaseStatus] = useState<
    "checking" | "ok" | "error"
  >("checking");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 1) Test session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        console.log("Supabase session:", sessionData.session);

        // 2) Optionnel : récupérer le user (utile pour la suite org/memberships)
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          // getUser peut échouer si pas de session : ce n'est pas bloquant
          console.log("Supabase getUser (non bloquant):", userError.message);
        } else {
          console.log("Supabase user:", userData.user);
        }

        setSupabaseStatus("ok");
        setSupabaseError(null);
      } catch (e: any) {
        console.error("Supabase init error:", e);
        setSupabaseStatus("error");
        setSupabaseError(e?.message ?? "Erreur Supabase inconnue.");
      }
    })();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "portfolio":
        return <PortfolioPage />;
      case "planning":
        return <PlanningPage />;
      case "resources":
        return <ResourcesPage />;
      case "articles":
        return <ArticlesPage />;
      case "reporting":
        return <ReportingPage />;
      case "administration":
        return <AdministrationPage />;
      default:
        return <PortfolioPage />;
    }
  };

  // Si Supabase n'est pas correctement initialisé, on affiche une alerte claire
  // (cela évite de poursuivre avec des écrans qui feront des requêtes)
  if (supabaseStatus === "error") {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white border rounded-lg p-6">
          <h1 className="text-lg font-semibold text-gray-900">
            Configuration Supabase invalide
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Vérifiez que le fichier <code className="px-1 py-0.5 bg-gray-100 rounded">.env</code> est bien à la racine
            du projet et contient <code className="px-1 py-0.5 bg-gray-100 rounded">VITE_SUPABASE_URL</code> et{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">VITE_SUPABASE_ANON_KEY</code>, puis redémarrez{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">npm run dev</code>.
          </p>
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {supabaseError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar currentPage={currentPage} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Optionnel : badge discret tant que Supabase est en test */}
          {supabaseStatus === "checking" && (
            <div className="px-4 py-2 text-sm text-gray-600 border-b bg-white">
              Connexion à Supabase…
            </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
