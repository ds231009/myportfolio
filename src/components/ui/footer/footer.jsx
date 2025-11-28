import styles from "./Footer.module.css"
import { useEffect, useRef, useState } from "react";
import { STATES, CONSTANTS, updateStickmanPhysics } from "./footerLogic.js";

import spriteSource from "./sprites/spritesheet.png"

const SPRITE_CFG = {
    src: spriteSource.src || spriteSource,
    frameWidth: 80,
    frameHeight: 80,
    scale: 1,

    anims: {
        [STATES.IDLE]:              { row: 0, cols: 4, speed: 10,   loopStart: 0 },

        [STATES.VERTICLEJUMPING]:   { row: 1, cols: 6, speed: 10,   loopStart: 3 },
        [STATES.JUMPING]:           { row: 2, cols: 6, speed: 1,    loopStart: 3, loopEnd: 3 },
        [STATES.LANDING]:           { row: 3, cols: 4, speed: 1,    loopStart: 0, stopAtEnd: true },

        [STATES.TRIPPED]:           { row: 4, cols: 5, speed: 30,  loopStart: 0 },
        [STATES.RECOVERING]:        { row: 5, cols: 3, speed: 30,  loopStart: 0, stopAtEnd: true },

        [STATES.WALKING]:           { row: 6, cols: 8, stride: 15,  loopStart: 0 },

        [STATES.SPRINTING]:         { row: 7, cols: 6, stride: 25,  loopStart: 2, loopEnd: 5 },

        [STATES.OUTSIDE]:           { row: 8, cols: 1, speed: 10,   loopStart: 0 },
    }
};

export default function FooterCanvas() {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const canvasPosRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
    const prevDistance = useRef(0);
    const spriteImage = useRef(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const animAccumulator = useRef(0);
    const lastState = useRef(STATES.IDLE);

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
        facingRight: true
    });

    useEffect(() => {
        const img = new Image();
        img.src = SPRITE_CFG.src;
        img.onload = () => {
            spriteImage.current = img;
            setIsImageLoaded(true);
        };
    }, []);

    useEffect(() => {
        const handleMove = (e) => {
            mouseX.current = e.clientX;
            mouseY.current = e.clientY;
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    useEffect(() => {
        if (!isImageLoaded) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        let frameId;

        const render = () => {
            const rect = canvas.getBoundingClientRect();
            canvasPosRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
            const width = rect.width;
            const height = rect.height;
            const left = rect.left;
            const top = rect.top;

            ctx.clearRect(0, 0, width, height);

            const sm = stickman.current;
            const mouseRelativeX = mouseX.current - canvasPosRef.current.left;
            const mouseRelativeY = mouseY.current - canvasPosRef.current.top;

            const { speed } = updateStickmanPhysics(
                sm,
                { x: mouseRelativeX, y: mouseRelativeY },
                { left, top, width, height },
                prevDistance
            );

            // --- SPRITE ANIMATION CALCULATIONS ---
            const anim = SPRITE_CFG.anims[sm.state];

            if (lastState.current !== sm.state) {
                animAccumulator.current = 0;
                lastState.current = sm.state;
            }

            // Increment Accumulator
            if (anim.stride) {
                animAccumulator.current += Math.abs(sm.velocityX);
            } else {
                animAccumulator.current += 1;
            }

            // --- CALCULATE FRAME INDEX (WITH LOOP & STOP LOGIC) ---

            // 1. Calculate how many frames have theoretically passed (Total)
            let rawFrameCount = 0;
            if (anim.stride) {
                rawFrameCount = Math.floor(animAccumulator.current / anim.stride);
            } else {
                rawFrameCount = Math.floor(animAccumulator.current / anim.speed);
            }

            let currentFrameIndex = 0;
            const startLoop = anim.loopStart || 0;
            const endLoop = anim.loopEnd !== undefined ? anim.loopEnd : (anim.cols - 1);

            // 2. Logic: Intro -> Loop -> End
            if (rawFrameCount < startLoop) {
                // Intro phase (before loop starts)
                currentFrameIndex = rawFrameCount;
            }
            else {
                // We have passed the start of the loop
                if (anim.stopAtEnd) {
                    // ONE-SHOT ANIMATION (Landing, Recovering)
                    currentFrameIndex = rawFrameCount;

                    // EXIT CONDITION: If animation finished, go to IDLE
                    if (currentFrameIndex >= anim.cols) {
                        currentFrameIndex = anim.cols - 1; // Clamp to last frame
                        sm.state = STATES.IDLE; // <--- AUTO SWITCH STATE
                    }
                } else {
                    // CONTINUOUS LOOP (Sprinting, Walking)
                    const loopLength = (endLoop - startLoop) + 1;
                    const framesInLoop = rawFrameCount - startLoop;
                    currentFrameIndex = startLoop + (framesInLoop % loopLength);
                }
            }

            // 3. Safety clamp (prevent index out of bounds errors)
            currentFrameIndex = Math.min(currentFrameIndex, anim.cols - 1);


            // --- DRAWING ---
            const srcX = currentFrameIndex * SPRITE_CFG.frameWidth;
            const srcY = anim.row * SPRITE_CFG.frameHeight;

            const destW = SPRITE_CFG.frameWidth * SPRITE_CFG.scale;
            const destH = SPRITE_CFG.frameHeight * SPRITE_CFG.scale;

            const drawX = sm.x - (destW / 2);
            const drawY = sm.y - destH + CONSTANTS.RECT_H;

            ctx.save();

            (mouseRelativeX - sm.x < 0) ? sm.facingRight = false : sm.facingRight = true;

            if (!sm.facingRight) {
                ctx.translate(drawX + destW / 2, drawY + destH / 2);
                ctx.scale(-1, 1);
                ctx.translate(-(drawX + destW / 2), -(drawY + destH / 2));
            }

            ctx.drawImage(
                spriteImage.current,
                srcX, srcY,
                SPRITE_CFG.frameWidth, SPRITE_CFG.frameHeight,
                drawX, drawY,
                destW, destH
            );

            ctx.restore();

            // Ground Line
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(width, height);
            ctx.stroke();

            // Debug
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText(`State: ${sm.state}`, 10, 20);
            ctx.fillText(`Frame: ${currentFrameIndex} (Raw: ${rawFrameCount})`, 10, 40);

            frameId = requestAnimationFrame(render);
        };

        const initialRect = canvas.getBoundingClientRect();
        stickman.current.x = initialRect.width / 2;
        stickman.current.y = initialRect.height - 40;
        stickman.current.groundY = initialRect.height - 40;

        frameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameId);
    }, [isImageLoaded]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const rect = parent.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                const ctx = canvas.getContext("2d");
                ctx.scale(dpr, dpr);
                ctx.imageSmoothingEnabled = false;
            }
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <footer className={styles.footer}>
            <span className={styles.footerText}>v0.6.3</span>
            <canvas ref={canvasRef} className={styles.footerCanvas} />
        </footer>
    );
}