import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Modal2({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "md",
}: ModalProps) {
    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        full: "sm:max-w-full",
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal container */}
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
                {/* Modal content */}
                <div
                    className={`relative inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle ${maxWidthClasses[maxWidth]}`}
                    onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    {/* Modal header */}
                    {title && (
                        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
                            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                        </div>
                    )}

                    {/* Modal body */}
                    <div className="px-4 py-5 sm:p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}