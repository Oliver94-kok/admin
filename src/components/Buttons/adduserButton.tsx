"use client";
import { useState } from 'react';
import Modal from "@/components/modal";

const AddUserButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Dummy username and password
    const username = "user123";
    const password = "pass1234";

    return (
        <><button
            type="button"
            className="flex items-center justify-center w-full max-w-xs mx-auto rounded-full bg-primary p-3 px-5 font-small text-white hover:bg-opacity-90"
            onClick={handleOpenModal}
        >
            Add User
        </button><Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                username={username}
                password={password} /></>
    );
};

export default AddUserButton;
