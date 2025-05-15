import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Star } from 'lucide-react';
import { Recipe } from '../../types/Recipe';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, className = '' }) => {
  // Calculate average rating
  const avgRating = recipe.ratings.length > 0
    ? recipe.ratings.reduce((sum, rating) => sum + rating.value, 0) / recipe.ratings.length
    : 0;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>
      <Link to={`/recipes/${recipe.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 text-gray-800">{recipe.title}</h3>
          
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              <span>By Owner</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1 text-gray-600" />
              <span className="text-gray-600">{recipe.cookingTimeMinutes || Math.ceil(recipe.steps.length * 5)} min</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Star className={`h-4 w-4 ${avgRating > 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
              <span className="ml-1 text-sm text-gray-600">
                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {recipe.tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block bg-gray-100 rounded-full px-2 py-1 mr-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;