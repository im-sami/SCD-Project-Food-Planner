import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/authContext";

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="logo">
          Recipe App
        </Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-item">
              Dashboard
            </Link>
            <Link to="/cookbook" className="nav-item">
              Cookbook
            </Link>
            <Link to="/mealplanner" className="nav-item">
              Meal Planner
            </Link>
            <Link to="/shopping-list" className="nav-item">
              Shopping List
            </Link>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">
              Login
            </Link>
            <Link to="/register" className="nav-item">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
