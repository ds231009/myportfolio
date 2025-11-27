import styles from "./Footer.module.css"
import { useEffect, useRef, useState } from "react";
import { STATES, CONSTANTS, updateStickmanPhysics } from "./footerLogic.js";

// === SPRITE CONFIGURATION ===
// You must tweak these numbers to match your actual image file!
const SPRITE_CFG = {
    src: "/stickman_sheet.png", // Put this file in your public folder
    frameWidth: 32,  // Width of a single frame in the PNG
    frameHeight: 32, // Height of a single frame in the PNG
    scale: 1.5,      // Make him bigger/smaller on screen

    // Animation Definitions
    // row: Which row in the sheet
    // cols: How many frames in that animation
    // speed: Higher number = Slower animation (frames per step)
    anims: {
        [STATES.IDLE]:      { row: 0, cols: 4, speed: 10 },
        [STATES.WALKING]:   { row: 1, cols: 8, speed: 5 },
        [STATES.SPRINTING]: { row: 2, cols: 6, speed: 3 }, // Fast!
        [STATES.JUMPING]:   { row: 3, cols: 1, speed: 1 }, // Single frame
        [STATES.TRIPPED]:   { row: 4, cols: 1, speed: 1 }, // Faceplant frame
    }
};

export default function FooterCanvas() {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const canvasPosRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
    const prevDistance = useRef(0);
    const spriteImage = useRef(null); // Store the loaded image
    const [isImageLoaded, setIsImageLoaded] = useState(false); // Trigger re-render once loaded

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
        facingRight: true // Default direction
    });

    // 1. Load the Sprite Sheet ONCE
    useEffect(() => {
        const img = new Image();
        img.src = SPRITE_CFG.src;
        img.onload = () => {
            spriteImage.current = img;
            setIsImageLoaded(true); // Start the loop only after image loads
        };
    }, []);

    // 2. Event Listeners
    useEffect(() => {
        const handleMove = (e) => {
            mouseX.current = e.clientX;
            mouseY.current = e.clientY;
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    // 3. Main Loop
    useEffect(() => {
        if (!isImageLoaded) return; // Don't start loop until image is ready

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        // Disable image smoothing for crisp pixel art (Optional)
        ctx.imageSmoothingEnabled = false;

        let frameId;
        let globalFrame = 0; // Ticker for animation

        const render = () => {
            globalFrame++;

            // --- CANVAS SETUP ---
            const rect = canvas.getBoundingClientRect();
            canvasPosRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
            const width = rect.width;
            const height = rect.height;

            ctx.clearRect(0, 0, width, height);

            // --- PHYSICS LOGIC ---
            const sm = stickman.current;
            const mouseRelativeX = mouseX.current - canvasPosRef.current.left;
            const mouseRelativeY = mouseY.current - canvasPosRef.current.top;

            const { speed } = updateStickmanPhysics(
                sm,
                { x: mouseRelativeX, y: mouseRelativeY },
                { width, height },
                prevDistance
            );

            // --- SPRITE DRAWING LOGIC ---
            const anim = SPRITE_CFG.anims[sm.state];

            // Calculate which frame to show
            // Math.floor(globalFrame / speed) slows it down
            // % cols loops it back to 0
            const currentFrameIndex = Math.floor(globalFrame / anim.speed) % anim.cols;

            // Calculate position on the sprite sheet
            const srcX = currentFrameIndex * SPRITE_CFG.frameWidth;
            const srcY = anim.row * SPRITE_CFG.frameHeight;

            // Destination size (Scaled)
            const destW = SPRITE_CFG.frameWidth * SPRITE_CFG.scale;
            const destH = SPRITE_CFG.frameHeight * SPRITE_CFG.scale;

            // Pivot adjustment (so x/y is at his feet, not top-left)
            const drawX = sm.x - (destW / 2);
            const drawY = sm.y - destH + CONSTANTS.RECT_H; // Align feet with ground

            ctx.save(); // Save current context state

            // FLIP LOGIC
            if (!sm.facingRight) {
                // To flip, we translate to the center of the sprite, scale -1, then draw at negative coords
                ctx.translate(drawX + destW / 2, drawY + destH / 2);
                ctx.scale(-1, 1);
                ctx.translate(-(drawX + destW / 2), -(drawY + destH / 2));
            }

            ctx.drawImage(
                spriteImage.current,
                srcX, srcY,                         // Source X, Y (on png)
                SPRITE_CFG.frameWidth, SPRITE_CFG.frameHeight, // Source W, H
                drawX, drawY,                       // Dest X, Y (on canvas)
                destW, destH                        // Dest W, H
            );

            ctx.restore(); // Restore context so next draw isn't flipped

            // Draw Ground Line
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width, height);
            ctx.stroke();

            // Debug Text (Optional)
            // ctx.fillStyle = "white";
            // ctx.fillText(sm.state, 10, 20);

            frameId = requestAnimationFrame(render);
        };

        const initialRect = canvas.getBoundingClientRect();
        stickman.current.x = initialRect.width / 2;
        stickman.current.y = initialRect.height - 40;
        stickman.current.groundY = initialRect.height - 40;

        frameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameId);
    }, [isImageLoaded]); // Only re-run if loading finishes

    // Resize Handler
    useEffect(() => {
        const canvas = canvasRef.current;
        const resize = () => {
            const parent = canvas.parentElement;
            if(parent) {
                const rect = parent.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                const ctx = canvas.getContext("2d");
                ctx.scale(dpr, dpr);
                // Important: Reset smoothing after resize
                ctx.imageSmoothingEnabled = false;
            }
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <footer className={styles.footer}>
            <span className={styles.footerText}>v0.6.0</span>
            <canvas ref={canvasRef} className={styles.footerCanvas} />
        </footer>
    );
}