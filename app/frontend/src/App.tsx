import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected pages
import MealPlanner from './pages/MealPlanner';
import Profile from './pages/Profile';
import RecipeForm from './pages/RecipeForm';
import ShoppingList from './pages/ShoppingList';
import RecipeDetail from './pages/RecipeDetail';
import MyCookbook from './pages/MyCookbook';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RecipeProvider>
        <MealPlanProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes */}
                  <Route path="/meal-planner" element={
                    <ProtectedRoute>
                      <MealPlanner />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
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
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
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
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </MealPlanProvider>
      </RecipeProvider>
    </AuthProvider>
  );
};

export default App;