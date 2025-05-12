import React from 'react';
import { ChefHat, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <ChefHat className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">FoodPlanner</span>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center mb-2">
              <span className="mr-2">Made with</span>
              <Heart className="h-4 w-4 text-red-500 mr-2" />
              <span>and React</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Github className="h-4 w-4 mr-1" />
              <span>© {new Date().getFullYear()} FoodPlanner. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;