import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Recipe, Comment, Rating } from '../types/Recipe';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/api';

interface RecipeContextType {
  recipes: Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
  createRecipe: (recipe: FormData) => Promise<Recipe>;
  updateRecipe: (id: string, recipe: FormData) => Promise<Recipe>;
  deleteRecipe: (id: string) => Promise<void>;
  addComment: (recipeId: string, text: string) => Promise<Comment>;
  addRating: (recipeId: string, value: number) => Promise<Rating>;
  filterRecipes: (query: string, tag?: string, onlyMine?: boolean) => Recipe[];
  loading: boolean;
  error: string | null;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

// Sample recipe data for fallback if API fails
const sampleRecipes: Recipe[] = [
  {
    _id: '1',
    title: 'Spaghetti Carbonara',
    imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress',
    ingredients: [
      { name: 'Spaghetti', quantity: 200, unit: 'g' },
      { name: 'Eggs', quantity: 2, unit: '' },
      { name: 'Pecorino cheese', quantity: 50, unit: 'g' },
      { name: 'Guanciale', quantity: 100, unit: 'g' },
      { name: 'Black pepper', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      'Bring a large pot of salted water to a boil and cook the spaghetti until al dente.',
      'Meanwhile, cut the guanciale into small pieces and cook in a pan until crispy.',
      'In a bowl, beat the eggs and add grated pecorino cheese and black pepper.',
      'Drain the pasta and add it to the pan with the guanciale, away from heat.',
      'Add the egg mixture and stir quickly to create a creamy sauce.',
      'Serve immediately with extra cheese and black pepper on top.',
    ],
    tags: ['Italian', 'Pasta', 'Dinner', 'Quick'],
    ownerId: '1',
    isPublic: true,
    ratings: [{ userId: '2', value: 5 }],
    comments: [{ id: '1', userId: '2', text: 'Delicious recipe!', createdAt: '2023-04-15T10:30:00Z' }],
    createdAt: '2023-04-10T14:30:00Z',
  },
  {
    _id: '2',
    title: 'Avocado Toast',
    imageUrl: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress',
    ingredients: [
      { name: 'Sourdough bread', quantity: 2, unit: 'slices' },
      { name: 'Avocado', quantity: 1, unit: '' },
      { name: 'Lemon juice', quantity: 1, unit: 'tsp' },
      { name: 'Red pepper flakes', quantity: 0.5, unit: 'tsp' },
      { name: 'Salt', quantity: 1, unit: 'pinch' },
    ],
    steps: [
      'Toast the bread until golden and crisp.',
      'In a small bowl, mash the avocado with lemon juice and salt.',
      'Spread the avocado mixture on the toast.',
      'Sprinkle with red pepper flakes and additional salt if desired.',
    ],
    tags: ['Breakfast', 'Vegetarian', 'Quick', 'Healthy'],
    ownerId: '1',
    isPublic: true,
    ratings: [{ userId: '3', value: 4 }],
    comments: [{ id: '2', userId: '3', text: 'Perfect breakfast!', createdAt: '2023-04-16T08:20:00Z' }],
    createdAt: '2023-04-12T09:15:00Z',
  },
  {
    _id: '3',
    title: 'Classic Chocolate Cake',
    imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress',
    ingredients: [
      { name: 'All-purpose flour', quantity: 2, unit: 'cups' },
      { name: 'Granulated sugar', quantity: 2, unit: 'cups' },
      { name: 'Unsweetened cocoa powder', quantity: 0.75, unit: 'cup' },
      { name: 'Baking powder', quantity: 2, unit: 'tsp' },
      { name: 'Baking soda', quantity: 1.5, unit: 'tsp' },
      { name: 'Salt', quantity: 1, unit: 'tsp' },
      { name: 'Eggs', quantity: 2, unit: '' },
      { name: 'Milk', quantity: 1, unit: 'cup' },
      { name: 'Vegetable oil', quantity: 0.5, unit: 'cup' },
      { name: 'Vanilla extract', quantity: 2, unit: 'tsp' },
      { name: 'Boiling water', quantity: 1, unit: 'cup' },
    ],
    steps: [
      'Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.',
      'In a large bowl, combine flour, sugar, cocoa, baking powder, baking soda, and salt.',
      'Add eggs, milk, oil, and vanilla; beat on medium speed for 2 minutes.',
      'Stir in boiling water (batter will be thin). Pour into prepared pans.',
      'Bake for 30-35 minutes or until a toothpick inserted in center comes out clean.',
      'Cool in pans for 10 minutes; remove to wire racks to cool completely.',
    ],
    tags: ['Dessert', 'Chocolate', 'Baking'],
    ownerId: '2',
    isPublic: true,
    ratings: [{ userId: '1', value: 5 }],
    comments: [
      { id: '3', userId: '1', text: 'Amazing cake!', createdAt: '2023-04-18T16:45:00Z' },
      { id: '4', userId: '3', text: 'I love this recipe.', createdAt: '2023-04-19T10:30:00Z' },
    ],
    createdAt: '2023-04-14T11:20:00Z',
  },
];

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/recipes`);
      setRecipes(response.data);
    } catch (err) {
      setError('Failed to fetch recipes');
      // Fallback to sample data if API fails
      setRecipes(sampleRecipes);
    } finally {
      setLoading(false);
    }
  };

  const getRecipeById = (id: string) => {
    return recipes.find((recipe) => recipe._id === id);
  };

  const createRecipe = async (recipeData: FormData): Promise<Recipe> => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('User must be logged in to create a recipe');

      const response = await axios.post(`${API_URL}/recipes`, recipeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token
        },
      });

      const newRecipe = response.data;
      setRecipes((prevRecipes) => [...prevRecipes, newRecipe]);
      return newRecipe;
    } catch (err) {
      setError('Failed to create recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = async (id: string, recipeData: FormData): Promise<Recipe> => {
    setLoading(true);
    setError(null);
    try {
      // Check if user can edit this recipe
      const recipe = recipes.find((r) => r._id === id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      if (recipe.ownerId !== currentUser?.id) {
        throw new Error('You can only update your own recipes');
      }

      const response = await axios.put(`${API_URL}/recipes/${id}`, recipeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token
        },
      });

      const updatedRecipe = response.data;
      setRecipes((prevRecipes) => prevRecipes.map((r) => (r._id === id ? updatedRecipe : r)));
      return updatedRecipe;
    } catch (err) {
      setError('Failed to update recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Check if user can delete this recipe
      const recipe = recipes.find((r) => r._id === id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      if (recipe.ownerId !== currentUser?.id) {
        throw new Error('You can only delete your own recipes');
      }

      await axios.delete(`${API_URL}/recipes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token
        },
      });
      setRecipes((prevRecipes) => prevRecipes.filter((r) => r._id !== id));
    } catch (err) {
      setError('Failed to delete recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (recipeId: string, text: string): Promise<Comment> => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }

      console.log('Sending comment request:', { recipeId, text }); // Debug log
      const response = await axios.post(
        `${API_URL}/recipes/${recipeId}/comments`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token
          },
        }
      );
      const newComment = response.data;

      // Update local state
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId ? { ...recipe, comments: [...recipe.comments, newComment] } : recipe
        )
      );

      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err); // Debug log
      setError('Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRating = async (recipeId: string, value: number): Promise<Rating> => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to rate');
      }

      if (value < 1 || value > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const response = await axios.post(
        `${API_URL}/recipes/${recipeId}/ratings`,
        { value },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token
        },
      });
      const newRating = response.data;

      // Update local state with new rating
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) => {
          if (recipe._id !== recipeId) return recipe;

          // Check if user already rated this recipe
          const existingRatingIndex = recipe.ratings.findIndex((rating) => rating.userId === currentUser.id);

          let updatedRatings;
          if (existingRatingIndex >= 0) {
            // Update existing rating
            updatedRatings = [...recipe.ratings];
            updatedRatings[existingRatingIndex] = newRating;
          } else {
            // Add new rating
            updatedRatings = [...recipe.ratings, newRating];
          }

          return { ...recipe, ratings: updatedRatings };
        })
      );

      return newRating;
    } catch (err) {
      setError('Failed to add rating');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = (query: string, tag?: string, onlyMine?: boolean): Recipe[] => {
    return recipes.filter((recipe) => {
      // Filter by search query (check title and ingredients)
      const matchesQuery =
        query === '' ||
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(query.toLowerCase()));

      // Filter by tag
      const matchesTag = !tag || recipe.tags.includes(tag);

      // Filter by owner
      const matchesOwner = !onlyMine || (currentUser && recipe.ownerId === currentUser.id);

      // Filter by visibility
      const isVisible = recipe.isPublic || (currentUser && recipe.ownerId === currentUser.id);

      return matchesQuery && matchesTag && matchesOwner && isVisible;
    });
  };

  const value = {
    recipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addComment,
    addRating,
    filterRecipes,
    loading,
    error,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};