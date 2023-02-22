import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";

const TopButton = () => {
  const [showButton, setShowButton] = useState(false);

  const scrollToTop = () => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const handleShowButton = () => {
      if (window.scrollY > 500) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleShowButton);
    return () => {
      window.removeEventListener("scroll", handleShowButton);
    };
  }, []);

  return (
    <>
      {showButton && (
        <div className="scroll__container fixed right-[5%] bottom-[14%] z-50">
          <button
            className="rounded-full w-16 h-16 font-light text-sm text-[#ff6161]/60 bg-white border border-[#ff6161]/50 hover:text-[#ff6161] hover:bg-[#FFF0F0] hover:border-none "
            id="top"
            onClick={scrollToTop}
            type="button"
          >
            Top
          </button>
        </div>
      )}
    </>
  );
};

export default TopButton;
