import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // useMotionValue ensures zero React re-render lag for the main cursor
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // useSpring provides a buttery smooth trail for the outer ring without slowing the main dot
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide default cursor across the entire document
    const style = document.createElement("style");
    style.innerHTML = `
      @media (pointer: fine) {
        * { cursor: none !important; }
        input, textarea, [contenteditable="true"] { cursor: text !important; }
      }
    `;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      // Instant hardware-like update without state lag
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      setIsHovering(!!(target.closest('a, button, label, input[type="radio"], input[type="checkbox"], [role="button"], .cursor-pointer, .magnetic-hover')));
    };
    
    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.head.removeChild(style);
    };
  }, [isVisible, cursorX, cursorY]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null; // hide entirely on mobile touchscreen devices
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main Plane cursor - ZERO LAG, SOLID VISIBILITY */}
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[99999]"
            style={{
              x: cursorX,
              y: cursorY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              scale: isClicking ? 0.75 : isHovering ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            {/* We use a solid white background with a shadow so it's always visible on complex images */}
            <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ease-out border ${isHovering ? 'bg-primary border-primary shadow-xl shadow-primary/30' : 'bg-white border-white shadow-[0_0_15px_rgba(0,0,0,0.15)] dark:bg-slate-800 dark:border-slate-700'}`}>
              <Plane 
                className={`w-3.5 h-3.5 transition-all duration-300 ${isHovering ? 'text-white' : 'text-primary dark:text-white'}`} 
                fill="currentColor"
                style={{ transform: 'rotate(-45deg)', marginTop: '1px', marginLeft: '-1px' }}
              />
            </div>
          </motion.div>

          {/* Trailing Ring - SMOOTH BUTTERY SPRING LAG */}
          <motion.div
            className="fixed top-0 left-0 w-10 h-10 border-2 border-primary/50 bg-white/10 dark:bg-white/5 backdrop-blur-[1px] rounded-full pointer-events-none z-[99998] shadow-lg shadow-primary/20"
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              scale: isClicking ? 0.5 : isHovering ? 1.4 : 1,
              opacity: isHovering ? 0 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
