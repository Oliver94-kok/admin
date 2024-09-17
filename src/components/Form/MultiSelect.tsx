// src/components/MultiSelect.tsx
import React from 'react';
import { SelectedItem } from '../Tables/SalaryTable';

interface MultiSelectProps {
    items: SelectedItem[];
    onRemove: (item: string) => void;
    id: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ items, onRemove, id }) => {
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
                            onClick={() => onRemove(item.id)}
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
