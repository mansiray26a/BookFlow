import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <h1 className="text-6xl font-heading font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => navigate('/')} variant="primary" size="md">
          <Home className="w-4 h-4 mr-1.5" />
          Go Home
        </Button>
        <Button onClick={() => navigate('/catalog')} variant="outline" size="md">
          <Search className="w-4 h-4 mr-1.5" />
          Browse Catalog
        </Button>
      </div>
    </div>
  );
};
