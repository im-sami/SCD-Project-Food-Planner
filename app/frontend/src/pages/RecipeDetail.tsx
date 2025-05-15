import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Star, Edit, Trash2, MessageSquare, Share2 } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import { useMealPlan } from '../contexts/MealPlanContext';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getRecipeById, addComment, addRating, deleteRecipe } = useRecipes();
  const { currentUser, isAuthenticated } = useAuth();
  const { addRecipeToSlot } = useMealPlan();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(id ? getRecipeById(id) : undefined);
  const [comment, setComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAddToMealPlanOpen, setIsAddToMealPlanOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState('dinner');
  
  // Update recipe if id changes
  useEffect(() => {
    if (id) {
      setRecipe(getRecipeById(id));
    }
  }, [id, getRecipeById]);
  
  // Redirect if recipe not found
  useEffect(() => {
    if (!recipe && id) {
      navigate('/');
    }
  }, [recipe, navigate, id]);
  
  if (!recipe) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  // Calculate average rating
  const avgRating = recipe.ratings.length > 0
    ? recipe.ratings.reduce((sum, rating) => sum + rating.value, 0) / recipe.ratings.length
    : 0;
  
  // Check if current user has already rated
  const userPreviousRating = currentUser
    ? recipe.ratings.find(rating => rating.userId === currentUser.id)
    : undefined;
  
  // Set initial user rating if they've already rated
  useEffect(() => {
    if (userPreviousRating) {
      setUserRating(userPreviousRating.value);
    }
  }, [userPreviousRating]);
  
  const handleRatingClick = async (rating: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await addRating(recipe._id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error('Failed to add rating:', error);
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) return;
    
    try {
      await addComment(recipe._id, comment);
      setComment('');
      setRecipe(getRecipeById(recipe._id)); // Refresh recipe data
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(recipe._id);
        navigate('/my-cookbook');
      } catch (error) {
        console.error('Failed to delete recipe:', error);
      }
    }
  };
  
  const handleAddToMealPlan = () => {
    try {
      addRecipeToSlot(selectedDate, recipe._id, selectedMealType);
      setIsAddToMealPlanOpen(false);
      alert('Recipe added to meal plan!');
    } catch (error) {
      console.error('Failed to add to meal plan:', error);
    }
  };
  
  const isOwner = currentUser && recipe.ownerId === currentUser.id;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-md overflow-hidden">
        {/* Recipe Header */}
        <div className="relative">
          <div className="h-80 overflow-hidden">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{recipe.title}</h1>
            <div className="flex items-center text-white/90 mb-2">
              <Clock className="h-5 w-5 mr-1" />
              <span>{recipe.cookingTimeMinutes || Math.ceil(recipe.steps.length * 5)} minutes</span>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-1 text-yellow-400" />
                <span>{avgRating.toFixed(1)} ({recipe.ratings.length} ratings)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-white/20 text-white px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button 
                onClick={() => setIsAddToMealPlanOpen(!isAddToMealPlanOpen)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                Add to Meal Plan
              </button>
            )}
          </div>
          
          {isOwner && (
            <div className="flex space-x-2">
              <Link 
                to={`/recipes/edit/${recipe._id}`}
                className="bg-green-50 text-green-700 hover:bg-green-100 font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
              <button 
                onClick={handleDelete}
                className="bg-red-50 text-red-700 hover:bg-red-100 font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
        
        {/* Add to Meal Plan Form */}
        {isAddToMealPlanOpen && (
          <div className="bg-green-50 p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add to Meal Plan</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select 
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="flex-1 flex items-end">
                <button 
                  onClick={handleAddToMealPlan}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-800 font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span>
                      <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span> {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Instructions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Instructions</h2>
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-xs text-white font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          {/* Ratings and Comments */}
          <div className="mt-12 border-t pt-8">
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Rate this recipe</h3>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        (hoverRating ? star <= hoverRating : star <= userRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {userRating > 0 ? 'Your rating' : 'Rate this recipe'}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comments ({recipe.comments.length})
              </h3>
              
              {isAuthenticated && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              )}
              
              <div className="space-y-4">
                {recipe.comments.length > 0 ? (
                  recipe.comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{comment.userId === currentUser?.id ? 'You' : 'User'}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;