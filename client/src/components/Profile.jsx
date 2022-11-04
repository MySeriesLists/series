import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
const Profile = () => {
    return (
        <div>
            <Navbar />
            <h1>Profile</h1>
            {/* make a card with progress bar containing the user's progress in percentage  : completed, pending, total */}
            <div className="flex justify-center w-full mt-6 mb-8">
                <div className="block p-6 rounded-lg shadow-lg bg-white">
                    <h5 className="text-2xl font-bold">User's stats</h5>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                         <div className="bg-blue-600 h-2.5 rounded-full" ></div>
                    </div>
                    <div className="flex mt-6 mb-8 justify-between text-xs text-gray-600 dark:text-gray-400">
                        
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">Default</span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Dark</span>
                        <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">Red</span>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">Green</span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">Yellow</span>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-200 dark:text-indigo-900">Indigo</span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-purple-200 dark:text-purple-900">Purple</span>
                        <span className="bg-pink-100 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-pink-200 dark:text-pink-900">Pink</span>

                    </div>

                 </div>
            </div>
            <Footer />


        </div>
    );
}
export default Profile;
