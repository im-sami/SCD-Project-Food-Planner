import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import MyCookbook from './pages/MyCookbook';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RecipeProvider>
          <MealPlanProvider>
            <div className="flex flex-col min-h-screen bg-neutral-50">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/recipes/new" element={
                    <ProtectedRoute>
                      <RecipeForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/recipes/edit/:id" element={
                    <ProtectedRoute>
                      <RecipeForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/meal-planner" element={
                    <ProtectedRoute>
                      <MealPlanner />
                    </ProtectedRoute>
                  } />
                  <Route path="/shopping-list" element={
                    <ProtectedRoute>
                      <ShoppingList />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-cookbook" element={
                    <ProtectedRoute>
                      <MyCookbook />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </MealPlanProvider>
        </RecipeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;