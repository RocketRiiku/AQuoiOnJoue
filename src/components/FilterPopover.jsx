import { useState, useRef, useEffect } from "react";

function FilterPopover({ label, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white text-black rounded-full font-bold shadow-md hover:bg-gray-100 transition"
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-20 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterPopover;
