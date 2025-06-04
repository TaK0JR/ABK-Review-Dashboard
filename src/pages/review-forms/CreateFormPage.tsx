import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../contexts/AuthContext';
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
  
  // Update form settings
  const updateSettings = (key: string, value: string) => {
    setForm({
      ...form,
      settings: {
        ...form.settings,
        [key]: value,
      },
    });
  };
  
  // Handle form save
  const handleSave = async () => {
    if (!user?.email) {
      setError('User not authenticated');
      return;
    }

    if (!form.name || !form.questions.length || !form.settings) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create table name from user email
      const tableName = `forms_${user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // Clean up questions array to match DB schema
      const cleanQuestions = form.questions.map(({ id, ...rest }) => ({
        text: rest.text,
        type: rest.type,
        required: rest.required
      }));

      // Validate settings format
      const settings = {
        logoUrl: form.settings.logoUrl || 'https://example.com/default-logo.png',
        bannerUrl: form.settings.bannerUrl || 'https://example.com/default-banner.jpg',
        primaryColor: form.settings.primaryColor.match(/^#[0-9A-Fa-f]{6}$/) 
          ? form.settings.primaryColor 
          : '#3366FF',
        backgroundColor: form.settings.backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)
          ? form.settings.backgroundColor
          : '#F7F9FC',
        redirectLowScore: form.settings.redirectLowScore || 'https://facebook.com/default',
        redirectHighScore: form.settings.redirectHighScore || 'https://google.com/default'
      };

      const { error: saveError } = await supabase
        .from(tableName)
        .insert({
          name: form.name,
          description: form.description || null,
          questions: cleanQuestions,
          settings: settings
        });

      if (saveError) {
        console.error('Database error:', saveError);
        throw new Error(saveError.message);
      }

      navigate('/review-forms');
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err.message || 'Failed to save form');
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
                  Apparence
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
                <button
                  onClick={() => setActiveTab('share')}
                  className={`pb-4 px-1 text-sm font-medium ${
                    activeTab === 'share'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Partage
                </button>
              </nav>
            </div>
            
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div>
                <div className="space-y-6">
                  {form.questions.map((question, index) => (
                    <div 
                      key={question.id} 
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoveVertical size={16} />
                          </button>
                          <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                        </div>
                        <button 
                          onClick={() => removeQuestion(question.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50"
                          disabled={form.questions.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor={`question-${question.id}`} className="form-label">
                          Texte de la question
                        </label>
                        <input
                          id={`question-${question.id}`}
                          type="text"
                          className="form-input"
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label">Type de réponse</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => updateQuestion(question.id, { type: 'note' })}
                            className={`p-3 rounded-md flex flex-col items-center justify-center border ${
                              question.type === 'note'
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Star size={24} className={question.type === 'note' ? 'text-primary-500' : 'text-gray-500'} />
                            <span className="text-sm mt-2">Note (étoiles)</span>
                          </button>
                          
                          <button
                            onClick={() => updateQuestion(question.id, { type: 'smileys' })}
                            className={`p-3 rounded-md flex flex-col items-center justify-center border ${
                              question.type === 'smileys'
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Smile size={24} className={question.type === 'smileys' ? 'text-primary-500' : 'text-gray-500'} />
                            <span className="text-sm mt-2">Smileys</span>
                          </button>
                          
                          <button
                            onClick={() => updateQuestion(question.id, { type: 'text' })}
                            className={`p-3 rounded-md flex flex-col items-center justify-center border ${
                              question.type === 'text'
                                ? 'border-primary-500 bg-primary-50 text-primary-600'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <MessageSquare size={24} className={question.type === 'text' ? 'text-primary-500' : 'text-gray-500'} />
                            <span className="text-sm mt-2">Texte libre</span>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded text-primary-600 focus:ring-primary-500"
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-700">Réponse obligatoire</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={addQuestion}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    disabled={form.questions.length >= 3}
                  >
                    <PlusCircle size={16} />
                    Ajouter une question
                  </button>
                  {form.questions.length >= 3 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Vous avez atteint le nombre maximum de questions (3).
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Design Tab */}
            {activeTab === 'design' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="logoUrl" className="form-label">Logo (URL)</label>
                    <div className="flex">
                      <input
                        id="logoUrl"
                        type="text"
                        className="form-input"
                        placeholder="https://votre-site.com/logo.png"
                        value={form.settings.logoUrl}
                        onChange={(e) => updateSettings('logoUrl', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bannerUrl" className="form-label">Image de bannière (URL)</label>
                    <div className="flex">
                      <input
                        id="bannerUrl"
                        type="text"
                        className="form-input"
                        placeholder="https://votre-site.com/banner.jpg"
                        value={form.settings.bannerUrl}
                        onChange={(e) => updateSettings('bannerUrl', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="primaryColor" className="form-label">Couleur principale</label>
                    <div className="flex">
                      <input
                        id="primaryColor"
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded-l-md"
                        value={form.settings.primaryColor}
                        onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input rounded-l-none"
                        value={form.settings.primaryColor}
                        onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="backgroundColor" className="form-label">Couleur de fond</label>
                    <div className="flex">
                      <input
                        id="backgroundColor"
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded-l-md"
                        value={form.settings.backgroundColor}
                        onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input rounded-l-none"
                        value={form.settings.backgroundColor}
                        onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Redirection selon la note</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Redirigez vos clients vers différentes pages selon leur note.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="redirectLowScore" className="form-label">
                        Si note &lt; 4, rediriger vers :
                      </label>
                      <input
                        id="redirectLowScore"
                        type="text"
                        className="form-input"
                        placeholder="https://facebook.com/votre-page"
                        value={form.settings.redirectLowScore}
                        onChange={(e) => updateSettings('redirectLowScore', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ex: Vos réseaux sociaux pour amélioration
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="redirectHighScore" className="form-label">
                        Si note ≥ 4, rediriger vers :
                      </label>
                      <input
                        id="redirectHighScore"
                        type="text"
                        className="form-input"
                        placeholder="https://g.page/r/votre-business"
                        value={form.settings.redirectHighScore}
                        onChange={(e) => updateSettings('redirectHighScore', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ex: Votre fiche Google Business
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Share Tab */}
            {activeTab === 'share' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Lien public</h3>
                  <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between">
                    <span className="text-gray-600">{previewUrl}</span>
                    <button 
                      className="text-primary-600 hover:text-primary-700"
                      onClick={() => navigator.clipboard.writeText(previewUrl)}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">QR Code</h3>
                  <div className="bg-white border border-gray-200 rounded-md p-6 flex flex-col items-center">
                    <QRCode value={previewUrl} size={180} />
                    <button className="mt-4 btn btn-secondary flex items-center gap-2">
                      <QrCode size={16} />
                      Télécharger le QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Preview Panel */}
        <div>
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Aperçu</h2>
              <div className="flex p-1 bg-gray-100 rounded-md">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded ${
                    previewMode === 'mobile' 
                      ? 'bg-white shadow-sm' 
                      : 'text-gray-500'
                  }`}
                >
                  <Smartphone size={16} />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded ${
                    previewMode === 'desktop' 
                      ? 'bg-white shadow-sm' 
                      : 'text-gray-500'
                  }`}
                >
                  <Desktop size={16} />
                </button>
              </div>
            </div>
            
            <div className={`border border-gray-200 rounded-lg mx-auto overflow-hidden ${
              previewMode === 'mobile' ? 'w-72' : 'w-full'
            }`}>
              <div 
                className="p-4" 
                style={{ backgroundColor: form.settings.backgroundColor }}
              >
                {form.settings.logoUrl && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={form.settings.logoUrl} 
                      alt="Logo" 
                      className="h-12 object-contain"
                    />
                  </div>
                )}
                
                {form.settings.bannerUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={form.settings.bannerUrl} 
                      alt="Banner" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  {form.name && <h3 className="text-lg font-medium mb-2">{form.name}</h3>}
                  {form.description && <p className="text-gray-600 text-sm mb-6">{form.description}</p>}
                  
                  <div className="space-y-6">
                    {form.questions.map((question, index) => (
                      <div key={question.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <p className="text-sm font-medium mb-3">
                          {question.text}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        
                        {question.type === 'note' && (
                          <div className="flex justify-center">
                            <div className="flex space-x-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={24} 
                                  className="text-amber-400 cursor-pointer" 
                                  fill={star <= 3 ? '#FBBF24' : 'none'}
                                />
                              ))}
                            </div>
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
                          ></textarea>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      className="w-full py-2 rounded-md font-medium"
                      style={{ 
                        backgroundColor: form.settings.primaryColor, 
                        color: 'white'
                      }}
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFormPage;

export default CreateFormPage