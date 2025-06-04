import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileEdit,
  Gift,
  Info,
  Send,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

type CampaignType = 'email' | 'sms' | 'auto';

interface CampaignFormData {
  name: string;
  type: CampaignType;
  formId: string;
  message: string;
  subject?: string;
  targetAudience: string;
  scheduledDate: string;
  scheduledTime: string;
  giftId: string;
}

// Sample data for forms and gifts
const forms = [
  { id: '1', name: 'Formulaire Standard' },
  { id: '2', name: 'Livraison Express' },
  { id: '3', name: 'Satisfaction Produit' },
];

const gifts = [
  { id: '1', name: 'Réduction 10%' },
  { id: '2', name: 'Livraison gratuite' },
  { id: '3', name: 'Produit offert' },
];

const audiences = [
  { id: 'all', name: 'Tous les clients', count: 213 },
  { id: 'recent', name: 'Clients récents (30 derniers jours)', count: 48 },
  { id: 'inactive', name: 'Clients inactifs (90+ jours)', count: 76 },
  { id: 'highscore', name: 'Clients satisfaits (score ≥ 4)', count: 105 },
];

const CreateCampaignPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type') as CampaignType | null;
  
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: typeFromQuery || 'email',
    formId: '',
    message: '',
    subject: '',
    targetAudience: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '09:00',
    giftId: '',
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  
  // Update form data
  const updateFormData = (key: keyof CampaignFormData, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };
  
  // Get sample message based on campaign type
  const getSampleMessage = () => {
    if (formData.type === 'email') {
      return `Bonjour {{prenom}},

Nous espérons que vous êtes satisfait de votre récent achat chez nous.

Pourriez-vous prendre quelques minutes pour nous donner votre avis ? 
Cela nous aiderait beaucoup à améliorer nos services.

[Cliquez ici pour répondre]({{lien_formulaire}})

Merci beaucoup!
L'équipe ABK`;
    } else {
      return `Bonjour {{prenom}}, nous espérons que vous êtes satisfait de votre achat. Donnez-nous votre avis en 30 secondes : {{lien_formulaire}}`;
    }
  };
  
  // Initialize sample message when type changes
  useEffect(() => {
    if (!formData.message || formData.message === '') {
      updateFormData('message', getSampleMessage());
    }
  }, [formData.type]);
  
  // Next step
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, this would save to a backend
    console.log('Saving campaign:', formData);
    navigate('/campaigns');
  };
  
  // Toggle message preview
  const togglePreview = () => {
    setPreviewEnabled(!previewEnabled);
  };
  
  // Render preview of message with placeholders replaced
  const renderMessagePreview = () => {
    let preview = formData.message
      .replace('{{prenom}}', 'Jean')
      .replace('{{lien_formulaire}}', 'https://abk-review.com/form/example');
    
    // Convert markdown-style links to HTML
    preview = preview.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 underline">$1</a>');
    
    return preview;
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/campaigns')}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? 'Modifier la campagne' : 'Nouvelle campagne'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button 
              onClick={prevStep}
              className="btn btn-secondary"
            >
              Précédent
            </button>
          )}
          {currentStep < 3 ? (
            <button 
              onClick={nextStep}
              className="btn btn-primary"
              disabled={
                (currentStep === 1 && (!formData.name || !formData.type || !formData.formId)) ||
                (currentStep === 2 && (!formData.message || (formData.type === 'email' && !formData.subject)))
              }
            >
              Suivant
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              Enregistrer
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div 
            className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}
            onClick={() => currentStep > 1 && setCurrentStep(1)}
          >
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              currentStep >= 1 ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <FileEdit size={16} className={currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'} />
            </div>
            <span className="ml-2 font-medium cursor-pointer">Informations</span>
          </div>
          <div className={`flex-1 mx-4 h-1 ${currentStep >= 2 ? 'bg-primary-200' : 'bg-gray-200'}`}></div>
          <div 
            className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}
            onClick={() => currentStep > 2 && setCurrentStep(2)}
          >
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              currentStep >= 2 ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Mail size={16} className={currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'} />
            </div>
            <span className="ml-2 font-medium cursor-pointer">Message</span>
          </div>
          <div className={`flex-1 mx-4 h-1 ${currentStep >= 3 ? 'bg-primary-200' : 'bg-gray-200'}`}></div>
          <div 
            className={`flex items-center ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}
          >
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              currentStep >= 3 ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Send size={16} className={currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'} />
            </div>
            <span className="ml-2 font-medium">Envoi</span>
          </div>
        </div>
      </div>
      
      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="card animate-fadeIn">
          <h2 className="text-lg font-medium mb-6">Informations de base</h2>
          
          <div className="mb-6">
            <label htmlFor="campaignName" className="form-label">Nom de la campagne</label>
            <input
              id="campaignName"
              type="text"
              className="form-input"
              placeholder="Ex: Campagne satisfaction client"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label className="form-label">Type de campagne</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => updateFormData('type', 'email')}
                className={`p-4 rounded-lg border ${
                  formData.type === 'email' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                } flex flex-col items-center`}
              >
                <div className={`rounded-full p-3 ${
                  formData.type === 'email' ? 'bg-primary-100' : 'bg-gray-100'
                } mb-3`}>
                  <Mail size={20} className={formData.type === 'email' ? 'text-primary-600' : 'text-gray-500'} />
                </div>
                <h3 className={`font-medium ${formData.type === 'email' ? 'text-primary-600' : 'text-gray-700'}`}>
                  Email
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Envoi personnalisé via email
                </p>
              </button>
              
              <button
                onClick={() => updateFormData('type', 'sms')}
                className={`p-4 rounded-lg border ${
                  formData.type === 'sms' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                } flex flex-col items-center`}
              >
                <div className={`rounded-full p-3 ${
                  formData.type === 'sms' ? 'bg-primary-100' : 'bg-gray-100'
                } mb-3`}>
                  <MessageSquare size={20} className={formData.type === 'sms' ? 'text-primary-600' : 'text-gray-500'} />
                </div>
                <h3 className={`font-medium ${formData.type === 'sms' ? 'text-primary-600' : 'text-gray-700'}`}>
                  SMS
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Message court pour réponse rapide
                </p>
              </button>
              
              <button
                onClick={() => updateFormData('type', 'auto')}
                className={`p-4 rounded-lg border ${
                  formData.type === 'auto' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                } flex flex-col items-center`}
              >
                <div className={`rounded-full p-3 ${
                  formData.type === 'auto' ? 'bg-primary-100' : 'bg-gray-100'
                } mb-3`}>
                  <Calendar size={20} className={formData.type === 'auto' ? 'text-primary-600' : 'text-gray-500'} />
                </div>
                <h3 className={`font-medium ${formData.type === 'auto' ? 'text-primary-600' : 'text-gray-700'}`}>
                  Automatique
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Envoi automatisé récurrent
                </p>
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="formSelect" className="form-label">Formulaire à utiliser</label>
            <select
              id="formSelect"
              className="form-input"
              value={formData.formId}
              onChange={(e) => updateFormData('formId', e.target.value)}
            >
              <option value="">Sélectionnez un formulaire</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="giftSelect" className="form-label">Cadeau associé (optionnel)</label>
            <select
              id="giftSelect"
              className="form-input"
              value={formData.giftId}
              onChange={(e) => updateFormData('giftId', e.target.value)}
            >
              <option value="">Aucun cadeau</option>
              {gifts.map((gift) => (
                <option key={gift.id} value={gift.id}>
                  {gift.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Associez un cadeau qui sera mentionné dans votre message
            </p>
          </div>
        </div>
      )}
      
      {/* Step 2: Message Content */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-medium mb-6">Contenu du message</h2>
              
              {formData.type === 'email' && (
                <div className="mb-6">
                  <label htmlFor="emailSubject" className="form-label">Objet de l'email</label>
                  <input
                    id="emailSubject"
                    type="text"
                    className="form-input"
                    placeholder="Ex: Votre avis nous intéresse"
                    value={formData.subject || ''}
                    onChange={(e) => updateFormData('subject', e.target.value)}
                  />
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="messageContent" className="form-label">Message</label>
                  <button
                    onClick={togglePreview}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {previewEnabled ? 'Éditer' : 'Aperçu'}
                  </button>
                </div>
                
                {previewEnabled ? (
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[200px] whitespace-pre-wrap">
                    <div dangerouslySetInnerHTML={{ __html: renderMessagePreview() }} />
                  </div>
                ) : (
                  <textarea
                    id="messageContent"
                    className="form-input font-mono"
                    rows={formData.type === 'email' ? 10 : 4}
                    placeholder={`Entrez votre message ici...`}
                    value={formData.message}
                    onChange={(e) => updateFormData('message', e.target.value)}
                  ></textarea>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <Info size={20} className="text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Variables disponibles</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Utilisez ces variables pour personnaliser votre message :
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li><code className="bg-blue-100 px-1 rounded">{"{{prenom}}"}</code> - Prénom du client</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{lien_formulaire}}"}</code> - Lien vers le formulaire</li>
                      {formData.giftId && (
                        <li><code className="bg-blue-100 px-1 rounded">{"{{cadeau}}"}</code> - Nom du cadeau associé</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="card mb-4">
              <h2 className="text-lg font-medium mb-4">Conseils</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-1.5 mr-3">
                    <MessageSquare size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Soyez concis</h3>
                    <p className="text-xs text-gray-600">
                      {formData.type === 'sms' 
                        ? 'Gardez votre SMS court (moins de 160 caractères si possible).'
                        : 'Allez droit au but pour maximiser les réponses.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-blue-100 p-1.5 mr-3">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Personnalisez</h3>
                    <p className="text-xs text-gray-600">
                      Utilisez le prénom pour augmenter le taux de réponse.
                    </p>
                  </div>
                </div>
                
                {formData.type === 'email' && (
                  <div className="flex items-start">
                    <div className="rounded-full bg-purple-100 p-1.5 mr-3">
                      <Mail size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Objet accrocheur</h3>
                      <p className="text-xs text-gray-600">
                        Un bon objet d'email augmente le taux d'ouverture de 30%.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 3: Audience and Scheduling */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-lg font-medium mb-6">Ciblage</h2>
              
              <div className="mb-6">
                <label className="form-label">Audience cible</label>
                <div className="space-y-3">
                  {audiences.map((audience) => (
                    <div key={audience.id} className="flex items-center">
                      <input
                        id={`audience-${audience.id}`}
                        type="radio"
                        name="audience"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        value={audience.id}
                        checked={formData.targetAudience === audience.id}
                        onChange={() => updateFormData('targetAudience', audience.id)}
                      />
                      <label htmlFor={`audience-${audience.id}`} className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">
                          {audience.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {audience.count} contacts
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-lg font-medium mb-6">Programmation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="scheduledDate" className="form-label">Date d'envoi</label>
                  <input
                    id="scheduledDate"
                    type="date"
                    className="form-input"
                    value={formData.scheduledDate}
                    onChange={(e) => updateFormData('scheduledDate', e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                
                <div>
                  <label htmlFor="scheduledTime" className="form-label">Heure d'envoi</label>
                  <input
                    id="scheduledTime"
                    type="time"
                    className="form-input"
                    value={formData.scheduledTime}
                    onChange={(e) => updateFormData('scheduledTime', e.target.value)}
                  />
                </div>
              </div>
              
              {formData.type === 'auto' && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start">
                    <Info size={20} className="text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Configuration automatique</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Cette campagne sera envoyée automatiquement selon la fréquence définie.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="card mb-4">
              <h2 className="text-lg font-medium mb-4">Récapitulatif</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Type de campagne</div>
                  <div className="text-sm font-medium flex items-center">
                    {formData.type === 'email' && <Mail size={16} className="text-blue-500 mr-2" />}
                    {formData.type === 'sms' && <MessageSquare size={16} className="text-green-500 mr-2" />}
                    {formData.type === 'auto' && <Calendar size={16} className="text-purple-500 mr-2" />}
                    {formData.type === 'email' ? 'Email' : formData.type === 'sms' ? 'SMS' : 'Automatique'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Formulaire</div>
                  <div className="text-sm font-medium">
                    {forms.find(f => f.id === formData.formId)?.name || '-'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Cadeau associé</div>
                  <div className="text-sm font-medium flex items-center">
                    {formData.giftId ? (
                      <>
                        <Gift size={16} className="text-amber-500 mr-2" />
                        {gifts.find(g => g.id === formData.giftId)?.name}
                      </>
                    ) : (
                      'Aucun'
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Programmation</div>
                  <div className="text-sm font-medium flex items-center">
                    <Clock size={16} className="text-gray-500 mr-2" />
                    {formData.scheduledDate} à {formData.scheduledTime}
                  </div>
                </div>
                
                {formData.targetAudience && (
                  <div>
                    <div className="text-xs text-gray-500">Audience</div>
                    <div className="text-sm font-medium flex items-center">
                      <Users size={16} className="text-gray-500 mr-2" />
                      {audiences.find(a => a.id === formData.targetAudience)?.name} 
                      ({audiences.find(a => a.id === formData.targetAudience)?.count} contacts)
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card bg-green-50 border border-green-200">
              <h2 className="text-lg font-medium text-green-800 mb-2">Prêt à envoyer</h2>
              <p className="text-sm text-green-700 mb-4">
                Votre campagne sera envoyée le {formData.scheduledDate} à {formData.scheduledTime}.
              </p>
              <button 
                onClick={handleSave}
                className="btn w-full bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
              >
                Programmer la campagne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaignPage;