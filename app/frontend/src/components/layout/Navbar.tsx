import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChefHat, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-green-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ChefHat className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-xl font-semibold">FoodPlanner</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/meal-planner" className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Meal Planner
                </Link>
                <Link to="/my-cookbook" className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  My Cookbook
                </Link>
                <Link to="/shopping-list" className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Shopping List
                </Link>
                <div className="ml-4 relative flex items-center">
                  <Link to="/profile" className="flex items-center text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <User className="h-5 w-5 mr-1" />
                    {currentUser?.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-white hover:bg-green-700 p-2 rounded-full transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-green-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-green-600">
            <Link 
              to="/"
              className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/meal-planner"
                  className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meal Planner
                </Link>
                <Link 
                  to="/my-cookbook"
                  className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Cookbook
                </Link>
                <Link 
                  to="/shopping-list"
                  className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shopping List
                </Link>
                <Link 
                  to="/profile"
                  className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;