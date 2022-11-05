// cookies banner component with local storage
import React, { useState, useEffect } from 'react';
const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
    useEffect(() => {
        if (localStorage.getItem('cookieBanner') === null) {
        setShowBanner(true);
        }
    }, []);
    const handleAccept = () => {
        localStorage.setItem('cookieBanner', 'true');
        setShowBanner(false);
    };
    return (
        <div className="max-w-xs" style={{maxWidth:240}}>
        {showBanner && (
            <div className="cookie-banner ">
                        <div class="fixed bottom-4 right-1 lg:right-4 p-4 bg-white border-t-4 shadow-lg">

	<div class="lg:flex lg:space-x-5">
		<p class="mb-5 font-medium text-gray-600">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus maximus condimentum libero. Nulla tempus metus sit amet
			sagittis tempus. Donec maximus odio nibh, ut congue ante dictum suscipit.
		</p>
		<button onClick={handleAccept}
		class="w-full lg:w-48 px-3 py-1 bg-gray-300 hover:bg-gray-200 hover:underline rounded text-gray-700 mr-2 mb-5 uppercase tracking-widest text-xs font-bold">
			I agree
		</button>
	</div>
                        </div>
            </div>
            
        )}
        </div
        >
    );
    }
export default CookieBanner;
