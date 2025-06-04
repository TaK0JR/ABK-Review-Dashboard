import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };
  
  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-gray-200 border-t-white',
  };
  
  return (
    <div 
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
};

export default Loading;