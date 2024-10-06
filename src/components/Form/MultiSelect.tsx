import React from 'react';
import { SelectedItem } from '../Tables/SalaryTable';

interface MultiSelectProps {
    items: SelectedItem[];
    onRemove: (item: string) => void;
    id: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ items, onRemove, id }) => {
    const handleRemove = (itemId: string) => {
        const confirmRemove = window.confirm("Are you sure you want to remove this item?");
        if (confirmRemove) {
            onRemove(itemId); // Only remove if user confirms
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                item.id === id.toString() ? (
                    <div
                        key={index}
                        className={`${item.item.includes('-') ? 'bg-red-500' : 'bg-blue-500'
                            } text-white px-4 py-2 rounded flex items-center`}
                    >
                        {item.item}
                        <button
                            onClick={() => handleRemove(item.id)}
                            className="ml-2 text-white hover:text-gray-300"
                        >
                            &times;
                        </button>
                    </div>
                ) : null
            ))}
        </div>
    );
};

export default MultiSelect;
