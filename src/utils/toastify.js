// src/utils/toastify.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showSuccess = (msg) => toast.success(msg, { position: "top-right", autoClose: 4000 });
export const showError = (msg) => toast.error(msg, { position: "top-right", autoClose: 4000 });
export const showInfo = (msg) => toast.info(msg, { position: "top-right", autoClose: 4000 });
export const showWarning = (msg) => toast.warning(msg, { position: "top-right", autoClose: 4000 });