import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileEdit, Share2, Copy, Smartphone, LampDesk as Desktop, MoreHorizontal, Trash, Link as LinkIcon, Pencil } from 'lucide-react';

// Sample data for review forms
const reviewForms = [
  {
    id: '1',
    name: 'Formulaire Standard',
    createdAt: '12/06/2025',
    questions: 3,
    responses: 78,
    active: true,
    url: 'abk-review.com/form/standard-form',
  },
  {
    id: '2',
    name: 'Livraison Express',
    createdAt: '25/05/2025',
    questions: 2,
    responses: 42,
    active: true,
    url: 'abk-review.com/form/livraison-express',
  },
  {
    id: '3',
    name: 'Satisfaction Produit',
    createdAt: '03/04/2025',
    questions: 3,
    responses: 124,
    active: false,
    url: 'abk-review.com/form/satisfaction-produit',
  },
];

const ReviewFormPage: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would show a notification here
    alert('URL copiée !');
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Formulaires d'avis</h1>
        <Link to="/review-forms/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={16} />
          Nouveau formulaire
        </Link>
      </div>
      
      {reviewForms.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12">
          <FileEdit className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun formulaire</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Créez votre premier formulaire de récolte d'avis pour commencer à recueillir les retours de vos clients.
          </p>
          <Link to="/review-forms/create" className="btn btn-primary">
            Créer un formulaire
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewForms.map((form) => (
            <div key={form.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{form.name}</h3>
                  <p className="text-sm text-gray-500">Créé le {form.createdAt}</p>
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-md hover:bg-gray-100">
                    <MoreHorizontal size={18} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                    <div className="py-1">
                      <Link 
                        to={`/review-forms/edit/${form.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil size={16} className="mr-2" />
                        Modifier
                      </Link>
                      <a 
                        href="#" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={(e) => {
                          e.preventDefault();
                          copyToClipboard(form.url);
                        }}
                      >
                        <Copy size={16} className="mr-2" />
                        Copier l'URL
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
              
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-1.5 mr-2">
                      <FileEdit className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm">{form.questions} questions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-1.5 mr-2">
                      <Share2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm">{form.responses} réponses</span>
                  </div>
                </div>
                <div>
                  <span className={`badge ${form.active ? 'badge-green' : 'badge-gray'}`}>
                    {form.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate" title={form.url}>
                  {form.url}
                </span>
                <button 
                  className="text-primary-600 hover:text-primary-700"
                  onClick={() => copyToClipboard(form.url)}
                >
                  <Copy size={16} />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/review-forms/edit/${form.id}`}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Pencil size={16} />
                  Modifier
                </Link>
                <Link
                  to="#"
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Partager
                </Link>
              </div>
            </div>
          ))}
          
          <Link 
            to="/review-forms/create" 
            className="card border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-8 hover:bg-gray-100 transition-colors"
          >
            <PlusCircle className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-gray-600 font-medium">Nouveau formulaire</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReviewFormPage;