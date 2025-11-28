// ... imports

// Update Config: Remove 'speed' (we don't need it anymore)
// Add 'distancePerFrame' (How many pixels of movement = 1 new animation frame)
const SPRITE_CFG = {
    // ... source and size config ...
    src: "stickman_sheet.png",
    frameWidth: 32, frameHeight: 32, scale: 1.5,

    anims: {
        // stride: How many pixels he moves before we switch to the next image
        // Lower number = Legs move faster
        [STATES.IDLE]:      { row: 0, cols: 4, stride: 10, isLoop: true },
        [STATES.WALKING]:   { row: 1, cols: 8, stride: 15, isLoop: true },
        [STATES.SPRINTING]: { row: 2, cols: 6, stride: 15, isLoop: true },
        [STATES.JUMPING]:   { row: 3, cols: 1, stride: 1,  isLoop: false },
        [STATES.TRIPPED]:   { row: 4, cols: 1, stride: 1,  isLoop: false },
    }
};

export default function FooterCanvas() {
    // ... existing refs ...

    // REPLACE globalFrame variable with a Ref for distance
    const animAccumulator = useRef(0);
    const lastState = useRef(STATES.IDLE); // To detect state changes

    // ... useEffects ...

    // INSIDE THE RENDER LOOP:
    useEffect(() => {
        if (!isImageLoaded) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        let frameId;

        const render = () => {
            // ... (Clear canvas and Physics Logic as before) ...

            const sm = stickman.current;
            const anim = SPRITE_CFG.anims[sm.state];

            // 1. RESET ACCUMULATOR ON STATE CHANGE
            // This ensures we start the new animation from frame 0
            if (lastState.current !== sm.state) {
                animAccumulator.current = 0;
                lastState.current = sm.state;
            }

            // 2. INCREMENT ACCUMULATOR
            if (sm.state === STATES.IDLE) {
                // Idle is time-based (he's not moving), so just add 1 per frame
                animAccumulator.current += 0.5;
            } else if (sm.state === STATES.WALKING || sm.state === STATES.SPRINTING) {
                // Walk/Sprint is Distance-based
                // We add the ABSOLUTE velocity.
                // If he moves 5px, we add 5 to the counter.
                animAccumulator.current += Math.abs(sm.velocityX);
            } else {
                // Jumping/Tripped usually doesn't loop, keep at 0 or increment slowly
                animAccumulator.current = 0;
            }

            // 3. CALCULATE FRAME
            // Total Distance / Stride Length = Which Frame we are on
            let currentFrameIndex = Math.floor(animAccumulator.current / anim.stride);

            // Handle Looping
            if (anim.isLoop) {
                currentFrameIndex = currentFrameIndex % anim.cols;
            } else {
                // Clamp to last frame if not looping (e.g., Tripped)
                currentFrameIndex = Math.min(currentFrameIndex, anim.cols - 1);
            }

            // ... (Rest of Drawing Logic is exactly the same) ...

            const srcX = currentFrameIndex * SPRITE_CFG.frameWidth;
            const srcY = anim.row * SPRITE_CFG.frameHeight;

            // ... ctx.drawImage call ...
        };
        // ...
    }, [isImageLoaded]);

    // ...
}