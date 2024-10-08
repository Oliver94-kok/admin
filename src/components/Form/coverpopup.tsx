// src/components/CoverPopup.tsx
import React, { useState } from 'react';
import Modal from '../modal'; // Make sure this path is correct
import MultiSelect from './MultiSelect'; // Ensure this import path is correct
import { SelectedItem, typeComponentSalary } from '../Tables/SalaryTable';

interface CoverPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: string, id: string, type: typeComponentSalary) => void;
    id: string;
    items: SelectedItem[]; // Add items prop
    type: typeComponentSalary
}

const CoverPopup: React.FC<CoverPopupProps> = ({ isOpen, onClose, onAddItem, id, items, type }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddItem = () => {
        if (inputValue.trim()) {
            const confirmAdd = window.confirm("Are you sure you want to add this?");
            if (confirmAdd) {
                onAddItem(inputValue.trim(), id, type);
                setInputValue('');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={`popup ${isOpen ? 'open' : ''}`}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Add Cover</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="border border-gray-300 p-2 rounded flex-grow"
                            placeholder="Example: 100"
                        />
                        <button
                            onClick={handleAddItem}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CoverPopup;
