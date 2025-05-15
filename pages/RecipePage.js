import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../auth/authContext";

const RecipePage = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("RecipePage mounted with recipeId:", recipeId); // Debugging

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recipes/${recipeId}`, {
          headers: {
            Authorization: `Bearer ${user?.token || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch recipe: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Recipe data:", data); // Debugging
        setRecipe(data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId, user]);

  return (
    <div className="recipe-page">
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {recipe && (
        <div>
          <h1>{recipe.title}</h1>
          <p>{recipe.description}</p>
          {/* Add more recipe details here */}
        </div>
      )}
    </div>
  );
};

export default RecipePage;
