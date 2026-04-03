import React, { useState, useEffect } from "react";
import { Plus, Search, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Receipt, Activity, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import alertService from "@/shared/utils/alertService";
import { useTransactions } from "@/features/sales/hooks/useTransactions";
import { useThirdParties } from "@/features/clients/hooks/useThirdParties";
import { commercialService } from "@/shared/services/commercialService";

export default function TransactionsPage() {
  const { transactions, loading, error, refetch } = useTransactions();
  const { thirdParties } = useThirdParties();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Form State
  const [formData, setFormData] = useState({
    thirdPartyId: "",
    transactionType: 0, // 0: PURCHASE, 1: SALE
    transactionDate: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    subtotal: "",
    taxes: "",
    discounts: "",
    paymentStatus: 0, // 0: PENDING
    observations: ""
  });

  const [saving, setSaving] = useState(false);

  const getFarmId = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      return auth?.state?.selectedFarm?.id || null;
    } catch {
      return null;
    }
  };

  const handleOpenModal = () => {
    setFormData({
      thirdPartyId: "",
      transactionType: 1, // Default to SALE
      transactionDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      subtotal: "",
      taxes: "",
      discounts: "",
      paymentStatus: 0,
      observations: ""
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const validateForm = () => {
    const subVal = Number(formData.subtotal) || 0;
    const taxesVal = Number(formData.taxes) || 0;
    const discountsVal = Number(formData.discounts) || 0;
    
    if (subVal < 0) return "El subtotal no puede ser negativo.";
    if (taxesVal < 0) return "Los impuestos no pueden ser negativos.";
    if (discountsVal < 0) return "Los descuentos no pueden ser negativos.";
    
    const taxAmount = subVal * (taxesVal / 100);
    const discountAmount = subVal * (discountsVal / 100);
    const total = subVal + taxAmount - discountAmount;
    if (total < 0) return "El total no puede ser negativo, verifica los descuentos.";
    
    // Check for duplicate invoice numbers
    if (formData.invoiceNumber && formData.invoiceNumber.trim() !== "") {
      const exists = transactions.some(
        (t) => t.invoiceNumber === formData.invoiceNumber.trim()
      );
      if (exists) {
        return `El número de factura "${formData.invoiceNumber}" ya se encuentra registrado en otra transacción.`;
      }
    }
    
    // Date
    if (!formData.transactionDate) return "La fecha de transacción es obligatoria.";
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alertService.warning(validationError, "Atención");
      return;
    }
    
    setSaving(true);
    
    try {
      const farmId = getFarmId();
      if (!farmId) {
        throw new Error("No hay una granja seleccionada en el contexto.");
      }

      const payload = {
        farmId,
        thirdPartyId: formData.thirdPartyId ? Number(formData.thirdPartyId) : null,
        transactionType: Number(formData.transactionType),
        transactionDate: new Date(formData.transactionDate).toISOString(),
        invoiceNumber: formData.invoiceNumber || null,
        subtotal: Number(formData.subtotal),
        taxes: Number(formData.subtotal) * (Number(formData.taxes) / 100),
        discounts: Number(formData.subtotal) * (Number(formData.discounts) / 100),
        paymentStatus: Number(formData.paymentStatus),
        observations: formData.observations || null,
        animalDetails: [],
        productDetails: []
      };

      await commercialService.createTransaction(payload);
      
      alertService.success("Transacción registrada exitosamente.", "¡Registrada!");
      handleCloseModal();
      refetch(); // Reload the list
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Error al guardar la transacción";
      alertService.error(errMsg, "Oops...");
    } finally {
      setSaving(false);
    }
  };

  // Safe parse thirdParty ID and find name
  const getThirdPartyName = (id) => {
    if (id === null || id === undefined) return "—";
    const party = thirdParties.find(p => String(p.id) === String(id));
    if (party) {
      return party.fullName || `Tercero (ID: ${id})`;
    }
    return `ID desconocido: ${id}`;
  };

  const filteredTransactions = transactions
    .filter((t) => {
      // 1. Mostrar solo transacciones con tercero válido
      const hasParty = t.thirdPartyId && thirdParties.some(p => String(p.id) === String(t.thirdPartyId));
      if (!hasParty) return false;

      // 2. Aplicar búsqueda
      const term = searchTerm.toLowerCase();
      const descMatches = (t.observations || t.description || "").toLowerCase().includes(term);
      const invoiceMatches = (t.invoiceNumber || "").toLowerCase().includes(term);
      return descMatches || invoiceMatches;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a.transactionDate || a.createdAt);
      const dateB = new Date(b.date || b.transactionDate || b.createdAt);
      if (dateB - dateA !== 0) return dateB - dateA;
      return (b.id || 0) - (a.id || 0); // Estabilidad extra
    });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl group shadow-[0_15px_40px_-10px_rgba(16,185,129,0.3)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="relative max-md:min-h-[180px] md:h-48 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2670&auto=format&fit=crop')`,
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
                    <Receipt className="w-6 h-6 md:w-8 md:h-8 text-emerald-300" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Libro de Transacciones
                  </h1>
                </div>
                <p className="text-emerald-100/90 max-md:text-sm md:text-lg max-w-xl font-medium">
                  Registra compras, ventas y controla el flujo operativo de tu granja.
                </p>
              </div>

              <div className="flex max-sm:flex-col sm:flex-row gap-3 max-sm:w-full w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenModal}
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descripción o factura..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="flex gap-12">
                   <div className="h-4 w-24 bg-gray-100 rounded" />
                   <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron transacciones.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Fecha / Factura</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Tercero</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Descripción</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedTransactions.map((t) => {
                  const isSale = t.transactionType === 1 || t.transactionType === "SALE" || t.transactionType === "Sale";
                  const total = t.netTotal ?? t.totalAmount ?? t.amount ?? ((t.subtotal || 0) + (t.taxes || 0) - (t.discounts || 0));
                  
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {new Date(t.date || t.transactionDate || t.createdAt).toLocaleDateString("es-CO")}
                        </div>
                        {t.invoiceNumber && (
                          <div className="text-gray-500 text-xs mt-0.5">Factura: {t.invoiceNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isSale ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {isSale ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {isSale ? "Venta" : "Compra"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const party = thirdParties.find(
                            (p) => String(p.id) === String(t.thirdPartyId),
                          );
                          if (!t.thirdPartyId)
                            return <span className="text-gray-400">—</span>;
                          return (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {party?.fullName || `ID: ${t.thirdPartyId}`}
                              </span>
                              {party && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {party.isCustomer && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 uppercase">
                                      Cliente
                                    </span>
                                  )}
                                  {party.isSupplier && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-blue-50 text-blue-600 font-bold border border-blue-100 uppercase">
                                      Proveedor
                                    </span>
                                  )}
                                  {party.isEmployee && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-amber-50 text-amber-600 font-bold border border-amber-100 uppercase">
                                      Empleado
                                    </span>
                                  )}
                                  {party.isVeterinarian && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-purple-50 text-purple-600 font-bold border border-purple-100 uppercase">
                                      Veterinario
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                        {t.observations || t.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-900">
                          ${total.toLocaleString("es-CO")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} registros
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Moda CREATE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Nueva Transacción</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transacción *</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.transactionType}
                      onChange={(e) => setFormData({...formData, transactionType: e.target.value})}
                    >
                      <option value={1}>Venta (Ingreso)</option>
                      <option value={0}>Compra (Egreso)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.transactionDate}
                      onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tercero (Cliente/Proveedor)</label>
                    <select
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.thirdPartyId}
                      onChange={(e) => setFormData({...formData, thirdPartyId: e.target.value})}
                    >
                      <option value="">-- Seleccionar --</option>
                      {thirdParties.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.identityDocument || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Documento / Factura</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                        value={formData.subtotal}
                        onChange={(e) => setFormData({...formData, subtotal: e.target.value === "" ? "" : parseFloat(Math.max(0, e.target.value))})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impuestos (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          className="w-full pl-4 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                          value={formData.taxes}
                          onChange={(e) => setFormData({...formData, taxes: e.target.value === "" ? "" : parseFloat(Math.max(0, e.target.value))})}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descuentos (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          className="w-full pl-4 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                          value={formData.discounts}
                          onChange={(e) => setFormData({...formData, discounts: e.target.value === "" ? "" : parseFloat(Math.max(0, e.target.value))})}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Calculado</label>
                    <div className="text-2xl font-bold border-b pb-2 text-gray-900 border-gray-200">
                      ${(
                        Number(formData.subtotal) + 
                        (Number(formData.subtotal) * (Number(formData.taxes) / 100)) - 
                        (Number(formData.subtotal) * (Number(formData.discounts) / 100))
                      ).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={formData.observations}
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-50 flex justify-end gap-3 bg-gray-50/50">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                form="transaction-form"
                type="submit" 
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Registrar Transacción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
