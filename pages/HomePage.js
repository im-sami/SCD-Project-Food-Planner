import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../auth/authContext";
import Navigation from "../components/Navigation";

const HomePage = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect logged in users to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="home-page">
      <Navigation />
      <div className="hero-section">
        <h1>Welcome to Recipe App</h1>
        <p>Organize your recipes, plan your meals, and create shopping lists</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>
      {/* Other home page content for non-logged in users */}
    </div>
  );
};

export default HomePage;
