// src/components/Modal.tsx
import React, { useRef, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl?: string; // Optional prop for image display
    username?: string; // Optional prop for username
    password?: string; // Optional prop for password
    children?: React.ReactNode; // Optional prop for generic content
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageUrl, username, password, children }) => {
    const modalRefImage = useRef<HTMLDivElement>(null);
    const modalRefCredentials = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                (modalRefImage.current && !modalRefImage.current.contains(event.target as Node)) &&
                (modalRefCredentials.current && !modalRefCredentials.current.contains(event.target as Node))
            ) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null; // Don't render the modal if it's not open

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleModalClose = () => {
        fetchData();
        onClose(); // Close the modal
    };

    const fetchData = () => {
        // Logic to fetch data from an API or server
        console.log('Fetching data...');

        // Simulate data fetching (replace with actual fetch logic)
        setTimeout(() => {
            window.location.reload(); // Refresh the page after data fetching
        }, 250); // Optional delay for the refresh
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg mx-4 md:mx-auto p-8"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-black dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-300 text-3xl font-bold p-2"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {/* {imageUrl ? (
                    <img src={imageUrl} alt="Modal" className="max-w-full max-h-screen" />
                ) : (
                    <div className="p-6">{children}</div>
                )} */}
                {imageUrl ? (
                    <div ref={modalRefImage} className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg mx-4 md:mx-auto p-8">
                        <img
                            src={imageUrl}
                            alt="Modal"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                ) : username && password ? (
                    <div ref={modalRefCredentials} className="relative bg-white dark:bg-gray-800 rounded-lg w-[300px] h-[300px] mx-4 md:mx-auto p-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Credentials</h4>
                            <div className="mb-4">
                                <p className="font-medium">Username:</p>
                                <p className="text-gray-800">{username}</p>
                            </div>
                            <div className="mb-4">
                                <p className="font-medium">Password:</p>
                                <p className="text-gray-800">{password}</p>
                            </div>
                        </div>
                        <div className="flex justify-between mt-10">
                            <button
                                className="text-blue-500 underline mt-1"
                                // onClick={() => handleCopy(username)}
                                onClick={() => handleCopy(
                                    'Username:' + username + '  ' + 'Password:' + password)}
                            >
                                Copy
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                onClick={handleModalClose}
                            >
                                Done
                            </button>

                        </div>
                    </div>
                ) : (
                    <div>{children}</div>
                )}
            </div>
        </div>
    );
};

export default Modal;
