import Swal from "sweetalert2";

// Custom base configuration
const baseConfig = {
  customClass: {
    popup: "biotech-alert-popup",
    title: "biotech-alert-title",
    htmlContainer: "biotech-alert-text",
    confirmButton: "biotech-alert-confirm",
    cancelButton: "biotech-alert-cancel",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  allowEscapeKey: true,
};

// Custom colors for each type
const alertColors = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  question: "#8b5cf6",
};

// Success alert (Unified)
export const showSuccess = (message, title = "¡Éxito!") => {
  showToast(message, "success");
  return Promise.resolve();
};

// Error alert (Unified)
export const showError = (message, title = "Error") => {
  showToast(message, "error");
  return Promise.resolve();
};

// Warning alert (Unified)
export const showWarning = (message, title = "Advertencia") => {
  showToast(message, "warning");
  return Promise.resolve();
};

// Info alert (Unified)
export const showInfo = (message, title = "Información") => {
  showToast(message, "info");
  return Promise.resolve();
};

// Confirm alert (Updated for consistency)
export const showConfirm = (
  message,
  title = "¿Confirmar acción?",
  confirmText = "Sí, continuar",
  cancelText = "No, volver"
) => {
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text: message,
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });
};

// Delete confirm alert (Unified)
export const showDeleteConfirm = (
  itemName = "este elemento",
  message = "Esta acción no se puede deshacer"
) => {
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title: `¿Eliminar ${itemName}?`,
    text: message,
    iconColor: alertColors.error,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });
};

// Loading alert
export const showLoading = (
  message = "Procesando...",
  title = "Por favor espera"
) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close loading alert
export const closeLoading = () => {
  Swal.close();
};

// Toast notification - Centralizada en el Shell
export const showToast = (message, type = "success") => {
  window.dispatchEvent(
    new CustomEvent("biotech-toast", {
      detail: { message, type },
    })
  );
};

// Custom alert
export const showCustomAlert = (options) => {
  return Swal.fire({
    ...baseConfig,
    ...options,
  });
};

// Alert service object
const alertService = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  confirm: showConfirm,
  deleteConfirm: showDeleteConfirm,
  loading: showLoading,
  closeLoading,
  toast: showToast,
  custom: showCustomAlert,
};

export default alertService;
