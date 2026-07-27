import { useState } from "react";
import WhatAppIcon from "@/assets/whatsapp.svg";

export default function WhatsAppButton() {
  const size = 56; 

  const [position, setPosition] = useState({
    x: window.innerWidth - size - 20,
    y: window.innerHeight - size - 20,
  });

  const [dragging, setDragging] = useState(false);

  const startDrag = (e) => {
    setDragging(true);

    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    const startY = e.touches ? e.touches[0].clientY : e.clientY;

    const initialX = position.x;
    const initialY = position.y;

    const move = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;

      let newX = initialX + (clientX - startX);
      let newY = initialY + (clientY - startY);

      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size;

      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX > maxX) newX = maxX;
      if (newY > maxY) newY = maxY;

      setPosition({ x: newX, y: newY });
    };

    const stop = () => {
      setDragging(false);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", stop);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", move);
    document.addEventListener("touchend", stop);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: "none",
      }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      <a
        href={
          dragging
            ? "#"
            : "https://wa.me/923433083783?text=Hi%20BAMBOTIA%2C%20I%20need%20help%20with%20my%20order"
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={WhatAppIcon}
          alt="WhatsApp"
          className="w-11 h-11"
        />
      </a>
    </div>
  );
}