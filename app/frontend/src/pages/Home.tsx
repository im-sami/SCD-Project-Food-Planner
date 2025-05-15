import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/recipes/RecipeCard';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { recipes, filterRecipes } = useRecipes();
  const { isAuthenticated } = useAuth();
  
  // Get all unique tags from recipes
  const allTags = [...new Set(recipes.flatMap(recipe => recipe.tags))].sort();
  
  // Filter recipes based on search and tag
  const filteredRecipes = filterRecipes(searchQuery, selectedTag);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Plan, Cook, Enjoy</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover delicious recipes, plan your meals for the week, and generate shopping lists with ease.
            </p>
            <div className="flex justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-cookbook"
                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md shadow transition-colors mr-4"
                  >
                    Go to My Cookbook
                  </Link>
                  <Link
                    to="/meal-planner"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-6 rounded-md transition-colors"
                  >
                    Try Meal Planning
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md shadow transition-colors mr-4"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/meal-planner"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-6 rounded-md transition-colors"
                  >
                    Try Meal Planning
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Discover Recipes</h2>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">No recipes found matching your search.</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Discover Recipes</h3>
              <p className="text-gray-600">Browse through our collection of recipes or create your own to share with the community.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Plan Your Meals</h3>
              <p className="text-gray-600">Drag and drop recipes onto our interactive calendar to plan your week's meals.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Generate Shopping Lists</h3>
              <p className="text-gray-600">Automatically create shopping lists based on your meal plan with just one click.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/meal-planner" 
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              Start Planning Now
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;