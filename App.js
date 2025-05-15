import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/authContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MealPlanner from "./pages/MealPlanner";
import Cookbook from "./pages/Cookbook";
import ShoppingList from "./pages/ShoppingList";
import RecipePage from "./pages/RecipePage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - only accessible when NOT logged in */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes - only accessible when logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mealplanner" element={<MealPlanner />} />
            <Route path="/cookbook" element={<Cookbook />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/recipe/:recipeId" element={<RecipePage />} />
          </Route>

          {/* Redirect root to dashboard if logged in, otherwise to login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
