import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  Star, 
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  UserPlus,
  Pencil,
  Trash,
  ArrowDown,
  ArrowUp,
  ArrowLeft
} from 'lucide-react';

// Sample data for customers
const customers = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Bernard',
    email: 'emma@example.com',
    phone: '0687654321',
    birthdate: '15/04/1988',
    lastInteraction: '24/07/2025',
    score: 5,
    reviews: 2,
    purchases: 4,
    source: 'Site web',
  },
  {
    id: '2',
    firstName: 'Thomas',
    lastName: 'Martin',
    email: 'thomas@example.com',
    phone: '0678901234',
    birthdate: '03/11/1992',
    lastInteraction: '23/07/2025',
    score: 4,
    reviews: 1,
    purchases: 2,
    source: 'Boutique',
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie@example.com',
    phone: '0612345678',
    birthdate: '22/08/1990',
    lastInteraction: '22/07/2025',
    score: 3,
    reviews: 1,
    purchases: 1,
    source: 'Recommandation',
  },
  {
    id: '4',
    firstName: 'Lucas',
    lastName: 'Petit',
    email: 'lucas@example.com',
    phone: '0698765432',
    birthdate: '07/02/1985',
    lastInteraction: '20/07/2025',
    score: 5,
    reviews: 3,
    purchases: 6,
    source: 'Site web',
  },
  {
    id: '5',
    firstName: 'Julie',
    lastName: 'Laurent',
    email: 'julie@example.com',
    phone: '0654321098',
    birthdate: '30/06/1995',
    lastInteraction: '18/07/2025',
    score: 4,
    reviews: 2,
    purchases: 3,
    source: 'Campagne email',
  },
];

// Filterable fields and options
const filters = [
  { id: 'score', name: 'Note', options: [
    { value: '5', label: '5 étoiles' },
    { value: '4', label: '4 étoiles ou plus' },
    { value: '3', label: '3 étoiles ou plus' },
    { value: '1-2', label: 'Moins de 3 étoiles' },
  ]},
  { id: 'reviews', name: 'Avis', options: [
    { value: '0', label: 'Aucun avis' },
    { value: '1+', label: '1 ou plus' },
    { value: '3+', label: '3 ou plus' },
  ]},
  { id: 'purchases', name: 'Achats', options: [
    { value: '0', label: 'Aucun achat' },
    { value: '1+', label: '1 ou plus' },
    { value: '3+', label: '3 ou plus' },
  ]},
  { id: 'source', name: 'Source', options: [
    { value: 'site web', label: 'Site web' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'recommandation', label: 'Recommandation' },
    { value: 'campagne', label: 'Campagne email' },
  ]},
];

type SortField = 'name' | 'lastInteraction' | 'score' | 'reviews';
type SortDirection = 'asc' | 'desc';

const CustomersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('lastInteraction');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Toggle sort direction
  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Update active filters
  const updateFilter = (filterId: string, value: string) => {
    if (activeFilters[filterId] === value) {
      // Remove filter if same value is selected
      const updatedFilters = { ...activeFilters };
      delete updatedFilters[filterId];
      setActiveFilters(updatedFilters);
    } else {
      // Set or update filter
      setActiveFilters({
        ...activeFilters,
        [filterId]: value,
      });
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };
  
  // Filter customers based on search and active filters
  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchLower);
      const emailMatch = customer.email.toLowerCase().includes(searchLower);
      const phoneMatch = customer.phone.includes(searchLower);
      
      if (!nameMatch && !emailMatch && !phoneMatch) {
        return false;
      }
    }
    
    // Apply active filters
    for (const [filterId, filterValue] of Object.entries(activeFilters)) {
      if (filterId === 'score') {
        if (filterValue === '5' && customer.score !== 5) return false;
        if (filterValue === '4' && customer.score < 4) return false;
        if (filterValue === '3' && customer.score < 3) return false;
        if (filterValue === '1-2' && customer.score > 2) return false;
      }
      
      if (filterId === 'reviews') {
        if (filterValue === '0' && customer.reviews !== 0) return false;
        if (filterValue === '1+' && customer.reviews < 1) return false;
        if (filterValue === '3+' && customer.reviews < 3) return false;
      }
      
      if (filterId === 'purchases') {
        if (filterValue === '0' && customer.purchases !== 0) return false;
        if (filterValue === '1+' && customer.purchases < 1) return false;
        if (filterValue === '3+' && customer.purchases < 3) return false;
      }
      
      if (filterId === 'source' && customer.source.toLowerCase() !== filterValue.toLowerCase()) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    }
    
    if (sortBy === 'lastInteraction') {
      // Simple date comparison (assuming DD/MM/YYYY format)
      const dateA = a.lastInteraction.split('/').reverse().join('');
      const dateB = b.lastInteraction.split('/').reverse().join('');
      return sortDirection === 'asc' 
        ? dateA.localeCompare(dateB) 
        : dateB.localeCompare(dateA);
    }
    
    if (sortBy === 'score') {
      return sortDirection === 'asc' 
        ? a.score - b.score 
        : b.score - a.score;
    }
    
    if (sortBy === 'reviews') {
      return sortDirection === 'asc' 
        ? a.reviews - b.reviews 
        : b.reviews - a.reviews;
    }
    
    return 0;
  });
  
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={16} />
            Exporter CSV
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <UserPlus size={16} />
            Ajouter un client
          </button>
        </div>
      </div>
      
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              onClick={toggleFilters}
            >
              <Filter size={16} />
              Filtres
              {Object.keys(activeFilters).length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-primary-600 rounded-full">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </button>
            
            {Object.keys(activeFilters).length > 0 && (
              <button 
                className="btn btn-secondary flex items-center gap-2"
                onClick={clearFilters}
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.id}>
                  <label className="form-label">{filter.name}</label>
                  <select
                    className="form-input"
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => updateFilter(filter.id, e.target.value)}
                  >
                    <option value="">Tous</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {filteredCustomers.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun client trouvé</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Aucun client ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
          </p>
          <button 
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Client
                      {sortBy === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('lastInteraction')}
                  >
                    <div className="flex items-center">
                      Dernière activité
                      {sortBy === 'lastInteraction' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('score')}
                  >
                    <div className="flex items-center">
                      Note
                      {sortBy === 'score' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('reviews')}
                  >
                    <div className="flex items-center">
                      Avis
                      {sortBy === 'reviews' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {customer.birthdate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={14} className="mr-1 text-gray-500" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone size={14} className="mr-1 text-gray-500" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastInteraction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < customer.score ? 'fill-current' : ''}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-blue">
                        {customer.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Pencil size={16} />
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
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {filteredCustomers.length} clients sur {customers.length} au total
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded hover:bg-gray-200"
                disabled={true}
              >
                <ArrowLeft size={16} />
              </button>
              <span className="px-3 py-1 rounded bg-primary-100 text-primary-600 font-medium">1</span>
              <button 
                className="p-2 rounded hover:bg-gray-200"
                disabled={true}
              >
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;