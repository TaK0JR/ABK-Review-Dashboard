import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Gift, 
  Clock, 
  Calendar, 
  TagIcon,
  Info,
  Percent,
  Truck,
  ShoppingBag,
  Award,
  Users
} from 'lucide-react';

type GiftType = 'discount' | 'product' | 'event';

interface GiftFormData {
  name: string;
  description: string;
  type: GiftType;
  value: string;
  code: string;
  frequency: number;
  expiration: string;
  minPurchase: string;
  targetAudience: string;
}

const CreateGiftPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type') as GiftType | null;
  
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<GiftFormData>({
    name: '',
    description: '',
    type: typeFromQuery || 'discount',
    value: '',
    code: '',
    frequency: 5, // 1 sur 5 par défaut
    expiration: '',
    minPurchase: '',
    targetAudience: 'all',
  });
  
  // Update form data
  const updateFormData = (key: keyof GiftFormData, value: string | number) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };
  
  // Generate code based on name
  const generateCode = () => {
    if (formData.name) {
      const code = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8);
      
      updateFormData('code', `${code}${Math.floor(Math.random() * 1000)}`);
    }
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, this would save to a backend
    console.log('Saving gift:', formData);
    navigate('/gifts');
  };
  
  // Get gift type icon
  const getGiftTypeIcon = (type: GiftType) => {
    switch (type) {
      case 'discount':
        return <Percent size={20} />;
      case 'product':
        return <ShoppingBag size={20} />;
      case 'event':
        return <Calendar size={20} />;
      default:
        return <Gift size={20} />;
    }
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/gifts')}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? 'Modifier le cadeau' : 'Nouveau cadeau'}
          </h1>
        </div>
        <button 
          onClick={handleSave}
          className="btn btn-primary flex items-center gap-2"
          disabled={!formData.name || !formData.value}
        >
          <Save size={16} />
          Enregistrer
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-lg font-medium mb-6">Informations générales</h2>
            
            <div className="mb-6">
              <label htmlFor="giftName" className="form-label">Nom du cadeau</label>
              <input
                id="giftName"
                type="text"
                className="form-input"
                placeholder="Ex: Réduction 10%"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="giftDescription" className="form-label">Description</label>
              <textarea
                id="giftDescription"
                className="form-input"
                placeholder="Ex: Code promo de 10% sur la prochaine commande"
                rows={3}
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="form-label">Type de cadeau</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => updateFormData('type', 'discount')}
                  className={`p-4 rounded-lg border ${
                    formData.type === 'discount' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } flex flex-col items-center`}
                >
                  <div className={`rounded-full p-3 ${
                    formData.type === 'discount' ? 'bg-primary-100' : 'bg-gray-100'
                  } mb-3`}>
                    <Percent size={20} className={formData.type === 'discount' ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <h3 className={`font-medium ${formData.type === 'discount' ? 'text-primary-600' : 'text-gray-700'}`}>
                    Réduction
                  </h3>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    Code promo, remise
                  </p>
                </button>
                
                <button
                  onClick={() => updateFormData('type', 'product')}
                  className={`p-4 rounded-lg border ${
                    formData.type === 'product' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } flex flex-col items-center`}
                >
                  <div className={`rounded-full p-3 ${
                    formData.type === 'product' ? 'bg-primary-100' : 'bg-gray-100'
                  } mb-3`}>
                    <ShoppingBag size={20} className={formData.type === 'product' ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <h3 className={`font-medium ${formData.type === 'product' ? 'text-primary-600' : 'text-gray-700'}`}>
                    Produit offert
                  </h3>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    Échantillon, cadeau
                  </p>
                </button>
                
                <button
                  onClick={() => updateFormData('type', 'event')}
                  className={`p-4 rounded-lg border ${
                    formData.type === 'event' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } flex flex-col items-center`}
                >
                  <div className={`rounded-full p-3 ${
                    formData.type === 'event' ? 'bg-primary-100' : 'bg-gray-100'
                  } mb-3`}>
                    <Calendar size={20} className={formData.type === 'event' ? 'text-primary-600' : 'text-gray-500'} />
                  </div>
                  <h3 className={`font-medium ${formData.type === 'event' ? 'text-primary-600' : 'text-gray-700'}`}>
                    Évènement
                  </h3>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    Anniversaire, fête
                  </p>
                </button>
              </div>
            </div>
          </div>
          
          <div className="card mb-6">
            <h2 className="text-lg font-medium mb-6">Détails du cadeau</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="giftValue" className="form-label">
                  {formData.type === 'discount' 
                    ? 'Valeur de la réduction' 
                    : formData.type === 'product' 
                      ? 'Produit offert' 
                      : 'Avantage offert'
                  }
                </label>
                <div className="flex">
                  {formData.type === 'discount' && (
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      {formData.value.includes('%') ? '%' : '€'}
                    </span>
                  )}
                  <input
                    id="giftValue"
                    type="text"
                    className={`form-input ${formData.type === 'discount' ? 'rounded-l-none' : ''}`}
                    placeholder={
                      formData.type === 'discount' 
                        ? 'Ex: 10% ou 5€' 
                        : formData.type === 'product' 
                          ? 'Ex: Échantillon de parfum' 
                          : 'Ex: Carte cadeau anniversaire'
                    }
                    value={formData.value}
                    onChange={(e) => updateFormData('value', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="giftCode" className="form-label">Code promotionnel</label>
                <div className="flex">
                  <input
                    id="giftCode"
                    type="text"
                    className="form-input rounded-r-none"
                    placeholder="Ex: SUMMER10"
                    value={formData.code}
                    onChange={(e) => updateFormData('code', e.target.value.toUpperCase())}
                  />
                  <button
                    onClick={generateCode}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-primary-600 hover:bg-gray-100"
                  >
                    Générer
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="giftFrequency" className="form-label">Fréquence (1 sur X)</label>
                <div className="flex items-center">
                  <input
                    id="giftFrequency"
                    type="range"
                    min="1"
                    max="20"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.frequency}
                    onChange={(e) => updateFormData('frequency', parseInt(e.target.value))}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    1 sur {formData.frequency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.frequency === 1 
                    ? 'Tous les clients recevront ce cadeau' 
                    : `1 client sur ${formData.frequency} recevra ce cadeau`
                  }
                </p>
              </div>
              
              <div>
                <label htmlFor="giftExpiration" className="form-label">Date d'expiration</label>
                <input
                  id="giftExpiration"
                  type="date"
                  className="form-input"
                  value={formData.expiration}
                  onChange={(e) => updateFormData('expiration', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-medium mb-6">Conditions d'utilisation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="minPurchase" className="form-label">Montant minimum d'achat</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    €
                  </span>
                  <input
                    id="minPurchase"
                    type="text"
                    className="form-input rounded-l-none"
                    placeholder="Ex: 50 (laisser vide si aucun minimum)"
                    value={formData.minPurchase}
                    onChange={(e) => updateFormData('minPurchase', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="targetAudience" className="form-label">Public cible</label>
                <select
                  id="targetAudience"
                  className="form-input"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                >
                  <option value="all">Tous les clients</option>
                  <option value="new">Nouveaux clients uniquement</option>
                  <option value="returning">Clients fidèles uniquement</option>
                  <option value="birthday">Anniversaires clients</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card mb-4">
            <h2 className="text-lg font-medium mb-4">Aperçu du cadeau</h2>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-amber-100 p-2 mr-3">
                  {getGiftTypeIcon(formData.type)}
                </div>
                <div>
                  <h3 className="font-medium">
                    {formData.name || 'Nom du cadeau'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formData.description || 'Description du cadeau'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valeur :</span>
                  <span className="font-medium">{formData.value || '-'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Code :</span>
                  <span className="font-medium">{formData.code || '-'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Fréquence :</span>
                  <span className="font-medium">1 sur {formData.frequency}</span>
                </div>
                
                {formData.expiration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expire le :</span>
                    <span className="font-medium">{formData.expiration}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <Info size={18} className="text-amber-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Comment ça marche</h3>
                  <p className="text-sm text-amber-700">
                    Ce cadeau sera attribué aléatoirement à 1 client sur {formData.frequency} 
                    qui répondent à votre formulaire d'avis.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full bg-green-100 p-1.5 mr-3">
                  <Users size={16} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Augmentez le taux de réponse</h3>
                  <p className="text-xs text-gray-600">
                    Les cadeaux augmentent le taux de réponse de 30% en moyenne.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="rounded-full bg-blue-100 p-1.5 mr-3">
                  <Award size={16} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Fidélisez vos clients</h3>
                  <p className="text-xs text-gray-600">
                    Les clients qui reçoivent un cadeau ont 40% plus de chances de revenir.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="rounded-full bg-purple-100 p-1.5 mr-3">
                  <TagIcon size={16} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Suivez l'utilisation</h3>
                  <p className="text-xs text-gray-600">
                    Analysez les performances de vos cadeaux dans les statistiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGiftPage;