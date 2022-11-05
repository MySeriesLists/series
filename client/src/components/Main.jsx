// dashboard component for list of movies and series with search bar
import React  from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import CookieBanner from './utils/CookieBanner';
import Comments from './utils/comments/Comments';
const Main = () => {
    return (
        <div>
            <Navbar />
            <div className="main">
                <h1>Dashboard</h1>
            </div>
            <Comments />


            <CookieBanner />
            <Footer />
        </div>
    );
}




export default Main;
