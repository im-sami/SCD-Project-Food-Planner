import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { MealPlan, MealSlot } from '../types/MealPlan';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useRecipes } from './RecipeContext';
import { format, startOfWeek } from 'date-fns';
import { API_URL } from '../config/api';

interface MealPlanContextType {
  currentMealPlan: MealPlan | null;
  createWeeklyPlan: (weekStartDate: Date) => Promise<MealPlan>;
  addRecipeToSlot: (date: string, recipeId: string, mealType: string) => Promise<void>;
  removeRecipeFromSlot: (slotId: string) => Promise<void>;
  getShoppingList: () => Promise<{ name: string; quantity: number; unit: string }[]>;
  loading: boolean;
  error: string | null;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export const MealPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { getRecipeById } = useRecipes();

  // Load meal plan when user changes or on initial mount
  useEffect(() => {
    if (currentUser) {
      fetchMealPlan();
    }
  }, [currentUser]);

  // Fetch meal plan from API
  const fetchMealPlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
      const formattedWeekStart = format(weekStart, 'yyyy-MM-dd');

      const response = await axios.get(`${API_URL}/mealplans?weekStart=${formattedWeekStart}`);
      setCurrentMealPlan(response.data);

      // Fallback to local storage or create new plan if API returns empty
      if (!response.data) {
        const storedMealPlan = currentUser ? localStorage.getItem(`mealPlan-${currentUser.id}`) : null;
        if (storedMealPlan) {
          setCurrentMealPlan(JSON.parse(storedMealPlan));
        } else {
          // Create a default meal plan for the current week
          await createWeeklyPlan(weekStart);
        }
      }
    } catch (err) {
      setError('Failed to fetch meal plan');

      // Fallback to local storage if API fails
      const storedMealPlan = localStorage.getItem(`mealPlan-${currentUser?.id}`);
      if (storedMealPlan) {
        setCurrentMealPlan(JSON.parse(storedMealPlan));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save meal plan to localStorage as backup whenever it changes
  useEffect(() => {
    if (currentUser && currentMealPlan) {
      localStorage.setItem(`mealPlan-${currentUser.id}`, JSON.stringify(currentMealPlan));
    }
  }, [currentUser, currentMealPlan]);

  const createWeeklyPlan = async (weekStartDate: Date): Promise<MealPlan> => {
    if (!currentUser) throw new Error('User must be logged in to create a meal plan');

    const formattedWeekStart = format(weekStartDate, 'yyyy-MM-dd');

    setLoading(true);
    setError(null);

    try {
      // Create a new meal plan via API
      const response = await axios.post(`${API_URL}/mealplans`, {
        weekStartDate: formattedWeekStart,
      });

      setCurrentMealPlan(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to create meal plan');

      // Fallback to local creation if API fails
      const newMealPlan: MealPlan = {
        _id: '', // Let backend generate _id
        userId: currentUser.id,
        weekStartDate: formattedWeekStart,
        slots: [],
      };

      setCurrentMealPlan(newMealPlan);
      return newMealPlan;
    } finally {
      setLoading(false);
    }
  };

  const addRecipeToSlot = async (date: string, recipeId: string, mealType: string): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in to update a meal plan');
    if (!currentMealPlan) throw new Error('No active meal plan');

    const recipe = getRecipeById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    setLoading(true);
    setError(null);

    try {
      // Add to API if there's an _id (means it's from the backend)
      if (currentMealPlan._id) {
        await axios.put(`${API_URL}/mealplans/${currentMealPlan._id}/slots`, {
          date,
          recipeId,
          mealType,
        });
        await fetchMealPlan(); // Refresh data
      } else {
        // Fallback to local update
        const newSlot: MealSlot = {
          _id: uuidv4(),
          date,
          recipeId,
          mealType,
        };

        setCurrentMealPlan((prevPlan) => {
          if (!prevPlan) return null;

          return {
            ...prevPlan,
            slots: [...prevPlan.slots, newSlot],
          };
        });
      }
    } catch (err) {
      setError('Failed to add recipe to slot');

      // Fallback to local update if API fails
      const newSlot: MealSlot = {
        _id: uuidv4(),
        date,
        recipeId,
        mealType,
      };

      setCurrentMealPlan((prevPlan) => {
        if (!prevPlan) return null;

        return {
          ...prevPlan,
          slots: [...prevPlan.slots, newSlot],
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const removeRecipeFromSlot = async (slotId: string): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in to update a meal plan');
    if (!currentMealPlan) throw new Error('No active meal plan');

    setLoading(true);
    setError(null);

    try {
      // Use API if there's an _id (means it's from the backend)
      if (currentMealPlan._id) {
        // Find the slot to get its date
        const slotIndex = currentMealPlan.slots.findIndex((s) => s._id === slotId);
        if (slotIndex !== -1) {
          const slotDate = currentMealPlan.slots[slotIndex].date;
          await axios.put(`${API_URL}/mealplans/${currentMealPlan._id}/slots`, {
            date: slotDate,
            recipeId: null,
          });
          await fetchMealPlan(); // Refresh data
        }
      } else {
        // Fallback to local update
        setCurrentMealPlan((prevPlan) => {
          if (!prevPlan) return null;

          return {
            ...prevPlan,
            slots: prevPlan.slots.filter((slot) => slot._id !== slotId),
          };
        });
      }
    } catch (err) {
      setError('Failed to remove recipe from slot');

      // Fallback to local update if API fails
      setCurrentMealPlan((prevPlan) => {
        if (!prevPlan) return null;

        return {
          ...prevPlan,
          slots: prevPlan.slots.filter((slot) => slot._id !== slotId),
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const getShoppingList = async (): Promise<{ name: string; quantity: number; unit: string }[]> => {
    if (!currentMealPlan) return [];

    setLoading(true);
    setError(null);

    try {
      // Use API if there's an _id (means it's from the backend)
      if (currentMealPlan._id) {
        const response = await axios.get(`${API_URL}/mealplans/${currentMealPlan._id}/shopping-list?format=json`);
        return response.data;
      } else {
        // Fallback to local calculation
        return calculateShoppingList();
      }
    } catch (err) {
      setError('Failed to generate shopping list');

      // Fallback to local calculation if API fails
      return calculateShoppingList();
    } finally {
      setLoading(false);
    }
  };

  const calculateShoppingList = () => {
    if (!currentMealPlan) return [];

    const ingredientMap = new Map<string, { quantity: number; unit: string }>();

    currentMealPlan.slots.forEach((slot) => {
      const recipe = getRecipeById(slot.recipeId);
      if (recipe) {
        recipe.ingredients.forEach((ingredient) => {
          const key = ingredient.name.toLowerCase();

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            if (existing.unit === ingredient.unit) {
              existing.quantity += ingredient.quantity;
            } else {
              // Handle different units
              existing.quantity += ingredient.quantity;
              existing.unit = existing.unit || ingredient.unit;
            }
          } else {
            ingredientMap.set(key, {
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            });
          }
        });
      }
    });

    // Convert Map to array
    const shoppingList = Array.from(ingredientMap.entries()).map(([name, details]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      quantity: details.quantity,
      unit: details.unit,
    }));

    // Sort alphabetically by name
    return shoppingList.sort((a, b) => a.name.localeCompare(b.name));
  };

  const value = {
    currentMealPlan,
    createWeeklyPlan,
    addRecipeToSlot,
    removeRecipeFromSlot,
    getShoppingList,
    loading,
    error,
  };

  return <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>;
};