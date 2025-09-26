import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const showNavigation = location.pathname === '/create' || location.pathname === '/calendar';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <main className="flex justify-center">
          <div className="w-full max-w-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;