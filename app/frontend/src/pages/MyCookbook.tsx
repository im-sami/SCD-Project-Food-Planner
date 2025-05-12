import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, BookOpen, Filter } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/recipes/RecipeCard';

const MyCookbook: React.FC = () => {
  const { filterRecipes } = useRecipes();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  // Get user's recipes (created or shared with them)
  const userRecipes = filterRecipes(searchQuery, selectedTag, true);
  
  // Get all unique tags from user's recipes
  const allTags = [...new Set(userRecipes.flatMap(recipe => recipe.tags))].sort();

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-green-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                My Cookbook
              </h1>
              
              <Link 
                to="/recipes/new"
                className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Recipe
              </Link>
            </div>
          </div>
          
          {/* Search & Filters */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search your recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="relative w-full sm:w-48">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Categories</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Recipe Grid */}
          <div className="p-6">
            {userRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map(recipe => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No recipes found</h2>
                {searchQuery || selectedTag ? (
                  <p className="text-gray-600">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">
                      You haven't created any recipes yet.
                    </p>
                    <Link 
                      to="/recipes/new"
                      className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Your First Recipe
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCookbook;