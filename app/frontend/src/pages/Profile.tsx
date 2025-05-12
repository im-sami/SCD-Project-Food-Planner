import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!name.trim() || !email.trim()) {
      setMessage({ text: 'Name and email are required', type: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      await updateProfile({ name, email });
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update profile', type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-green-600 text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          
          {/* Profile Form */}
          <div className="p-6">
            {message.text && (
              <div className={`p-4 rounded-md mb-6 ${
                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${
                    isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                  } flex items-center justify-center text-white font-medium py-2 px-4 rounded-md w-full transition-colors`}
                >
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
              
              <button
                onClick={logout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;