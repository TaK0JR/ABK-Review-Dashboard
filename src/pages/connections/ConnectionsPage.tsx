import React, { useState } from 'react';
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
  Users
} from 'lucide-react';

// Sample connection data
const connections = [
  {
    id: 'google',
    name: 'Google Business',
    icon: <Globe className="h-6 w-6 text-blue-500" />,
    status: 'connected',
    lastSync: '25/07/2025',
    data: {
      reviewCount: 48,
      rating: 4.7,
      url: 'https://g.page/r/abk-review',
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Globe className="h-6 w-6 text-blue-600" />,
    status: 'connected',
    lastSync: '24/07/2025',
    data: {
      likes: 845,
      followers: 912,
      url: 'https://facebook.com/abk-review',
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Globe className="h-6 w-6 text-pink-500" />,
    status: 'disconnected',
    lastSync: null,
    data: null
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    icon: <Globe className="h-6 w-6 text-green-500" />,
    status: 'pending',
    lastSync: null,
    data: null
  },
];

type ConnectionStatus = 'connected' | 'disconnected' | 'pending';

const ConnectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  
  // Filter connections based on active tab
  const filteredConnections = connections.filter((connection) => {
    if (activeTab === 'connected') {
      return connection.status === 'connected';
    } else {
      return connection.status !== 'connected';
    }
  });
  
  // Get status badge
  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return (
          <span className="badge badge-green flex items-center">
            <CheckCircle size={14} className="mr-1" />
            Connecté
          </span>
        );
      case 'disconnected':
        return (
          <span className="badge badge-gray flex items-center">
            <XCircle size={14} className="mr-1" />
            Non connecté
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-yellow flex items-center">
            <AlertCircle size={14} className="mr-1" />
            En attente
          </span>
        );
      default:
        return null;
    }
  };
  
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
              Services connectés
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-4 px-1 text-sm font-medium ${
                activeTab === 'available'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Services disponibles
            </button>
          </nav>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {filteredConnections.map((connection) => (
            <div key={connection.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  {connection.icon}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">{connection.name}</h3>
                    <div className="mt-1">
                      {getStatusBadge(connection.status)}
                    </div>
                  </div>
                </div>
                
                {connection.status === 'connected' ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Dernière synchronisation : {connection.lastSync}
                    </div>
                    <button className="btn btn-secondary flex items-center gap-2">
                      <RefreshCw size={16} />
                      Synchroniser
                    </button>
                    <a 
                      href={connection.data?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Voir
                    </a>
                  </div>
                ) : (
                  <button className="btn btn-primary flex items-center gap-2">
                    <Plus size={16} />
                    {connection.status === 'pending' ? 'Finaliser la connexion' : 'Connecter'}
                  </button>
                )}
              </div>
              
              {connection.status === 'connected' && connection.data && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {connection.id === 'google' && (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                          <Star className="h-5 w-5 text-amber-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">Note moyenne</div>
                            <div className="text-lg font-semibold">{connection.data.rating} / 5</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                          <MessageSquare className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">Avis Google</div>
                            <div className="text-lg font-semibold">{connection.data.reviewCount}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 mb-2">Actions rapides</div>
                          <div className="flex space-x-2">
                            <button className="btn btn-secondary btn-sm">
                              Partager
                            </button>
                            <button className="btn btn-secondary btn-sm">
                              Répondre
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {connection.id === 'facebook' && (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                          <ThumbsUp className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">J'aime</div>
                            <div className="text-lg font-semibold">{connection.data.likes}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                          <Users className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">Abonnés</div>
                            <div className="text-lg font-semibold">{connection.data.followers}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 mb-2">Actions rapides</div>
                          <div className="flex space-x-2">
                            <button className="btn btn-secondary btn-sm">
                              Publier
                            </button>
                            <button className="btn btn-secondary btn-sm">
                              Messages
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Besoin d'aide pour connecter vos services ?</h2>
            <p className="text-blue-700 mb-4 md:mb-0 md:mr-6">
              Notre équipe peut vous aider à connecter et configurer tous vos services pour maximiser votre présence en ligne.
            </p>
          </div>
          <button className="btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
            Contacter le support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;