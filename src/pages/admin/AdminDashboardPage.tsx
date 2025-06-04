import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserData {
  id: string;
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
    const checkAdmin = async () => {
      const { data } = await supabase
        .from('auth')
        .select('is_admin')
        .eq('email', user?.email)
        .maybeSingle();

      if (!data?.is_admin) {
        navigate('/dashboard');
        return;
      }

      fetchUsers();
      fetchStats();
    };

    checkAdmin();
  }, [user, navigate]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('auth')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // In a real app, you would fetch actual stats from your database
    setStats({
      totalUsers: 156,
      activeUsers: 89,
      totalReviews: 1247,
      averageRating: 4.2,
    });
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('auth')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const { error } = await supabase
        .from('auth')
        .delete()
        .eq('id', userId);

      if (!error) {
        fetchUsers();
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
      // Hash the password before storing
      const hashedPassword = bcrypt.hashSync(newUser.password, 10);

      const { data, error } = await supabase
        .from('auth')
        .insert([{
          email: newUser.email,
          password: hashedPassword,
          full_name: newUser.full_name,
          company_name: newUser.company_name,
          is_admin: newUser.is_admin
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setCreateError('Cet email est déjà utilisé par un autre compte.');
        } else {
          throw error;
        }
        return;
      }

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
    } catch (error: any) {
      console.error('Error creating user:', error);
      setCreateError('Une erreur est survenue lors de la création du compte.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Administrateur</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center">
          <div className="rounded-lg bg-blue-100 p-3 mr-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Utilisateurs totaux</div>
            <div className="text-2xl font-semibold">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="rounded-lg bg-green-100 p-3 mr-4">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
            <div className="text-2xl font-semibold">{stats.activeUsers}</div>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="rounded-lg bg-purple-100 p-3 mr-4">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Avis collectés</div>
            <div className="text-2xl font-semibold">{stats.totalReviews}</div>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="rounded-lg bg-amber-100 p-3 mr-4">
            <Star className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Note moyenne</div>
            <div className="text-2xl font-semibold">{stats.averageRating}/5</div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Gestion des utilisateurs</h2>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={16} />
            Nouvel utilisateur
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Utilisateur</th>
                <th className="table-header">Entreprise</th>
                <th className="table-header">Date d'inscription</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Rôle</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {user.company_name || '-'}
                  </td>
                  <td className="table-cell">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${user.is_admin ? 'badge-blue' : 'badge-gray'}`}>
                      {user.is_admin ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_admin)}
                      className={`btn btn-sm ${user.is_admin ? 'btn-danger' : 'btn-success'} flex items-center gap-2`}
                    >
                      {user.is_admin ? (
                        <>
                          <Lock size={14} />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Unlock size={14} />
                          Activer
                        </>
                      )}
                    </button>
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="btn btn-sm btn-danger"
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Créer un nouvel utilisateur</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createUser}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      className="form-input pl-10"
                      placeholder="email@exemple.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      className="form-input pl-10"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fullName" className="form-label">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      className="form-input pl-10"
                      placeholder="Jean Dupont"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="companyName" className="form-label">
                    Nom de l'entreprise
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="companyName"
                      type="text"
                      className="form-input pl-10"
                      placeholder="Entreprise SAS"
                      value={newUser.company_name}
                      onChange={(e) => setNewUser({ ...newUser, company_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="isAdmin"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={newUser.is_admin}
                    onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  />
                  <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                    Compte administrateur
                  </label>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {createError}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save size={16} />
                    Créer l'utilisateur
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;