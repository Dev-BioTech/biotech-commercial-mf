import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Briefcase,
  Activity,
  BarChart,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { useTransactions } from "@/features/sales/hooks/useTransactions";
import { useThirdParties } from "@/features/clients/hooks/useThirdParties";

export function CommercialDashboard({ onNavigate }) {
  const { transactions, loading: loadingTrans } = useTransactions();
  const { thirdParties, loading: loadingClients } = useThirdParties();

  const validTransactions = transactions.filter((t) => {
    // Solo mostramos transacciones si tienen un 'thirdPartyId' y dicho tercero existe en nuestra base
    return t.thirdPartyId && thirdParties.some(p => String(p.id) === String(t.thirdPartyId));
  });

  const totalSales = validTransactions
    .filter(
      (t) =>
        t.transactionType === 1 ||
        t.transactionType === "SALE" ||
        t.transactionType === "Sale",
    )
    .reduce(
      (acc, t) => acc + (t.netTotal ?? t.totalAmount ?? t.amount ?? 0),
      0,
    );

  const totalPurchases = validTransactions
    .filter(
      (t) =>
        t.transactionType === 0 ||
        t.transactionType === "PURCHASE" ||
        t.transactionType === "Purchase",
    )
    .reduce(
      (acc, t) => acc + (t.netTotal ?? t.totalAmount ?? t.amount ?? 0),
      0,
    );

  const clientCount = thirdParties.filter((c) => c.isCustomer).length;
  const employeeCount = thirdParties.filter((c) => c.isEmployee).length;
  const vetCount = thirdParties.filter((c) => c.isVeterinarian).length;

  const recent = [...validTransactions]
    .sort((a, b) => {
      const dateA = new Date(a.transactionDate ?? a.createdAt);
      const dateB = new Date(b.transactionDate ?? b.createdAt);
      if (dateB - dateA !== 0) return dateB - dateA;
      return (b.id || 0) - (a.id || 0); // Estabilidad: ID descendente
    })
    .slice(0, 5);

  const isEmpty = !loadingTrans && validTransactions.length === 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl group shadow-[0_15px_40px_-10px_rgba(16,185,129,0.3)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="relative max-md:min-h-[180px] md:h-52 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1579621970588-a3f5ce599fac?q=80&w=2670&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-teal-900/90 to-emerald-800/80" />
          <div className="relative h-full flex flex-col justify-center max-md:px-6 md:px-10 max-md:py-8 md:py-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex max-md:flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-emerald-400/20 rounded-xl backdrop-blur-md">
                    <BarChart className="w-6 h-6 md:w-8 md:h-8 text-emerald-300" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Dashboard Comercial
                  </h1>
                </div>
                <p className="text-emerald-100/90 max-md:text-sm md:text-lg max-w-xl font-medium">
                  Control financiero e indicadores en tiempo real de tu operación agropecuaria.
                </p>
              </div>

              <div className="flex max-sm:flex-col sm:flex-row gap-3 max-sm:w-full w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate?.("third-parties")}
                  className="flex justify-center items-center gap-2 max-sm:w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white shadow-lg font-bold max-sm:py-3 sm:py-2.5 px-5 rounded-xl transition-all"
                >
                  <Users className="w-5 h-5" />
                  Directorio Terceros
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate?.("transactions")}
                  className="flex justify-center items-center gap-2 max-sm:w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] border border-emerald-400/50 font-bold max-sm:py-3 sm:py-2.5 px-5 rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Transacción
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards & Balance (Mosaico) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Balance principal */}
        <div className="lg:col-span-1 flex flex-col h-full">
          {loadingTrans ? (
            <div className="bg-gray-100 rounded-3xl h-full min-h-[180px] p-6 animate-pulse border border-emerald-50" />
          ) : (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/20 overflow-hidden relative flex-1 flex flex-col justify-center"
            >
              {/* Background decors */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
                <Target size={160} />
              </div>
              <div className="absolute bottom-0 left-0 p-4 opacity-5 pointer-events-none transform -translate-x-4 translate-y-4">
                <DollarSign size={80} />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg mb-4 border border-white/10">
                  <Activity className="w-4 h-4 text-emerald-100" />
                  <span className="text-emerald-50 text-xs font-bold uppercase tracking-wider">
                    Balance Neto General
                  </span>
                </div>
                <p className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm mb-2">
                  ${(totalSales - totalPurchases).toLocaleString("es-CO")}
                </p>
                <div className="flex items-center gap-2 mt-4 mt-auto">
                  <div className={`w-2 h-2 rounded-full ${totalSales >= totalPurchases ? 'bg-green-300' : 'bg-red-400'} animate-pulse`}></div>
                  <p className="text-emerald-100/90 text-sm uppercase tracking-widest font-bold">
                    {totalSales >= totalPurchases
                      ? "Operación en positivo"
                      : "Déficit operativo"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Minikpis grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {loadingTrans || loadingClients ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-[150px] animate-pulse"
              />
            ))
          ) : (
            <>
              <KpiCard
                title="Total Ingresos"
                value={`$${totalSales.toLocaleString("es-CO")}`}
                icon={<TrendingUp size={22} />}
                color="emerald"
              />
              <KpiCard
                title="Total Egresos"
                value={`$${totalPurchases.toLocaleString("es-CO")}`}
                icon={<ShoppingCart size={22} />}
                color="red"
              />
              <KpiCard
                title="Cartera de Clientes"
                value={clientCount}
                icon={<Users size={22} />}
                color="blue"
              />
              <KpiCard
                title="Equipo Trabajo"
                value={employeeCount}
                icon={<Briefcase size={22} />}
                color="amber"
              />
              <KpiCard
                title="Veterinarios"
                value={vetCount}
                icon={<Activity size={22} />}
                color="purple"
              />
            </>
          )}
        </div>
      </motion.div>

      {/* Recent transactions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-50/80 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            Últimas Transacciones
          </h2>
          {validTransactions.length > 0 && (
            <button
              onClick={() => onNavigate?.("transactions")}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todas →
            </button>
          )}
        </div>

        {loadingTrans ? (
          <LoadingSkeleton rows={4} />
        ) : isEmpty ? (
          <EmptyState
            icon="💳"
            title="Sin transacciones"
            description="Aún no hay transacciones registradas para esta granja."
            action="Nueva Transacción"
            onAction={() => onNavigate?.("transactions")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tercero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((t) => {
                  const isSale =
                    t.transactionType === 1 ||
                    t.transactionType === "SALE" ||
                    t.transactionType === "Sale";
                  const party = thirdParties.find(
                    (p) => String(p.id) === String(t.thirdPartyId),
                  );

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(
                          t.transactionDate ?? t.createdAt,
                        ).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {party?.fullName || (t.thirdPartyId ? "Tercero desconocido" : "—")}
                          </span>
                          {party && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {party.isCustomer && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                                  Cliente
                                </span>
                              )}
                              {party.isEmployee && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                                  Empleado
                                </span>
                              )}
                              {party.isVeterinarian && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 font-bold border border-purple-100">
                                  Veterinario
                                </span>
                              )}
                              {party.isSupplier && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                                  Proveedor
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[150px]">
                            {t.description ?? t.notes ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isSale
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {isSale ? "VENTA" : "COMPRA"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        $
                        {(
                          t.netTotal ??
                          t.totalAmount ??
                          t.amount ??
                          0
                        ).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function KpiCard({ title, value, icon, color, loading }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    red: "bg-red-50 text-red-600 group-hover:bg-red-100",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  };
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 group transition-all duration-300 hover:shadow-md"
    >
      <div className={`inline-flex p-3 rounded-2xl ${colors[color]} mb-4 transition-colors`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      {loading ? (
        <div className="h-8 bg-gray-100 rounded-lg animate-pulse mt-2 w-24" />
      ) : (
        <p className="text-2xl font-black text-gray-800 mt-1 truncate" title={value}>{value}</p>
      )}
    </motion.div>
  );
}

function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-gray-900 font-semibold text-lg mb-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} /> {action}
        </button>
      )}
    </div>
  );
}

export default CommercialDashboard;
