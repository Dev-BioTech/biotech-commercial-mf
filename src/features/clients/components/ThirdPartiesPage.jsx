import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, ChevronLeft, ChevronRight, Users, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import alertService from "@/shared/utils/alertService";
import { useThirdParties } from "@/features/clients/hooks/useThirdParties";
import { commercialService } from "@/shared/services/commercialService";

export default function ThirdPartiesPage() {
  const { thirdParties, loading, error, refetch, setFilters } = useThirdParties();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    identityDocument: "",
    phone: "",
    email: "",
    address: "",
    isSupplier: false,
    isCustomer: false,
    isEmployee: false,
    isVeterinarian: false,
  });

  const [saving, setSaving] = useState(false);

  // Derive farmId from auth-storage for creation
  const getFarmId = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      return auth?.state?.selectedFarm?.id || null;
    } catch {
      return null;
    }
  };

  const handleOpenModal = (party = null) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        fullName: party.fullName || "",
        identityDocument: party.identityDocument || "",
        phone: party.phone || "",
        email: party.email || "",
        address: party.address || "",
        isSupplier: party.isSupplier || false,
        isCustomer: party.isCustomer || false,
        isEmployee: party.isEmployee || false,
        isVeterinarian: party.isVeterinarian || false,
      });
    } else {
      setEditingParty(null);
      setFormData({
        fullName: "",
        identityDocument: "",
        phone: "",
        email: "",
        address: "",
        isSupplier: false,
        isCustomer: false,
        isEmployee: false,
        isVeterinarian: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingParty(null);
  };

  const validateForm = () => {
    // Nombre
    if (!formData.fullName.trim()) {
      return "El nombre es obligatorio.";
    }
    
    // Documento
    const docRegex = /^[0-9]+$/;
    if (!formData.identityDocument.trim()) {
      return "El documento es obligatorio.";
    }
    if (!docRegex.test(formData.identityDocument)) {
      return "El documento sólo debe contener números positivos.";
    }
    
    // Teléfono
    if (formData.phone) {
      const phoneRegex = /^[0-9+() -]+$/;
      if (!phoneRegex.test(formData.phone)) {
        return "El teléfono sólo debe contener números y símbolos válidos (+, -, ()).";
      }
    }
    
    // Email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return "El correo electrónico no es válido (debe incluir @ y dominio).";
      }
    }
    
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
        ...formData,
        farmId: farmId
      };

      if (editingParty) {
        await commercialService.updateThirdParty(editingParty.id, payload);
        alertService.success("Tercero actualizado exitosamente.", "¡Actualizado!");
      } else {
        await commercialService.createThirdParty(payload);
        alertService.success("Tercero creado exitosamente.", "¡Creado!");
      }
      
      handleCloseModal();
      refetch(); // Reload the list
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Error al guardar el tercero";
      alertService.error(errMsg, "Oops...");
    } finally {
      setSaving(false);
    }
  };

  // Filter local items by name or document
  const filteredParties = thirdParties
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        (p.fullName && p.fullName.toLowerCase().includes(term)) ||
        (p.identityDocument && p.identityDocument.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0)); 

  const totalPages = Math.max(1, Math.ceil(filteredParties.length / itemsPerPage));
  const paginatedParties = filteredParties.slice(
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
            backgroundImage: `url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop')`,
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
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-emerald-300" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Directorio de Terceros
                  </h1>
                </div>
                <p className="text-emerald-100/90 max-md:text-sm md:text-lg max-w-xl font-medium">
                  Gestiona fácilmente tus clientes, proveedores, empleados y veterinarios en un solo lugar.
                </p>
              </div>

              <div className="flex max-sm:flex-col sm:flex-row gap-3 max-sm:w-full w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenModal()}
                  className="flex justify-center items-center gap-2 max-sm:w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] border border-emerald-400/50 font-bold max-sm:py-3 sm:py-2.5 px-5 rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Tercero
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats/Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 text-sm">
             {/* Note: In a real app we could use local or remote filters here via setFilters */}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando terceros...</div>
        ) : filteredParties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron terceros. Crea uno nuevo para empezar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Nombre</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Documento</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Contacto</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Roles</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedParties.map((party) => (
                  <tr key={party.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{party.fullName || "— (Sin nombre)"}</td>
                    <td className="px-6 py-4 text-gray-500">{party.identityDocument || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{party.email || "—"}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{party.phone || "— (Sin contacto)"}</div>
                    </td>
                    <td className="px-6 py-4 flex gap-1 flex-wrap">
                      {party.isCustomer && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">Cliente</span>
                      )}
                      {party.isSupplier && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">Proveedor</span>
                      )}
                      {party.isEmployee && (
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">Empleado</span>
                      )}
                      {party.isVeterinarian && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">Veterinario</span>
                      )}
                      {!party.isCustomer && !party.isSupplier && !party.isEmployee && !party.isVeterinarian && (
                         <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(party)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredParties.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredParties.length)} de {filteredParties.length} registros
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

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingParty ? "Editar Tercero" : "Nuevo Tercero"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="third-party-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo / Razón Social *</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documento (NIT/CC) *</label>
                    <input
                      required
                      type="text"
                      disabled={!!editingParty}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={formData.identityDocument}
                      onChange={(e) => {
                         // Permitir solo números y que no sea negativo (aunque sea texto)
                         const val = e.target.value.replace(/[^0-9]/g, '');
                         setFormData({...formData, identityDocument: val});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      value={formData.phone}
                      onChange={(e) => {
                         const val = e.target.value.replace(/[^0-9+\-() ]/g, '');
                         setFormData({...formData, phone: val});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Roles del Tercero</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isCustomer} 
                        onChange={(e) => setFormData({...formData, isCustomer: e.target.checked})}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Cliente (Ventas)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isSupplier} 
                        onChange={(e) => setFormData({...formData, isSupplier: e.target.checked})}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Proveedor (Compras)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isEmployee} 
                        onChange={(e) => setFormData({...formData, isEmployee: e.target.checked})}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Empleado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isVeterinarian} 
                        onChange={(e) => setFormData({...formData, isVeterinarian: e.target.checked})}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Veterinario</span>
                    </label>
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
                form="third-party-form"
                type="submit" 
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Tercero"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
