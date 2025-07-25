// src/components/ShortPopup.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../modal'; // Make sure this path is correct
import MultiSelect from './MultiSelect'; // Ensure this import path is correct
import { SelectedItem, typeComponentSalary } from '../Tables/SalaryTable';
import { getLocale } from '@/locales/dictionary';
import { SalaryUser } from '@/types/salary';

interface ShortPopupv2Props {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: string, id: string, type: typeComponentSalary) => void;
    data: SalaryUser // Add items prop
    type: typeComponentSalary
}

const ShortPopupv2: React.FC<ShortPopupv2Props> = ({ isOpen, onClose, onAddItem, data, type, }) => {
    const [inputValue, setInputValue] = useState('');
    const [dict, setDict] = useState<any>(null); // State to hold the dictionary

    const handleAddItem = () => {
        if (inputValue.trim()) {
            const confirmAdd = window.confirm(dict.salary.addthis);
            if (confirmAdd) {
                onAddItem(inputValue.trim(), data.id!, type);
                setInputValue('');
            }
        }
    };

    useEffect(() => {
        const locale = getLocale();
        const loadDictionary = async () => {
            const dictionaries = {
                en: () => import('../../locales/en/lang.json').then((module) => module.default),
                zh: () => import('../../locales/zh/lang.json').then((module) => module.default),
            };

            const languageDict = await dictionaries[locale]();
            setDict(languageDict);
        };
        loadDictionary();
    }, []);

    if (!dict) return <div>Loading...</div>; // Show a loading state until the dictionary is loaded

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={`popup ${isOpen ? 'open' : ''}`}>
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">{dict.salary.addshort}</h2>
                    <p className="text-lg text-green-600 mb-4">{data.users?.name} ({data.users?.AttendBranch?.branch})</p>
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

export default ShortPopupv2;
