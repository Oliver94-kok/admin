// src/components/MultiSelect.tsx
import React from 'react';

interface MultiSelectProps {
    items: string[];
    onRemove: (item: string) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ items, onRemove }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                >
                    {item}
                    <button
                        onClick={() => onRemove(item)}
                        className="ml-2 text-white hover:text-gray-300"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MultiSelect;
