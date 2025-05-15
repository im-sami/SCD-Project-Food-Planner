import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, Upload, X } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';

const RecipeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getRecipeById, createRecipe, updateRecipe } = useRecipes();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<{ name: string; quantity: number; unit: string }[]>([
    { name: '', quantity: 0, unit: '' },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState(30); // Added cooking time state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const recipe = getRecipeById(id);
      if (recipe) {
        setTitle(recipe.title);
        setImageUrl(recipe.imageUrl);
        setIngredients(recipe.ingredients);
        setSteps(recipe.steps);
        setCookingTimeMinutes(recipe.cookingTimeMinutes || 30); // Set cooking time from recipe
        setTags(recipe.tags);
        setIsPublic(recipe.isPublic);
      }
    }
  }, [id, getRecipeById]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      setError('At least one ingredient is required');
      return;
    }

    const validSteps = steps.filter((step) => step.trim() !== '');
    if (validSteps.length === 0) {
      setError('At least one step is required');
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('ingredients', JSON.stringify(validIngredients));
      formData.append('steps', JSON.stringify(validSteps));
      formData.append('cookingTimeMinutes', String(cookingTimeMinutes)); // Add cooking time to form data
      formData.append('tags', JSON.stringify(tags));
      formData.append('isPublic', String(isPublic));
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      if (id) {
        await updateRecipe(id, formData);
        navigate(`/recipes/${id}`);
      } else {
        const newRecipe = await createRecipe(formData);
        navigate(`/recipes/${newRecipe._id}`);
      }
    } catch (err) {
      setError('Failed to save recipe. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: 'name' | 'quantity' | 'unit', value: string | number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'quantity' ? Number(value) : value,
    };
    setIngredients(updatedIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {id ? 'Edit Recipe' : 'Create New Recipe'}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Chocolate Chip Cookies"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Image
              </label>
              <div className="flex">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
                />
                <div className="bg-gray-100 p-2 border border-l-0 border-gray-300 rounded-r-md flex items-center justify-center">
                  <Upload className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF (max 5MB)
              </p>
              {imageUrl && (
                <div className="mt-2">
                  <div className="h-40 w-full overflow-hidden rounded-md">
                    <img
                      src={imageUrl}
                      alt="Recipe preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-1">
                Cooking Time (minutes)
              </label>
              <input
                type="number"
                id="cookingTime"
                value={cookingTimeMinutes}
                onChange={(e) => setCookingTimeMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 30"
                min="1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center text-sm text-green-600 hover:text-green-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </button>
              </div>

              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={ingredient.quantity || ''}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-20 p-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className="w-20 p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      disabled={ingredients.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex items-center text-sm text-green-600 hover:text-green-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </button>
              </div>

              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full text-green-800 font-medium text-sm mt-2">
                      {index + 1}
                    </div>
                    <textarea
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      disabled={steps.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Italian, Vegetarian, Quick"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-green-700 hover:text-green-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this recipe public
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Public recipes can be discovered by all users of the platform.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium py-2 px-6 rounded-md transition-colors`}
              >
                {isLoading ? 'Saving...' : id ? 'Update Recipe' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecipeForm;