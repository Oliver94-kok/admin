"use client"
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
        <>


            <button
                type="button"
                className="flex w-full rounded-full bg-primary p-[13px] pl-10 pr-10 font-medium text-white hover:bg-opacity-90"
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
