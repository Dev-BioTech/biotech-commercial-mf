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

// Success alert
export const showSuccess = (message, title = "¡Éxito!") => {
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title,
    text: message,
    iconColor: alertColors.success,
    confirmButtonText: "Aceptar",
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error alert
export const showError = (message, title = "Error") => {
  return Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text: message,
    iconColor: alertColors.error,
    confirmButtonText: "Entendido",
  });
};

// Warning alert
export const showWarning = (message, title = "Advertencia") => {
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text: message,
    iconColor: alertColors.warning,
    confirmButtonText: "Aceptar",
  });
};

// Info alert
export const showInfo = (message, title = "Información") => {
  return Swal.fire({
    ...baseConfig,
    icon: "info",
    title,
    text: message,
    iconColor: alertColors.info,
    confirmButtonText: "Entendido",
    timer: 4000,
    timerProgressBar: true,
  });
};

// Confirm alert
export const showConfirm = (
  message,
  title = "¿Estás seguro?",
  confirmText = "Sí, confirmar",
  cancelText = "Cancelar"
) => {
  return Swal.fire({
    ...baseConfig,
    icon: "question",
    title,
    text: message,
    iconColor: alertColors.question,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
};

// Delete confirm alert
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
    confirmButtonColor: alertColors.error,
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

// Toast notification 
export const showToast = (message, type = "success", position = "top-end") => {
  const Toast = Swal.mixin({
    toast: true,
    position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon: type,
    title: message,
    iconColor: alertColors[type] || alertColors.info,
  });
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
