// src/components/Buttons/plusButton.tsx
import React from 'react';

interface ButtonPopupProps {
  onClick: () => void;
  customClasses?: string;
}

const ButtonPopup: React.FC<ButtonPopupProps> = ({ onClick, customClasses }) => {
  return (
    <button
      onClick={onClick}
      className={`border border-blue-500 text-blue-500 px-4 py-2 rounded flex items-center justify-between ${customClasses}`}
    >
      Add
    </button>
  );
};

export default ButtonPopup;
