import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useRecipes } from '../contexts/RecipeContext';
import { Link } from 'react-router-dom';

const MealPlanner: React.FC = () => {
  const { currentMealPlan, createWeeklyPlan, addRecipeToSlot, removeRecipeFromSlot } = useMealPlan();
  const { recipes } = useRecipes();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
  });
  
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState('dinner');
  
  // Initialize the meal plan for the current week if none exists
  useEffect(() => {
    if (!currentMealPlan) {
      createWeeklyPlan(currentWeekStart);
    }
  }, [currentMealPlan, currentWeekStart, createWeeklyPlan]);
  
  // Update meal plan when changing weeks
  useEffect(() => {
    if (currentMealPlan && format(currentWeekStart, 'yyyy-MM-dd') !== currentMealPlan.weekStartDate) {
      createWeeklyPlan(currentWeekStart);
    }
  }, [currentWeekStart, currentMealPlan, createWeeklyPlan]);
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  const handlePrevWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7));
  };
  
  const handleAddRecipeToDay = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleAddSelectedRecipe = () => {
    if (selectedRecipe && selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      addRecipeToSlot(dateStr, selectedRecipe, selectedMealType);
      setSelectedRecipe(null);
      setSelectedDate(null);
    }
  };
  
  // Group recipes by meal type and date
  const getRecipesForDay = (date: Date) => {
    if (!currentMealPlan) return { breakfast: [], lunch: [], dinner: [], snack: [] };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots = currentMealPlan.slots.filter(slot => slot.date === dateStr);
    
    const mealsByType: Record<string, { id: string; recipe: any; slotId: string }[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    
    slots.forEach(slot => {
      const recipe = recipes.find(r => r._id === slot.recipeId);
      if (recipe) {
        if (!mealsByType[slot.mealType]) {
          mealsByType[slot.mealType] = [];
        }
        mealsByType[slot.mealType].push({
          id: recipe._id,
          recipe,
          slotId: slot._id
        });
      }
    });
    
    return mealsByType;
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-green-600 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Meal Planner</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevWeek}
                  className="p-2 rounded-full hover:bg-green-500 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-medium">
                  {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                </span>
                <button
                  onClick={handleNextWeek}
                  className="p-2 rounded-full hover:bg-green-500 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                  className="ml-2 flex items-center bg-white text-green-600 px-3 py-1 rounded-md text-sm"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Today
                </button>
              </div>
            </div>
          </div>
          
          {/* Calendar */}
          <div className="grid grid-cols-7 border-b">
            {days.map((day, i) => (
              <div key={i} className="border-r last:border-r-0 text-center p-2 bg-gray-50">
                <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                <p className={`text-sm ${isSameDay(day, new Date()) ? 'font-bold text-green-600' : ''}`}>
                  {format(day, 'MMM d')}
                </p>
              </div>
            ))}
          </div>
          
          {/* Meal Slots */}
          <div className="grid grid-cols-7 border-b">
            {days.map((day, i) => {
              const mealsForDay = getRecipesForDay(day);
              
              return (
                <div 
                  key={i} 
                  className={`border-r last:border-r-0 min-h-[calc(100vh-24rem)] p-2 ${
                    isSameDay(day, new Date()) ? 'bg-green-50' : ''
                  }`}
                >
                  {/* Breakfast */}
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-1">Breakfast</h3>
                    {mealsForDay.breakfast.map(({ recipe, slotId }) => (
                      <div 
                        key={slotId} 
                        className="bg-white p-2 rounded-md shadow-sm mb-2 relative"
                      >
                        <button
                          onClick={() => removeRecipeFromSlot(slotId)}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
                          aria-label="Remove recipe"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                        <Link to={`/recipes/${recipe.id}`} className="text-xs font-medium block truncate">
                          {recipe.title}
                        </Link>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddRecipeToDay(day)}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-1 rounded-md text-xs flex items-center justify-center text-gray-600"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  {/* Lunch */}
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-1">Lunch</h3>
                    {mealsForDay.lunch.map(({ recipe, slotId }) => (
                      <div 
                        key={slotId} 
                        className="bg-white p-2 rounded-md shadow-sm mb-2 relative"
                      >
                        <button
                          onClick={() => removeRecipeFromSlot(slotId)}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
                          aria-label="Remove recipe"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                        <Link to={`/recipes/${recipe.id}`} className="text-xs font-medium block truncate">
                          {recipe.title}
                        </Link>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddRecipeToDay(day)}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-1 rounded-md text-xs flex items-center justify-center text-gray-600"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  {/* Dinner */}
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-1">Dinner</h3>
                    {mealsForDay.dinner.map(({ recipe, slotId }) => (
                      <div 
                        key={slotId} 
                        className="bg-white p-2 rounded-md shadow-sm mb-2 relative"
                      >
                        <button
                          onClick={() => removeRecipeFromSlot(slotId)}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
                          aria-label="Remove recipe"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                        <Link to={`/recipes/${recipe.id}`} className="text-xs font-medium block truncate">
                          {recipe.title}
                        </Link>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddRecipeToDay(day)}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-1 rounded-md text-xs flex items-center justify-center text-gray-600"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  {/* Snack */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-1">Snack</h3>
                    {mealsForDay.snack.map(({ recipe, slotId }) => (
                      <div 
                        key={slotId} 
                        className="bg-white p-2 rounded-md shadow-sm mb-2 relative"
                      >
                        <button
                          onClick={() => removeRecipeFromSlot(slotId)}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
                          aria-label="Remove recipe"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                        <Link to={`/recipes/${recipe.id}`} className="text-xs font-medium block truncate">
                          {recipe.title}
                        </Link>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddRecipeToDay(day)}
                      className="w-full bg-gray-100 hover:bg-gray-200 p-1 rounded-md text-xs flex items-center justify-center text-gray-600"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Add Recipe Modal */}
          {selectedDate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">
                  Add Recipe to {format(selectedDate, 'EEEE, MMMM d')}
                </h2>
                
                <div className="mb-4">
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
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Recipe
                  </label>
                  <select 
                    value={selectedRecipe || ''}
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Select a recipe --</option>
                    {recipes.map(recipe => (
                      <option key={recipe._id} value={recipe._id}>{recipe.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedRecipe(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSelectedRecipe}
                    disabled={!selectedRecipe}
                    className={`${
                      !selectedRecipe ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                    } text-white font-medium py-2 px-4 rounded-md transition-colors`}
                  >
                    Add Recipe
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="p-4 flex justify-between items-center bg-gray-50">
            <Link 
              to="/shopping-list"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Generate Shopping List
            </Link>
            
            <Link 
              to="/recipes/new"
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;