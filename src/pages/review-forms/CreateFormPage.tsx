import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  Save, 
  PlusCircle, 
  Trash2, 
  ArrowLeft, 
  Star,
  Smile,
  MessageSquare,
  MoveVertical,
  Smartphone,
  Palette,
  Image as ImageIcon,
  QrCode,
  Layers,
  LaptopIcon as Desktop,
  Copy
} from 'lucide-react';
import QRCode from 'qrcode.react';

// Form question types
type QuestionType = 'note' | 'smileys' | 'text';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

// Default form structure
const defaultForm = {
  name: '',
  description: '',
  questions: [
    {
      id: '1',
      text: 'Comment évaluez-vous votre expérience globale ?',
      type: 'note' as QuestionType,
      required: true,
    }
  ],
  settings: {
    logoUrl: '',
    bannerUrl: '',
    primaryColor: '#3366FF',
    backgroundColor: '#F7F9FC',
    redirectLowScore: '',
    redirectHighScore: '',
  }
};

const CreateFormPage: React.FC = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('questions');
  const [form, setForm] = useState(defaultForm);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add a new question
  const addQuestion = () => {
    if (form.questions.length >= 3) {
      setError('Vous ne pouvez pas ajouter plus de 3 questions');
      return;
    }
    
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: 'Nouvelle question',
      type: 'note',
      required: true,
    };
    
    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    });
  };
  
  // Remove a question
  const removeQuestion = (id: string) => {
    setForm({
      ...form,
      questions: form.questions.filter(q => q.id !== id),
    });
  };
  
  // Update a question
  const updateQuestion = (id: string, data: Partial<Question>) => {
    setForm({
      ...form,
      questions: form.questions.map(q => q.id === id ? { ...q, ...data } : q),
    });
  };
  
  // Save form
  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (!form.name) {
        throw new Error('Le nom du formulaire est requis');
      }
      
      if (form.questions.length === 0) {
        throw new Error('Au moins une question est requise');
      }
      
      const response = await api.post('/forms/create', {
        name: form.name,
        description: form.description,
        questions: form.questions,
        settings: form.settings
      });
      
      if (response.success) {
        navigate('/review-forms');
      } else {
        throw new Error(response.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err.message || 'Erreur lors de la sauvegarde du formulaire');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get icon for question type
  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'note':
        return <Star size={16} />;
      case 'smileys':
        return <Smile size={16} />;
      case 'text':
        return <MessageSquare size={16} />;
      default:
        return <Star size={16} />;
    }
  };
  
  // Generate preview URL
  const previewUrl = `abk-review.com/form/${form.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/review-forms')}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? 'Modifier le formulaire' : 'Nouveau formulaire'}
          </h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading || !form.name || form.questions.length === 0}
          className="btn btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={16} />
              Enregistrer
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="mb-4">
              <label htmlFor="formName" className="form-label">Nom du formulaire</label>
              <input
                id="formName"
                type="text"
                className="form-input"
                placeholder="Ex: Avis sur votre commande"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="formDescription" className="form-label">Description (optionnel)</label>
              <textarea
                id="formDescription"
                className="form-input"
                placeholder="Ex: Aidez-nous à améliorer nos services en partageant votre expérience"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          
          <div className="card">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`pb-4 px-1 text-sm font-medium ${
                    activeTab === 'questions'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Questions
                </button>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`pb-4 px-1 text-sm font-medium ${
                    activeTab === 'design'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Design
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`pb-4 px-1 text-sm font-medium ${
                    activeTab === 'settings'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Paramètres
                </button>
              </nav>
            </div>
            
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {form.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <MoveVertical size={16} className="text-gray-400 cursor-grab" />
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      className="form-input mb-3"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Texte de la question"
                    />
                    
                    <div className="flex items-center gap-4">
                      <select
                        className="form-select"
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                      >
                        <option value="note">Note (étoiles)</option>
                        <option value="smileys">Smileys</option>
                        <option value="text">Texte libre</option>
                      </select>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Obligatoire</span>
                      </label>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addQuestion}
                  disabled={form.questions.length >= 3}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle size={20} />
                  Ajouter une question
                </button>
                {form.questions.length >= 3 && (
                  <p className="text-sm text-gray-500 text-center">Maximum 3 questions atteint</p>
                )}
              </div>
            )}
            
            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="form-label flex items-center gap-2">
                    <ImageIcon size={16} />
                    Logo URL
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/logo.png"
                    value={form.settings.logoUrl}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, logoUrl: e.target.value }
                    })}
                  />
                </div>
                
                <div>
                  <label className="form-label flex items-center gap-2">
                    <ImageIcon size={16} />
                    Bannière URL
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/banner.jpg"
                    value={form.settings.bannerUrl}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, bannerUrl: e.target.value }
                    })}
                  />
                </div>
                
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Palette size={16} />
                    Couleur principale
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="h-10 w-20"
                      value={form.settings.primaryColor}
                      onChange={(e) => setForm({
                        ...form,
                        settings: { ...form.settings, primaryColor: e.target.value }
                      })}
                    />
                    <input
                      type="text"
                      className="form-input flex-1"
                      value={form.settings.primaryColor}
                      onChange={(e) => setForm({
                        ...form,
                        settings: { ...form.settings, primaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Palette size={16} />
                    Couleur de fond
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="h-10 w-20"
                      value={form.settings.backgroundColor}
                      onChange={(e) => setForm({
                        ...form,
                        settings: { ...form.settings, backgroundColor: e.target.value }
                      })}
                    />
                    <input
                      type="text"
                      className="form-input flex-1"
                      value={form.settings.backgroundColor}
                      onChange={(e) => setForm({
                        ...form,
                        settings: { ...form.settings, backgroundColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="form-label">Redirection note faible (1-2 étoiles)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://facebook.com/votrepage"
                    value={form.settings.redirectLowScore}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, redirectLowScore: e.target.value }
                    })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Les clients mécontents seront redirigés vers cette URL
                  </p>
                </div>
                
                <div>
                  <label className="form-label">Redirection note élevée (4-5 étoiles)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://google.com/maps/votrepage"
                    value={form.settings.redirectHighScore}
                    onChange={(e) => setForm({
                      ...form,
                      settings: { ...form.settings, redirectHighScore: e.target.value }
                    })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Les clients satisfaits seront redirigés vers cette URL
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Aperçu</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-gray-100' : ''}`}
                >
                  <Smartphone size={16} />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-gray-100' : ''}`}
                >
                  <Desktop size={16} />
                </button>
              </div>
            </div>
            
            <div className={`border rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            }`}>
              <div className="bg-white p-6" style={{ backgroundColor: form.settings.backgroundColor }}>
                {form.settings.logoUrl && (
                  <img 
                    src={form.settings.logoUrl} 
                    alt="Logo"
                    className="h-12 mx-auto mb-4 object-contain"
                  />
                )}
                
                <h2 className="text-xl font-semibold text-center mb-2">
                  {form.name || 'Nom du formulaire'}
                </h2>
                
                {form.description && (
                  <p className="text-gray-600 text-center mb-6">
                    {form.description}
                  </p>
                )}
                
                <div className="space-y-6">
                  {form.questions.map((question, index) => (
                    <div key={question.id}>
                      <p className="mb-3 font-medium">
                        {question.text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      
                      {question.type === 'note' && (
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={24}
                              className="cursor-pointer text-gray-300 hover:text-yellow-400"
                            />
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'smileys' && (
                        <div className="flex justify-center space-x-4">
                          <span className="text-2xl cursor-pointer">😞</span>
                          <span className="text-2xl cursor-pointer">😐</span>
                          <span className="text-2xl cursor-pointer">🙂</span>
                          <span className="text-2xl cursor-pointer">😄</span>
                        </div>
                      )}
                      
                      {question.type === 'text' && (
                        <textarea 
                          className="form-input" 
                          rows={3} 
                          placeholder="Votre réponse..."
                          disabled
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  className="w-full mt-6 py-2 rounded-md font-medium text-white"
                  style={{ backgroundColor: form.settings.primaryColor }}
                  disabled
                >
                  Envoyer
                </button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">URL du formulaire :</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={previewUrl}
                  className="form-input text-sm flex-1"
                />
                <button className="p-2 text-primary-600 hover:text-primary-700">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <QRCode value={`https://${previewUrl}`} size={150} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFormPage;