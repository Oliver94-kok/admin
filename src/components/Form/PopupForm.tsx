// src/components/PopupForm.tsx
import React, { useState } from 'react';
import Modal from '../modal'; // Make sure this path is correct

interface PopupFormProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: string, id: string) => void;
    id: string;
}

const PopupForm: React.FC<PopupFormProps> = ({ isOpen, onClose, onAddItem, id }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddItem = () => {
        if (inputValue.trim()) {
            const confirmAdd = window.confirm("Are you sure you want to add this?");
            if (confirmAdd) {
                onAddItem(inputValue.trim(), id);
                setInputValue('');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Add OT</h2>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="border border-gray-300 p-2 rounded flex-grow"
                        placeholder="Example:100"
                    />
                    <button
                        onClick={handleAddItem}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PopupForm;
