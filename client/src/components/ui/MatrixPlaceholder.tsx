"use client";

import { useEffect, useRef, useState } from "react";

const MatrixPlaceholder: React.FC<{
  className?: string;
  digitCount?: number;
}> = ({
  className = "",
  digitCount = 20, // Default number of digits
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in effect
    setTimeout(() => setIsVisible(true), 10);

    // Initialize columns reference array
    columnsRef.current = Array(digitCount).fill(null);

    // Create animation frames for each column
    const animateColumns = () => {
      columnsRef.current.forEach((column, index) => {
        if (!column) return;

        // Each column has its own state
        if (!column.dataset.position) {
          column.dataset.position = "-32"; // Start above the visible area
          column.dataset.speed = (0.5 + Math.random() * 0.5).toString(); // Between 0.5 and 1 pixels per frame
        }

        // Update position
        const currentPos = parseFloat(column.dataset.position);
        const speed = parseFloat(column.dataset.speed as string);
        const newPos = currentPos + speed;

        // Apply new position
        column.style.transform = `translateY(${newPos}px)`;
        column.dataset.position = newPos.toString();

        // Check if we need to insert new digits at the top when there's space
        if (newPos >= 0 && !column.dataset.firstDigitAdded) {
          // Add a new digit at the top
          const newDigit = document.createElement("div");
          newDigit.className = "digit";
          newDigit.style.height = "32px";
          newDigit.style.lineHeight = "32px";
          newDigit.textContent = Math.random() > 0.5 ? "1" : "0";

          // Insert at the beginning
          if (column.firstChild) {
            column.insertBefore(newDigit, column.firstChild);
          } else {
            column.appendChild(newDigit);
          }

          // Mark that we've added the first digit
          column.dataset.firstDigitAdded = "true";

          // Adjust position to account for the new digit
          column.style.transform = `translateY(${newPos - 32}px)`;
          column.dataset.position = (newPos - 32).toString();
        }

        // Check if we need to add more digits as the column scrolls down
        const containerHeight = containerRef.current?.offsetHeight || 32;
        if (newPos > 0) {
          // Calculate if there's space at the top for a new digit
          const shouldAddNewDigit = Math.random() > 0.95; // Occasionally add new digits

          if (shouldAddNewDigit) {
            // Add a new digit at the top
            const newDigit = document.createElement("div");
            newDigit.className = "digit";
            newDigit.style.height = "32px";
            newDigit.style.lineHeight = "32px";
            newDigit.textContent = Math.random() > 0.5 ? "1" : "0";

            // Insert at the beginning
            if (column.firstChild) {
              column.insertBefore(newDigit, column.firstChild);
            } else {
              column.appendChild(newDigit);
            }

            // Adjust position to account for the new digit
            column.style.transform = `translateY(${newPos - 32}px)`;
            column.dataset.position = (newPos - 32).toString();
          }
        }

        // Remove digits that have moved out of view
        if (column.childNodes.length > 0 && newPos > containerHeight) {
          // Remove the last (bottom-most) digit
          column.removeChild(column.lastChild as Node);

          // Adjust position back up so the column doesn't jump
          column.style.transform = `translateY(${newPos - 32}px)`;
          column.dataset.position = (newPos - 32).toString();
        }
      });

      // Continue animation
      requestAnimationFrame(animateColumns);
    };

    // Start animation
    const animationId = requestAnimationFrame(animateColumns);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [digitCount]);

  // Create column elements
  const createColumns = () => {
    return Array(digitCount)
      .fill(0)
      .map((_, colIndex) => {
        // Start with just one digit per column (just outside the view)
        return (
          <div
            key={colIndex}
            className="inline-block text-center overflow-hidden"
            style={{ width: "1ch", height: "32px", position: "relative" }}
          >
            <div
              className="matrix-column"
              ref={(el) => {
                if (el) columnsRef.current[colIndex] = el;
              }}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* Initial digit will be added by the animation logic */}
            </div>
          </div>
        );
      });
  };

  return (
    <div
      ref={containerRef}
      className={`text-4xl text-left font-serif ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in",
        height: "32px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="flex">{createColumns()}</div>
    </div>
  );
};

export default MatrixPlaceholder;
