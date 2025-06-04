import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Star, 
  TrendingUp, 
  Calendar, 
  FileEdit, 
  MailPlus, 
  Gift,
  BarChart4,
  Users
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Sample data for charts
const reviewsData = [
  { month: 'Jan', reviews: 20 },
  { month: 'Fév', reviews: 28 },
  { month: 'Mar', reviews: 25 },
  { month: 'Avr', reviews: 32 },
  { month: 'Mai', reviews: 38 },
  { month: 'Juin', reviews: 42 },
  { month: 'Juil', reviews: 50 },
];

const scoresData = [
  { name: '1 ★', count: 5 },
  { name: '2 ★', count: 8 },
  { name: '3 ★', count: 12 },
  { name: '4 ★', count: 25 },
  { name: '5 ★', count: 50 },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Star className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Avis reçus</div>
            <div className="text-2xl font-semibold">178</div>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Score moyen</div>
            <div className="text-2xl font-semibold">4.2/5</div>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Prochaine campagne</div>
            <div className="text-2xl font-semibold">28 Juil</div>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <Users className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Clients</div>
            <div className="text-2xl font-semibold">213</div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/review-forms/create" 
            className="card bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="rounded-full bg-blue-500 p-2 mr-4">
              <FileEdit className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium">Créer un formulaire</div>
              <div className="text-sm text-gray-600">Personnalisez vos questions</div>
            </div>
          </Link>
          
          <Link 
            to="/campaigns/create" 
            className="card bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="rounded-full bg-green-500 p-2 mr-4">
              <MailPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium">Lancer une campagne</div>
              <div className="text-sm text-gray-600">Email ou SMS</div>
            </div>
          </Link>
          
          <Link 
            to="/gifts/create" 
            className="card bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="rounded-full bg-amber-500 p-2 mr-4">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium">Créer un cadeau</div>
              <div className="text-sm text-gray-600">Récompensez vos clients</div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Avis reçus</h2>
            <div className="badge badge-blue">+12% ce mois</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reviewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3366FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3366FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="reviews" 
                stroke="#3366FF" 
                fillOpacity={1} 
                fill="url(#colorReviews)" 
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Répartition des notes</h2>
            <div className="badge badge-green">4.2 moyenne</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={scoresData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#00b49b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Activités récentes</h2>
          <Link to="/customers" className="text-sm text-primary-600 hover:text-primary-700">
            Voir tout
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      EB
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Emma Bernard</div>
                      <div className="text-sm text-gray-500">emma@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-blue">Avis déposé</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Il y a 2 heures
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                      TM
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Thomas Martin</div>
                      <div className="text-sm text-gray-500">thomas@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-green">Cadeau utilisé</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hier
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                      SD
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Sophie Dubois</div>
                      <div className="text-sm text-gray-500">sophie@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-yellow">Campagne envoyée</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  23 Juil 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                    <Star className="h-4 w-4" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;