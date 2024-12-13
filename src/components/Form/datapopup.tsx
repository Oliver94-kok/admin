// src/components/DataPopup.tsx
import React, { useState } from 'react';

interface DataPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (year: string, month: string, team: string) => void;
}

const DataPopup: React.FC<DataPopupProps> = ({ isOpen, onClose, onExport }) => {
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [team, setTeam] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleExport = () => {
        // Validation
        if (!year.trim() || !month.trim() || !team.trim()) {
            setErrorMessage('All fields must be filled out.');
            return;
        }

        // Clear any existing error message
        setErrorMessage('');

        // Proceed with the export if validation is successful
        onExport(year.trim(), month.trim(), team.trim());

        // Clear form fields after exporting
        setYear('');
        setMonth('');
        setTeam('');
    };

    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg mx-4 md:mx-auto p-8 w-[600px] max-w-[90%]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-black dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-300 text-3xl font-bold p-2"
                    aria-label="Close modal"
                >
                    &times;
                </button>

                {/* Popup Header */}
                <div className="popup-header text-black p-4 rounded-t-md">
                    <h2 className="text-lg font-bold">Export Data</h2>
                </div>

                {/* Popup Body */}
                <div className="p-4 bg-white rounded-b-md shadow-lg">
                    <div className="flex flex-col gap-4">
                        {/* Year Input */}
                        <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg"
                            placeholder="Enter year (e.g., 2024)"
                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        />

                        {/* Month Input */}
                        <input
                            type="text"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg"
                            placeholder="Enter month (e.g., January)"
                            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        />

                        {/* Team Selection */}
                        <select
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg"
                        >
                            <option value="">Select team</option>
                            <option value="A">Team A</option>
                            <option value="B">Team B</option>
                            <option value="C">Team C</option>
                            <option value="D">Team D</option>
                        </select>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="text-red-500 mt-2">{errorMessage}</div>
                        )}

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
                        >
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataPopup;