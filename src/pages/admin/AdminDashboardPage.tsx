import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  Users,
  UserPlus,
  Activity,
  BarChart2,
  Star,
  Mail,
  Calendar,
  Lock,
  Unlock,
  Trash,
  Search,
  X,
  Building,
  Save
} from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  full_name: string;
  company_name: string;
  created_at: string;
  is_admin: boolean;
}

interface NewUserData {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  is_admin: boolean;
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUserData>({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    is_admin: false
  });
  const [createError, setCreateError] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalReviews: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }

    fetchUsers();
    fetchStats();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/list');
      if (response.success) {
        setUsers(response.data);
        setStats(prev => ({ ...prev, totalUsers: response.data.length }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // TODO: Implémenter l'endpoint pour récupérer les vraies stats
    setStats(prev => ({
      ...prev,
      activeUsers: Math.floor(prev.totalUsers * 0.7),
      totalReviews: 1247,
      averageRating: 4.2,
    }));
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      // TODO: Implémenter l'endpoint pour modifier le statut admin
      console.log('Toggle user status:', userId, currentStatus);
      // Pour l'instant, on simule
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        // TODO: Implémenter l'endpoint pour supprimer un utilisateur
        console.log('Delete user:', userId);
        // Pour l'instant, on simule
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newUser.email || !newUser.password || !newUser.full_name) {
      setCreateError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const response = await api.post('/users/create', newUser);
      
      if (response.success) {
        // Reset form and close modal
        setNewUser({
          email: '',
          password: '',
          full_name: '',
          company_name: '',
          is_admin: false
        });
        setShowCreateModal(false);
        fetchUsers();
      } else {
        setCreateError(response.message || 'Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setCreateError(error.message || 'Une erreur est survenue lors de la création du compte.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
        <p className="text-gray-600 mt-2">Gérez les utilisateurs et surveillez l'activité de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avis totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2 mt-4 sm:mt-0"
          >
            <UserPlus size={20} />
            Nouvel utilisateur
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par email, nom ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 font-medium text-gray-900">Utilisateur</th>
                  <th className="pb-3 font-medium text-gray-900 hidden sm:table-cell">Entreprise</th>
                  <th className="pb-3 font-medium text-gray-900 hidden md:table-cell">Date d'inscription</th>
                  <th className="pb-3 font-medium text-gray-900">Statut</th>
                  <th className="pb-3 font-medium text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-400" />
                        <span className="text-gray-600">{user.company_name || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_admin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_admin ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_admin)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title={user.is_admin ? 'Retirer les droits admin' : 'Donner les droits admin'}
                        >
                          {user.is_admin ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Créer un nouvel utilisateur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {createError}
              </div>
            )}

            <form onSubmit={createUser}>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Mot de passe *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Nom complet *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Entreprise</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.company_name}
                    onChange={(e) => setNewUser({ ...newUser, company_name: e.target.value })}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_admin"
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    checked={newUser.is_admin}
                    onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  />
                  <label htmlFor="is_admin" className="ml-2 text-sm text-gray-700">
                    Accorder les droits administrateur
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;