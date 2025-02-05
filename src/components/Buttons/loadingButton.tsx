// components/LoadingButton.js
import { useState } from 'react';

interface LoadingButtonProp {
    name: string
    click: () => void
    isloading: boolean
    // setLoading: (loading: boolean) => void;
}


const LoadingButton = ({ name, click, isloading }: LoadingButtonProp) => {
    // const [isLoading, setIsLoading] = useState(false);

    // const handleClick = async () => {
    //     setIsLoading(true);

    //     // Simulate an async operation (e.g., API call)
    //     await new Promise((resolve) => setTimeout(resolve, 2000));

    //     setIsLoading(false);
    // };

    return (
        <button
            onClick={click}
            disabled={isloading}
            className={`text-sm font-medium uppercase hover:text-blue-600 xsm:text-base transition-colors duration-200 ${isloading
                ? ' cursor-not-allowed' // Disabled state
                : ' ' // Normal state
                }`}
        >
            {isloading ? (
                <div className="flex items-center">
                    <svg
                        className="animate-spin h-5 w-5 mr-3 text-blue"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Loading...
                </div>
            ) : (
                <>
                    {name}
                </>
            )}
        </button>
    );
};

export default LoadingButton;