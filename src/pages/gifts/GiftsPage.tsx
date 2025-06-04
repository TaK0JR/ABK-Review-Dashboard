import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Gift, 
  Clock, 
  Award,
  CheckCircle,
  Calendar,
  BarChart,
  MoreHorizontal,
  Trash,
  Pencil,
  Copy
} from 'lucide-react';

// Sample data for gifts
const gifts = [
  {
    id: '1',
    name: 'Réduction 10%',
    description: 'Code promo de 10% sur la prochaine commande',
    frequency: '1 sur 5',
    active: true,
    used: 48,
    total: 75,
    expiresAt: '31/12/2025',
  },
  {
    id: '2',
    name: 'Livraison gratuite',
    description: 'Livraison offerte sans minimum d\'achat',
    frequency: '1 sur 3',
    active: true,
    used: 87,
    total: 120,
    expiresAt: '30/09/2025',
  },
  {
    id: '3',
    name: 'Échantillon gratuit',
    description: 'Un échantillon au choix offert',
    frequency: '1 sur 10',
    active: false,
    used: 22,
    total: 30,
    expiresAt: '15/08/2025',
  },
];

const GiftsPage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Cadeaux Marketing</h1>
        <Link to="/gifts/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={16} />
          Nouveau cadeau
        </Link>
      </div>
      
      {gifts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12">
          <Gift className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun cadeau</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Créez votre premier cadeau marketing pour fidéliser vos clients.
          </p>
          <Link to="/gifts/create" className="btn btn-primary">
            Créer un cadeau
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <div key={gift.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-amber-100 p-2 mr-3">
                    <Gift className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{gift.name}</h3>
                    <p className="text-sm text-gray-500">{gift.description}</p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-md hover:bg-gray-100">
                    <MoreHorizontal size={18} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                    <div className="py-1">
                      <Link 
                        to={`/gifts/edit/${gift.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil size={16} className="mr-2" />
                        Modifier
                      </Link>
                      <a 
                        href="#" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy size={16} className="mr-2" />
                        Dupliquer
                      </a>
                      <a 
                        href="#" 
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash size={16} className="mr-2" />
                        Supprimer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Fréquence :</span>
                  </div>
                  <div className="font-medium">{gift.frequency}</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    <span>Utilisés :</span>
                  </div>
                  <div className="font-medium">{gift.used} / {gift.total}</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Expire le :</span>
                  </div>
                  <div className="font-medium">{gift.expiresAt}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${gift.active ? 'badge-green' : 'badge-gray'}`}>
                  {gift.active ? 'Actif' : 'Inactif'}
                </span>
                <span className="text-sm text-gray-500">
                  Utilisation : {Math.round((gift.used / gift.total) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${Math.round((gift.used / gift.total) * 100)}%` }}
                ></div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/gifts/edit/${gift.id}`}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Pencil size={16} />
                  Modifier
                </Link>
                <button
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  disabled={!gift.active}
                >
                  <BarChart size={16} />
                  Statistiques
                </button>
              </div>
            </div>
          ))}
          
          <Link 
            to="/gifts/create" 
            className="card border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-8 hover:bg-gray-100 transition-colors"
          >
            <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-gray-600 font-medium">Nouveau cadeau</span>
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <Gift className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Réductions</h3>
              <p className="text-sm text-gray-500">Codes promo et remises</p>
            </div>
          </div>
          <Link to="/gifts/create?type=discount" className="btn btn-primary w-full">
            Créer une réduction
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Produits offerts</h3>
              <p className="text-sm text-gray-500">Échantillons et cadeaux physiques</p>
            </div>
          </div>
          <Link to="/gifts/create?type=product" className="btn btn-primary w-full">
            Créer un produit offert
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Évènements spéciaux</h3>
              <p className="text-sm text-gray-500">Cadeaux pour occasions spéciales</p>
            </div>
          </div>
          <Link to="/gifts/create?type=event" className="btn btn-primary w-full">
            Créer un évènement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GiftsPage;