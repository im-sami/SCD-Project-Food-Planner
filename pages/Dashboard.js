import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/authContext";
import Navigation from "../components/Navigation";

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect non-logged in users to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard">
      <Navigation />
      <div className="dashboard-content">
        <h1>Welcome, {user.name || "User"}!</h1>
        <div className="dashboard-options">
          <div className="dashboard-card">
            <h3>My Cookbook</h3>
            <p>View and manage your saved recipes</p>
          </div>
          <div className="dashboard-card">
            <h3>Meal Planner</h3>
            <p>Plan your meals for the week</p>
          </div>
          <div className="dashboard-card">
            <h3>Shopping List</h3>
            <p>Generate and manage your shopping lists</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
