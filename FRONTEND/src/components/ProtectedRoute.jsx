import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error(" Erreur lors du parsing du user:", e);
    user = null;
  }
  
  console.log("  - User parse:", user);
  console.log("  - Rôle de l'user:", user?.role);
  console.log("  - Rôles autorisés:", allowedRoles);

  if (!token || !user) {
    console.warn(" REDIRECTION VERS LOGIN: Token ou User manquant");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(` REDIRECTION: Rôle "${user.role}" non autorisé. Requis:`, allowedRoles);
    return <Navigate to="/home" replace />; 
  }
  return children;
}