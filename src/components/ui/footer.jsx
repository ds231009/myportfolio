import styles from "./Footer.module.css"
import { useEffect, useRef } from "react";
import { STATES, CONSTANTS, updateStickmanPhysics } from "./footerLogic";

export default function FooterCanvas() {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const canvasPosRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
    const prevDistance = useRef(0);

    // Physics properties
    const stickman = useRef({
        x: 0, y: 0,
        velocityX: 0, velocityY: 0,
        targetX: 0,

        acceleration: 0.5,
        maxSpeed: 8,
        friction: 0.85,
        gravity: 1.5,
        groundY: 0,

        state: STATES.IDLE,
        stateTimer: 0,
        isGrounded: true,
        jumpThreshold: 7,
        jumpForce: -12,
    });

    useEffect(() => {
        const handleClick = (e) => {
            console.log("Mouse:", e.clientX, e.clientY);
            console.log("Stickman:", stickman.current);
            console.log("Canvas:", canvasPosRef.current);
            console.log("Velocity:", stickman.current.velocityX.toFixed(2));
            console.log("Is Grounded:", stickman.current.isGrounded);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    // Track mouse X
    useEffect(() => {
        const handleMove = (e) => {
            mouseX.current = e.clientX;
            mouseY.current = e.clientY;
        };

        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    // Canvas animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let frame;

        const render = () => {
            // Update canvas position
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

            const sm = stickman.current;

            // Calculate relative mouse position here to pass to logic
            const mouseRelativeX = mouseX.current - canvasPosRef.current.left;
            const mouseRelativeY = mouseY.current - canvasPosRef.current.top;

            // === CALL EXTERNAL LOGIC ===
            const { distanceToTarget, isGettingCloser, speed } = updateStickmanPhysics(
                sm,
                { x: mouseRelativeX, y: mouseRelativeY },
                { width, height },
                prevDistance
            );

            // === DRAWING ===
            const { RECT_W, RECT_H } = CONSTANTS;

            // Color Logic
            const isMaxSpeed = speed > (sm.maxSpeed * 0.95);
            const isFarAway = Math.abs(distanceToTarget) > 300;

            if (sm.state === STATES.TRIPPED) {
                // You can add a specific color for tripped if you want, or keep existing
                ctx.fillStyle = "#ff4a4a"; // Keeping Red for trip as per original "Red when jumping" similarity logic, or default
            }

            if (!sm.isGrounded) {
                ctx.fillStyle = "#ff4a4a"; // Red when jumping
            }
            else if (isMaxSpeed && isFarAway) {
                ctx.fillStyle = "#FFD700"; // Gold color
            }
            else if (speed > 4) {
                ctx.fillStyle = "#4aff4a"; // Green when running
            } else {
                ctx.fillStyle = "#4aacff"; // Blue when idle/walking
            }

            ctx.fillRect(sm.x, sm.y, RECT_W, RECT_H);

            // Draw ground line
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width, height);
            ctx.stroke();

            // Debug text
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText(`Speed: ${speed.toFixed(1)}`, 10, 20);
            ctx.fillText(`VelY: ${sm.velocityY.toFixed(1)}`, 10, 60);
            ctx.fillText(`Dist: ${distanceToTarget}`, 10, 40);
            ctx.fillText(`GettingClose: ${isGettingCloser}`, 10, 80);
            ctx.fillText(`State: ${sm.state}`, 10, 100);

            frame = requestAnimationFrame(render);
        };

        // Initialize position
        const initialRect = canvas.getBoundingClientRect();
        stickman.current.x = initialRect.width / 2;
        stickman.current.y = initialRect.height - 40;
        stickman.current.groundY = initialRect.height - 40;

        frame = requestAnimationFrame(render);

        return () => cancelAnimationFrame(frame);
    }, []);

    // Resize canvas
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