import React, { useState, useEffect } from "react";
import { Users, Shield, ShieldCheck, ShieldX, Trash2, Edit, CheckCircle, XCircle, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GestionUtilisateurs() {
    
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      // Vérifie si la date est valide
      if (isNaN(date.getTime())) return "—"; 
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "—";
    }
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [token, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        setError("Accès refusé. Vous devez être administrateur.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur vers "${newRole}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${userId}/role?new_role=${newRole}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.detail || "Erreur lors de la modification");
      }
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.detail || "Erreur lors de la suppression");
      }
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  const filteredUsers = filter === "tous" 
    ? users 
    : users.filter(u => u.role === filter);

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case "Admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Epidemiologiste": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Saisisseur": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Lecteur": return "bg-green-100 text-green-700 border-green-200";
      case "En_attente": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500 mt-1">Gérez les comptes et les rôles des utilisateurs</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filtrer par rôle :</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="tous">Tous les utilisateurs</option>
            <option value="En_attente">En attente ({users.filter(u => u.role === "En_attente").length})</option>
            <option value="Admin">Admin ({users.filter(u => u.role === "Admin").length})</option>
            <option value="Epidemiologiste">Épidémiologiste ({users.filter(u => u.role === "Epidemiologiste").length})</option>
            <option value="Saisisseur">Saisisseur ({users.filter(u => u.role === "Saisisseur").length})</option>
            <option value="Lecteur">Lecteur ({users.filter(u => u.role === "Lecteur").length})</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inscrit le</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {user.prenom} {user.nom}
                      </div>
                      <div className="text-xs text-slate-500">ID: {user.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role === "Admin" && <Shield className="w-3 h-3 mr-1" />}
                        {user.role === "En_attente" ? "En attente" : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.est_verifie ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle className="w-4 h-4" /> Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                          <XCircle className="w-4 h-4" /> Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        {(() => {
                            console.log("DEBUG DATE BRUTE:", user.date_creation, typeof user.date_creation);
                            return formatDate(user.date_creation);
                        })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Menu déroulant pour changer le rôle */}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-2 py-1 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          disabled={user.role === "Admin" && user.id === 1}
                        >
                          <option value="En_attente">En attente</option>
                          <option value="Lecteur">Lecteur</option>
                          <option value="Saisisseur">Saisisseur</option>
                          <option value="Epidemiologiste">Épidémiologiste</option>
                          <option value="Admin">Admin</option>
                        </select>

                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => handleDelete(user.id, `${user.prenom} ${user.nom}`)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                          disabled={user.role === "Admin" && user.id === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}