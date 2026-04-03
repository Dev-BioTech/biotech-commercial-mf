import { useState, useEffect } from "react";
import { LayoutDashboard, ReceiptText, Users as UsersIcon } from "lucide-react";
import CommercialDashboard from "@/features/dashboard/components/CommercialDashboard";
import TransactionsPage from "@/features/sales/components/TransactionsPage";
import ThirdPartiesPage from "@/features/clients/components/ThirdPartiesPage";
import { commercialService } from "@/shared/services/commercialService";

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "transactions", label: "Transacciones", Icon: ReceiptText },
  { id: "third-parties", label: "Terceros", Icon: UsersIcon },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [counts, setCounts] = useState({
    transactions: null,
    "third-parties": null,
  });

  const getFarmId = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      return auth?.state?.selectedFarm?.id || null;
    } catch {
      return null;
    }
  };

  const fetchCounts = async () => {
    const farmId = getFarmId();
    if (!farmId) return;

    try {
      const [trans, clients] = await Promise.all([
        commercialService.getTransactions().catch(() => []),
        commercialService.getThirdParties().catch(() => []),
      ]);
      setCounts({
        transactions: Array.isArray(trans) ? trans.length : 0,
        "third-parties": Array.isArray(clients) ? clients.length : 0,
      });
    } catch (e) {
      console.warn("[App] Error fetching counts", e);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Escuchar cambios de granja del shell
    const handleAuthChange = () => fetchCounts();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
              }`}
            >
              <tab.Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-600" : "text-gray-400"}`} />
              {tab.label}
              {counts[tab.id] !== undefined && counts[tab.id] !== null && (
                <span
                  className={`ml-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    activeTab === tab.id
                      ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Page Content */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {activeTab === "dashboard" && (
          <CommercialDashboard onNavigate={setActiveTab} />
        )}
        {activeTab === "transactions" && <TransactionsPage />}
        {activeTab === "third-parties" && <ThirdPartiesPage />}
      </div>
    </div>
  );
}

export default App;
