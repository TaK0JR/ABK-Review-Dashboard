import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  CreditCard, 
  Shield, 
  Bell, 
  Save,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Sample subscription data
  const subscription = {
    plan: 'Professionnel',
    status: 'active',
    startDate: '01/01/2025',
    nextBilling: '01/08/2025',
    price: '49.99',
    features: [
      'Formulaires illimités',
      'Campagnes illimitées',
      'Export de données',
      'Connexion Google Business',
      'Support prioritaire',
    ]
  };
  
  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-6">Paramètres du compte</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={18} className="mr-3" />
                Profil
              </button>
              
              <button
                onClick={() => setActiveTab('company')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'company' 
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building size={18} className="mr-3" />
                Entreprise
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'security' 
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield size={18} className="mr-3" />
                Sécurité
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'notifications' 
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'billing' 
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard size={18} className="mr-3" />
                Abonnement
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-medium mb-6">Informations personnelles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="form-label">Prénom</label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-input"
                    defaultValue={user?.name.split(' ')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="form-label">Nom</label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-input"
                    defaultValue={user?.name.split(' ')[1] || ''}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    defaultValue={user?.email}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="form-label">Téléphone</label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="Ex: 0612345678"
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button className="btn btn-primary flex items-center gap-2">
                  <Save size={16} />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}
          
          {/* Company Settings */}
          {activeTab === 'company' && (
            <div className="card">
              <h2 className="text-lg font-medium mb-6">Informations entreprise</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="form-label">Nom de l'entreprise</label>
                  <input
                    id="companyName"
                    type="text"
                    className="form-input"
                    defaultValue={user?.company}
                  />
                </div>
                
                <div>
                  <label htmlFor="activity" className="form-label">Secteur d'activité</label>
                  <select id="activity" className="form-input">
                    <option>Commerce</option>
                    <option>Restauration</option>
                    <option>Services</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="website" className="form-label">Site web</label>
                  <input
                    id="website"
                    type="url"
                    className="form-input"
                    placeholder="Ex: https://votre-site.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="siret" className="form-label">Numéro SIRET</label>
                  <input
                    id="siret"
                    type="text"
                    className="form-input"
                    placeholder="Ex: 12345678901234"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="form-label">Adresse</label>
                  <textarea
                    id="address"
                    className="form-input"
                    rows={3}
                    placeholder="Adresse complète"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button className="btn btn-primary flex items-center gap-2">
                  <Save size={16} />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="card">
              <h2 className="text-lg font-medium mb-6">Sécurité du compte</h2>
              
              <div className="mb-8">
                <h3 className="text-md font-medium mb-4">Changer le mot de passe</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
                    <input
                      id="currentPassword"
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                    <input
                      id="newPassword"
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      8 caractères minimum, avec au moins une lettre majuscule et un chiffre
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="btn btn-primary">
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium mb-4">Sessions actives</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="rounded-full bg-green-100 p-2 mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Session actuelle</div>
                        <div className="text-sm text-gray-500">
                          Chrome sur Windows • Paris, France
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Connecté il y a 2 heures
                    </div>
                  </div>
                </div>
                
                <button className="btn btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50">
                  Déconnecter toutes les autres sessions
                </button>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-lg font-medium mb-6">Préférences de notifications</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-3">Notifications par email</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Nouvel avis reçu</div>
                        <div className="text-sm text-gray-500">
                          Recevoir un email quand un client laisse un avis
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Rapport hebdomadaire</div>
                        <div className="text-sm text-gray-500">
                          Recevoir un résumé des performances chaque semaine
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Alertes de campagnes</div>
                        <div className="text-sm text-gray-500">
                          Notifications concernant vos campagnes programmées
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-3">Notifications dans l'application</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Nouveaux avis</div>
                        <div className="text-sm text-gray-500">
                          Afficher une notification pour chaque nouvel avis
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Statistiques importantes</div>
                        <div className="text-sm text-gray-500">
                          Alertes sur les changements significatifs dans vos statistiques
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Mises à jour système</div>
                        <div className="text-sm text-gray-500">
                          Notifications concernant les mises à jour de l'application
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button className="btn btn-primary flex items-center gap-2">
                  <Save size={16} />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}
          
          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div>
              <div className="card mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-medium mb-2">Abonnement actuel</h2>
                    <div className="flex items-center">
                      <span className="badge badge-blue">{subscription.plan}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {subscription.price}€ / mois
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        Début : {subscription.startDate}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        Prochain paiement : {subscription.nextBilling}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-3">Fonctionnalités incluses</h3>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:justify-end gap-3">
                  <button className="btn btn-secondary">
                    Voir les factures
                  </button>
                  <button className="btn btn-primary">
                    Modifier l'abonnement
                  </button>
                </div>
              </div>
              
              <div className="card">
                <h2 className="text-lg font-medium mb-6">Méthode de paiement</h2>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="rounded-md bg-blue-600 p-2 mr-3">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Carte Visa se terminant par 4242</div>
                      <div className="text-sm text-gray-500">Expire le 12/2026</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    Modifier
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row md:justify-between gap-3">
                  <button className="btn btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50">
                    Annuler l'abonnement
                  </button>
                  <button className="btn btn-primary">
                    Ajouter un moyen de paiement
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;