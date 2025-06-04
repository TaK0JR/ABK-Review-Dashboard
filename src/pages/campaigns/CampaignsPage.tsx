import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  MailPlus, 
  Calendar, 
  Users,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Trash,
  Pencil,
  Copy,
  Eye
} from 'lucide-react';

// Sample data for campaigns
const campaigns = [
  {
    id: '1',
    name: 'Campagne Satisfaction Client',
    type: 'email',
    status: 'active',
    sentAt: '15/07/2025',
    recipients: 85,
    openRate: 62,
    responseRate: 48,
  },
  {
    id: '2',
    name: 'Suivi Post-Achat',
    type: 'sms',
    status: 'scheduled',
    scheduledFor: '28/07/2025',
    recipients: 124,
    openRate: 0,
    responseRate: 0,
  },
  {
    id: '3',
    name: 'Anniversaire Client',
    type: 'email',
    status: 'completed',
    sentAt: '03/06/2025',
    recipients: 47,
    openRate: 75,
    responseRate: 53,
  },
];

const CampaignsPage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Campagnes</h1>
        <Link to="/campaigns/create" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={16} />
          Nouvelle campagne
        </Link>
      </div>
      
      {campaigns.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12">
          <MailPlus className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune campagne</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Créez votre première campagne pour collecter des avis clients par email ou SMS.
          </p>
          <Link to="/campaigns/create" className="btn btn-primary">
            Créer une campagne
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performances
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {campaign.type === 'email' ? (
                        <Mail className="h-4 w-4 text-blue-500 mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-500">
                        {campaign.type === 'email' ? 'Email' : 'SMS'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      campaign.status === 'active' 
                        ? 'badge-green' 
                        : campaign.status === 'scheduled' 
                          ? 'badge-blue' 
                          : 'badge-gray'
                    }`}>
                      {campaign.status === 'active' && 'En cours'}
                      {campaign.status === 'scheduled' && 'Planifiée'}
                      {campaign.status === 'completed' && 'Terminée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.status === 'scheduled' 
                      ? <div className="flex items-center"><Calendar className="h-4 w-4 text-blue-500 mr-2" />{campaign.scheduledFor}</div>
                      : campaign.sentAt
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500">{campaign.recipients}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {campaign.status === 'scheduled' ? (
                      <span className="text-sm text-gray-500">-</span>
                    ) : (
                      <div className="flex space-x-3">
                        <div>
                          <div className="text-xs text-gray-500">Ouverture</div>
                          <div className="text-sm font-medium">{campaign.openRate}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Réponses</div>
                          <div className="text-sm font-medium">{campaign.responseRate}%</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <Link
                        to={`/campaigns/edit/${campaign.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Copy size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Campagnes Email</h3>
              <p className="text-sm text-gray-500">Envoyez des emails pour recueillir des avis</p>
            </div>
          </div>
          <Link to="/campaigns/create?type=email" className="btn btn-primary w-full">
            Créer une campagne email
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Campagnes SMS</h3>
              <p className="text-sm text-gray-500">Envoyez des SMS pour un taux de réponse élevé</p>
            </div>
          </div>
          <Link to="/campaigns/create?type=sms" className="btn btn-primary w-full">
            Créer une campagne SMS
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Campagnes Automatiques</h3>
              <p className="text-sm text-gray-500">Programmez des envois récurrents</p>
            </div>
          </div>
          <Link to="/campaigns/create?type=auto" className="btn btn-primary w-full">
            Créer une campagne automatique
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;