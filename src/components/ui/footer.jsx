import styles from "./Footer.module.css"
import { useEffect, useRef } from "react";

export default function FooterCanvas() {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const canvasPosRef = useRef({ left: 0, top: 0, width: 0, height: 0 });

    // Physics properties
    const stickman = useRef({
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,        // NEW: Vertical velocity
        targetX: 0,
        acceleration: 0.5,
        maxSpeed: 8,
        friction: 0.85,

        // Jump/gravity properties
        // distanceToTargetThreshold: 30,
        isGrounded: true,    // Is he on the ground?
        gravity: 1.5,        // How fast he falls
        jumpThreshold: 7,    // Speed needed to trigger jump
        jumpForce: -12,      // How high he jumps (negative = up)
        groundY: 0           // Ground level position
    });

    const prevDistance = useRef(0); // Add this


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

            // Stickman dimensions
            const rectW = 20;
            const rectH = 40; // Taller for a stickman

            // Calculate ground level (bottom of canvas)
            stickman.current.groundY = height - rectH;

            // === HORIZONTAL PHYSICS (same as before) ===
            const mouseRelativeX = mouseX.current - canvasPosRef.current.left;
            const mouseRelativeY = mouseY.current - canvasPosRef.current.top;
            stickman.current.targetX = Math.min(width - rectW, Math.max(0, mouseRelativeX - rectW / 2));

            const distanceToTarget = Math.round((stickman.current.targetX - stickman.current.x) * 100) / 100;
            const accelerationForce = distanceToTarget * 0.0005;
            stickman.current.velocityX += accelerationForce;

            if ( (stickman.current.targetX > stickman.current.x && stickman.current.velocityX < 0) || (stickman.current.targetX < stickman.current.x && stickman.current.velocityX > 0)) {
                stickman.current.velocityX *= stickman.current.friction;
            }


            // Clamp velocity
            if (Math.abs(stickman.current.velocityX) > stickman.current.maxSpeed) {
                stickman.current.velocityX = Math.sign(stickman.current.velocityX) * stickman.current.maxSpeed;
            }

            // === JUMP TRIGGER ===
            // If moving fast enough and on ground, JUMP!
            const currentSpeed = Math.abs(stickman.current.velocityX);
            const isGettingCloser = Math.abs(distanceToTarget) < Math.abs(prevDistance.current);

            const verticalDistance = stickman.current.y - mouseRelativeY;
            const isCursorAbove = mouseRelativeY < stickman.current.y;

            if (
                Math.abs(stickman.current.velocityX) > 5 &&
                Math.abs(distanceToTarget) > 40 &&
                Math.abs(distanceToTarget) < 80 &&
                isCursorAbove &&
                mouseRelativeY > 0 && // Cursor is within canvas
                stickman.current.isGrounded
            ) {
                const heightToReach = verticalDistance;
                const timeToApex = Math.sqrt((2 * heightToReach) / stickman.current.gravity);
                const calculatedJumpForce = -stickman.current.gravity * timeToApex;

                // Add a bit extra to ensure we reach it
                stickman.current.velocityY = calculatedJumpForce * 1.1;

                // Clamp jump force to reasonable values
                stickman.current.velocityY = Math.max(stickman.current.velocityY, -20); // Max jump height
                stickman.current.velocityY = Math.min(stickman.current.velocityY, -5);  // Min jump height

                stickman.current.isGrounded = false;
                console.log("JUMP! Trying to reach height:", heightToReach.toFixed(2), "JumpForce:", stickman.current.velocityY.toFixed(2));
            }


            // === VERTICAL PHYSICS (GRAVITY) ===
            if (!stickman.current.isGrounded) {
                stickman.current.velocityY += stickman.current.gravity; // Gravity pulls down
                stickman.current.y += stickman.current.velocityY;
                stickman.current.velocityX *= Math.pow(stickman.current.friction, 1 / 4);

                // Check if landed
                if (stickman.current.y >= stickman.current.groundY) {
                    stickman.current.y = stickman.current.groundY;
                    stickman.current.velocityY = 0;
                    stickman.current.isGrounded = true;
                }
            } else {
                // On ground - stay at ground level
                stickman.current.y = stickman.current.groundY;
            }

            // Update horizontal position
            stickman.current.x += stickman.current.velocityX;
            stickman.current.x = Math.min(width - rectW, Math.max(0, stickman.current.x));

            // === DRAW STICKMAN ===
            // Change color based on state
            const isMaxSpeed = currentSpeed > (stickman.current.maxSpeed * 0.95);
            const isFarAway = Math.abs(distanceToTarget) > 300;

// ... inside the color if/else:

            if (!stickman.current.isGrounded) {
                ctx.fillStyle = "#ff4a4a"; // Red when jumping
            }
            else if (isMaxSpeed && isFarAway) {
                ctx.fillStyle = "#FFD700"; // Gold color
            }
            else if (currentSpeed > 4) {
                ctx.fillStyle = "#4aff4a"; // Green when running
            } else {
                ctx.fillStyle = "#4aacff"; // Blue when idle/walking
            }

            ctx.fillRect(stickman.current.x, stickman.current.y, rectW, rectH);

            // Draw ground line
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width, height);
            ctx.stroke();

            // Debug: velocity indicator
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText(`Speed: ${currentSpeed.toFixed(1)}`, 10, 20);
            ctx.fillText(`VelY: ${stickman.current.velocityY.toFixed(1)}`, 10, 60);
            ctx.fillText(`Dist: ${distanceToTarget}`, 10, 40);
            ctx.fillText(`GettingClose: ${isGettingCloser}`, 10, 80);

            frame = requestAnimationFrame(render);
        };

        // Initialize position
        const rect = canvas.getBoundingClientRect();
        stickman.current.x = rect.width / 2;
        stickman.current.y = rect.height - 40;
        stickman.current.groundY = rect.height - 40;

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