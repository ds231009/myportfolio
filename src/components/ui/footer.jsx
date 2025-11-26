import styles from "./Footer.module.css"
import { useEffect, useRef } from "react";

export default function FooterCanvas() {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const canvasPosRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
    const BoxRef = useRef({ x: 0, y: 0 });

    const stickman = useRef({
        x: 0,
        y: 0,
        velocityX: 0,
        targetX: 0,
        acceleration: 0.5,    // How fast he speeds up
        maxSpeed: 10,          // Maximum velocity
        friction: 0.95        // Deceleration (0.85 = 15% slowdown per frame)
    });

    // Log
    useEffect(() => {
        const handleClick = (e) => {
            console.log("Mouse X:", e.clientX, ", ", e.clientY);
            console.log("Box X:", stickman.current.x, ", ", stickman.current.y);
            console.log(stickman);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    // Track mouse X
    useEffect(() => {
        const handleMove = (e) => {
            mouseX.current = e.clientX;
        };

        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    // Resize canvas to match device pixel ratio (for crispness)
    useEffect(() => {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = canvas.getContext("2d");
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    // Canvas animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let frame;

        const render = () => {
            // Update canvas position on every frame (handles scrolling/resizing)
            const rect = canvas.getBoundingClientRect();
            canvasPosRef.current = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
            const width = rect.width;
            const height = rect.height;

            ctx.clearRect(0, 0, width, height);


            // Rectangle dimensions
            const rectW = 20;
            const rectH = 20;

            const mouseRelativeX = mouseX.current - canvasPosRef.current.left
            stickman.current.targetx = Math.min(width - rectW, Math.max(0, mouseRelativeX - rectW / 2));

            const distanceToMouse = stickman.current.targetx - stickman.current.x;

            const accelerationToMouse = distanceToMouse * 0.05;
            stickman.current.velocityX += accelerationToMouse;

            stickman.current.velocityX *= 0.85;

            if (Math.abs(stickman.current.velocityX) > stickman.current.maxSpeed) {
                stickman.current.velocityX = Math.sign(stickman.current.velocityX) * stickman.current.maxSpeed;
            }

            stickman.current.x += stickman.current.velocityX;


            // Keep within bounds
            stickman.current.x = Math.min(width - rectW, Math.max(0, stickman.current.x));

            // Set Y position (centered vertically)
            stickman.current.y = height / 2 - rectH / 2;

            // Draw the stickman (for now, just a rectangle)
            ctx.fillStyle = "#4aacff";
            ctx.fillRect(stickman.current.x, stickman.current.y, rectW, rectH);

            // Optional: Draw velocity indicator (for debugging)
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(stickman.current.x + rectW/2, stickman.current.y - 10, stickman.current.velocityX * 2, 5);

            frame = requestAnimationFrame(render);
        };

        frame = requestAnimationFrame(render);

        return () => cancelAnimationFrame(frame);
    }, []);



    return (
        <footer className={styles.footer}>
            <span className={styles.footerText}>v0.3.3</span>
            <canvas
                ref={canvasRef}
                className={styles.footerCanvas}
            />
        </footer>
    );
}