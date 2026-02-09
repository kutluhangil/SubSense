import React from 'react';

const FooterCredit = () => {
    return (
        <div className="w-full py-6 flex justify-center items-center relative z-50 bg-white dark:bg-gray-900 transition-colors duration-300">
            <p className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity duration-300 text-center px-4 cursor-default">
                <span className="bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-[length:300%_auto] animate-rainbow bg-clip-text text-transparent drop-shadow-sm hover:drop-shadow-md transition-all duration-300">
                    Built by Kutluhan — shipped with curiosity, caffeine, and lots of commits ☕🚀
                </span>
            </p>
        </div>
    );
};

export default FooterCredit;
