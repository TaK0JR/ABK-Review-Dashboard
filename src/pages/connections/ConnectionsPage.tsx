import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus,
  Star,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Users,
  Calendar,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

// Types pour les connexions de plateforme
interface PlatformConnection {
  id: number;
  user_id: number;
  platform: 'google_business' | 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  account_name: string | null;
  account_id: string;
  access_token?: string; // Ne sera pas envoyé par l'API pour des raisons de sécurité
  refresh_token?: string; // Ne sera pas envoyé par l'API pour des raisons de sécurité
  token_expires_at: string | null;
  permissions: any;
  account_data: any;
  is_active: boolean;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  oauth_url?: string;
  scopes?: string[];
}

// Configuration des plateformes disponibles
const PLATFORMS: Record<string, PlatformConfig> = {
  google_business: {
    id: 'google_business',
    name: 'Google Business',
    icon: <Globe className="h-6 w-6 text-blue-500" />,
    color: 'blue',
    oauth_url: '/api/oauth/google/business',
    scopes: ['https://www.googleapis.com/auth/business.manage']
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: <Globe className="h-6 w-6 text-blue-600" />,
    color: 'blue',
    oauth_url: '/api/oauth/facebook',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata']
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Business',
    icon: <Globe className="h-6 w-6 text-pink-500" />,
    color: 'pink',
    oauth_url: '/api/oauth/instagram',
    scopes: ['instagram_basic', 'instagram_manage_insights']
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    icon: <Globe className="h-6 w-6 text-black" />,
    color: 'black',
    oauth_url: '/api/oauth/twitter',
    scopes: ['tweet.read', 'users.read']
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Globe className="h-6 w-6 text-blue-700" />,
    color: 'blue',
    oauth_url: '/api/oauth/linkedin',
    scopes: ['r_organization_social', 'rw_organization_admin']
  }
};

const ConnectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Charger les connexions depuis l'API
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/platform-connections');
      if (!response.ok) throw new Error('Erreur lors du chargement des connexions');
      
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les connexions');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si un token expire bientôt
  const isTokenExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiration = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiration < 24; // Expire dans moins de 24h
  };

  // Vérifier si un token est expiré
  const isTokenExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Connecter une nouvelle plateforme
  const connectPlatform = async (platformId: string) => {
    const platform = PLATFORMS[platformId];
    if (!platform.oauth_url) return;

    setConnecting(platformId);
    
    try {
      // Rediriger vers l'OAuth de la plateforme
      window.location.href = platform.oauth_url;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur lors de la connexion');
      setConnecting(null);
    }
  };

  // Synchroniser les données d'une connexion
  const syncConnection = async (connectionId: number) => {
    setSyncing(connectionId);
    
    try {
      const response = await fetch(`/api/platform-connections/${connectionId}/sync`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Erreur de synchronisation');
      
      const result = await response.json();
      toast.success('Synchronisation réussie');
      
      // Recharger les connexions
      await fetchConnections();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(null);
    }
  };

  // Déconnecter une plateforme
  const disconnectPlatform = async (connectionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter ce service ?')) return;
    
    try {
      const response = await fetch(`/api/platform-connections/${connectionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur de déconnexion');
      
      toast.success('Service déconnecté');
      await fetchConnections();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Rafraîchir un token expiré
  const refreshToken = async (connectionId: number) => {
    try {
      const response = await fetch(`/api/platform-connections/${connectionId}/refresh-token`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Erreur de rafraîchissement');
      
      toast.success('Token renouvelé avec succès');
      await fetchConnections();
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
      toast.error('Erreur lors du renouvellement du token');
    }
  };

  // Formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir les plateformes disponibles (non connectées)
  const availablePlatforms = Object.values(PLATFORMS).filter(
    platform => !connections.some(conn => conn.platform === platform.id)
  );

  // Filtrer les connexions selon l'onglet
  const displayedItems = activeTab === 'connected' ? connections : availablePlatforms;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Connexions</h1>
      </div>
      
      <div className="card mb-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('connected')}
              className={`pb-4 px-1 text-sm font-medium ${
                activeTab === 'connected'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Services connectés ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-4 px-1 text-sm font-medium ${
                activeTab === 'available'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Services disponibles ({availablePlatforms.length})
            </button>
          </nav>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'connected' ? (
            // Afficher les connexions actives
            connections.map((connection) => {
              const platform = PLATFORMS[connection.platform];
              const tokenExpiring = connection.token_expires_at && isTokenExpiringSoon(connection.token_expires_at);
              const tokenExpired = connection.token_expires_at && isTokenExpired(connection.token_expires_at);
              
              return (
                <div key={connection.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      {platform?.icon || <Globe className="h-6 w-6 text-gray-500" />}
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">
                          {connection.account_name || platform?.name || 'Service inconnu'}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          {connection.is_active ? (
                            <span className="badge badge-green flex items-center">
                              <CheckCircle size={14} className="mr-1" />
                              Connecté
                            </span>
                          ) : (
                            <span className="badge badge-red flex items-center">
                              <XCircle size={14} className="mr-1" />
                              Inactif
                            </span>
                          )}
                          {tokenExpired && (
                            <span className="badge badge-red flex items-center">
                              <XCircle size={14} className="mr-1" />
                              Token expiré
                            </span>
                          )}
                          {tokenExpiring && !tokenExpired && (
                            <span className="badge badge-yellow flex items-center">
                              <AlertCircle size={14} className="mr-1" />
                              Token expire bientôt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {(tokenExpiring || tokenExpired) && (
                        <button 
                          onClick={() => refreshToken(connection.id)}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <Shield size={16} />
                          Renouveler
                        </button>
                      )}
                      <button 
                        onClick={() => syncConnection(connection.id)}
                        disabled={syncing === connection.id}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        {syncing === connection.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <RefreshCw size={16} />
                        )}
                        Synchroniser
                      </button>
                      <button 
                        onClick={() => disconnectPlatform(connection.id)}
                        className="btn btn-outline-danger"
                      >
                        Déconnecter
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Informations de connexion */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">Connecté le</span>
                        </div>
                        <div className="font-medium">{formatDate(connection.created_at)}</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-2">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          <span className="text-sm">Dernière synchro</span>
                        </div>
                        <div className="font-medium">{formatDate(connection.last_sync_at)}</div>
                      </div>
                      
                      {/* Afficher les erreurs si présentes */}
                      {connection.last_error && (
                        <div className="col-span-full bg-red-50 border border-red-200 p-4 rounded-lg">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-red-800">Dernière erreur</div>
                              <div className="text-sm text-red-700 mt-1">{connection.last_error}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Données spécifiques à la plateforme */}
                      {connection.account_data && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {connection.platform === 'google_business' && connection.account_data.rating && (
                            <div className="flex items-center">
                              <Star className="h-5 w-5 text-amber-500 mr-2" />
                              <div>
                                <div className="text-sm text-gray-600">Note moyenne</div>
                                <div className="font-semibold">
                                  {connection.account_data.rating} / 5
                                  {connection.account_data.review_count && (
                                    <span className="text-sm text-gray-500 ml-1">
                                      ({connection.account_data.review_count} avis)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {connection.platform === 'facebook' && (
                            <div className="flex items-center">
                              <ThumbsUp className="h-5 w-5 text-blue-500 mr-2" />
                              <div>
                                <div className="text-sm text-gray-600">Engagement</div>
                                <div className="font-semibold">
                                  {connection.account_data.likes || 0} likes
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Afficher les plateformes disponibles
            availablePlatforms.map((platform) => (
              <div key={platform.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    {platform.icon}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium">{platform.name}</h3>
                      <span className="badge badge-gray">
                        Non connecté
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => connectPlatform(platform.id)}
                    disabled={connecting === platform.id}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {connecting === platform.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Connecter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-blue-800 mb-2">
              Sécurité et confidentialité
            </h2>
            <p className="text-blue-700 mb-4 md:mb-0 md:mr-6">
              Vos tokens d'accès sont chiffrés avec AES-256 et stockés de manière sécurisée. 
              Nous ne conservons que les permissions nécessaires pour synchroniser vos avis.
            </p>
          </div>
          <button className="btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;