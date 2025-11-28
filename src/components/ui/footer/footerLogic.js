export const STATES = {
    IDLE: "IDLE",
    VERTICLEJUMPING: "VERTICLEJUMPING",
    JUMPING: "JUMPING",
    LANDING: "LANDING",
    TRIPPED: "TRIPPED",
    RECOVERING: "RECOVERING",
    WALKING: "WALKING",
    SPRINTING: "SPRINTING",
    OUTSIDE: "OUTSIDE",
};

export const CONSTANTS = {
    RECT_W: 40,
    RECT_H: 40
};

/**
 * Handles all physics, state transitions, and position updates.
 * @param {Object} sm - The mutable stickman object (stickman.current)
 * @param {Object} input - { x, y } (Relative mouse coordinates)
 * @param {Object} bounds - { width, height } (Canvas dimensions)
 * @param {Object} prevDistanceRef - Reference to store previous frame distance
 */
export function updateStickmanPhysics(sm, input, bounds, prevDistanceRef) {
    // Stickman dimensions
    const { RECT_W, RECT_H } = CONSTANTS;

    // Calculate ground level (bottom of canvas)
    sm.groundY = bounds.height - RECT_H;
    const speed = Math.abs(sm.velocityX);

    // Calculate raw distance for physics
    // UPDATED: Removed RECT_W offsets to allow full travel to right edge
    sm.targetX = Math.min(bounds.width, Math.max(0, input.x));

    const distanceToTarget = Math.round((sm.targetX - sm.x) * 100) / 100;
    const accelerationForce = distanceToTarget * 0.0005;

    // ===========================
    // 1. STATE MACHINE
    // ===========================

    // A. PRIORITY STATES (Tripped)
    if (sm.state === STATES.TRIPPED) {
        sm.stateTimer--;
        sm.velocityY *= 0.0005; // Dampen vertical bounce if tripped
        if (sm.stateTimer <= 0) {
            sm.state = STATES.RECOVERING; // Time to get up!
        }
        // Completely freeze physics while tripped
        return { distanceToTarget: 0, speed: 0 };
    }

    // B. LOCKED STATES (Recovering / Landing)
    // We apply specific physics (friction) but BLOCK normal state transitions
    if (sm.state === STATES.RECOVERING || sm.state === STATES.LANDING) {
        sm.velocityX *= 0.8; // Slide to a halt rapidly

        // IMPORTANT: We do NOT switch to IDLE here.
        // The FooterCanvas component monitors the animation frame.
        // When the "Landing" or "Recovering" animation finishes playing,
        // the Component will force the state to IDLE.
    }

        // C. NORMAL STATE TRANSITIONS
    // Only run this if we aren't in a locked state
    else {
        if (!sm.isGrounded) {
            // Keep VERTICLEJUMPING state if we are already in it (so we see the specific animation)
            if (sm.state !== STATES.VERTICLEJUMPING) {
                sm.state = STATES.JUMPING;
            }
        }
        else if ((sm.state === STATES.JUMPING || sm.state === STATES.VERTICLEJUMPING) && sm.isGrounded) {
            sm.state = STATES.LANDING; // Trigger landing from either jump type
        }
        else {
            // 1. EDGE DETECTION (Outside)
            // Applied when stickman is at either end of the canvas
            if (sm.x <= 0 || sm.x >= bounds.width) {
                sm.state = STATES.OUTSIDE;
            }
                // 2. VERTICAL JUMP
            // Mouse is right above stickman (within 20px) AND speed is low
            else if (speed <= 4 && Math.abs(distanceToTarget) < 20 && input.y > sm.y - 80) {
                sm.state = STATES.VERTICLEJUMPING;
            }
            // 3. MOVEMENT STATES
            else if (speed > 4) {
                sm.state = STATES.SPRINTING;
            }
            else if (speed > 0.5) {
                sm.state = STATES.WALKING;
            }
            else {
                sm.state = STATES.IDLE;
            }
        }

        // CHECK FOR TRIP CONDITION
        const distToTargetRaw = sm.targetX - sm.x;
        const movingOppositeToTarget = (distToTargetRaw > 0 && sm.velocityX < -4) || (distToTargetRaw < 0 && sm.velocityX > 4);

        if (sm.state === STATES.SPRINTING && Math.random() > 0.995) {
            // 0.5% chance to trip per frame when turning fast
            sm.state = STATES.TRIPPED;
            sm.stateTimer = 60; // Stay tripped for 60 frames (1 second)
            sm.velocityX *= 0.025; // Lose most speed immediately
        }
    }

    // ===========================
    // 2. HORIZONTAL PHYSICS
    // ===========================

    // Apply acceleration ONLY if we are in a controllable state
    // (Cannot move while Tripped, Recovering, or Landing)
    if (sm.state !== STATES.TRIPPED && sm.state !== STATES.RECOVERING && sm.state !== STATES.LANDING) {
        sm.velocityX += accelerationForce;
    }

    // Apply Friction (Turn around logic)
    if ((sm.targetX > sm.x && sm.velocityX < 0) || (sm.targetX < sm.x && sm.velocityX > 0)) {
        sm.velocityX *= sm.friction;
    }

    // Clamp velocity
    if (Math.abs(sm.velocityX) > sm.maxSpeed) {
        sm.velocityX = Math.sign(sm.velocityX) * sm.maxSpeed;
    }

    // ===========================
    // 3. JUMP LOGIC
    // ===========================

    const isGettingCloser = Math.abs(distanceToTarget) < Math.abs(prevDistanceRef.current);
    const verticalDistance = sm.y - input.y;
    const isCursorAbove = input.y < sm.y;

    // Condition A: Running Jump (Fast & angled)
    const isRunningJump = Math.abs(sm.velocityX) > 5 &&
        Math.abs(distanceToTarget) > 40 &&
        Math.abs(distanceToTarget) < 80 &&
        isCursorAbove &&
        input.y > 0;

    // Condition B: Vertical Jump (State already set in Section 1)
    const isVerticalJump = sm.state === STATES.VERTICLEJUMPING;

    if (
        sm.state !== STATES.TRIPPED &&
        sm.state !== STATES.RECOVERING &&
        sm.state !== STATES.LANDING &&
        sm.isGrounded &&
        (isRunningJump || isVerticalJump)
    ) {
        const heightToReach = verticalDistance;
        const timeToApex = Math.sqrt((2 * heightToReach) / sm.gravity);
        const calculatedJumpForce = -sm.gravity * timeToApex;

        sm.velocityY = calculatedJumpForce * 1.1;
        sm.velocityY = Math.max(sm.velocityY, -20);
        sm.velocityY = Math.min(sm.velocityY, -5);

        sm.isGrounded = false;
    }

    prevDistanceRef.current = distanceToTarget;

    // ===========================
    // 4. VERTICAL PHYSICS (GRAVITY)
    // ===========================
    if (!sm.isGrounded) {
        sm.velocityY += sm.gravity;
        sm.y += sm.velocityY;
        sm.velocityX *= Math.pow(sm.friction, 1 / 4);

        // Check if landed
        if (sm.y >= sm.groundY) {
            sm.y = sm.groundY;
            sm.velocityY = 0;
            sm.isGrounded = true;
        }
    } else {
        sm.y = sm.groundY;
    }

    // Update horizontal position and clamp
    sm.x += sm.velocityX;
    // UPDATED: Clamp to bounds.width instead of bounds.width - RECT_W
    sm.x = Math.min(bounds.width, Math.max(0, sm.x));

    // Hard stop at edges
    if (sm.x === 0 || sm.x === bounds.width) {
        sm.velocityX = 0;
    }

    return {
        distanceToTarget,
        isGettingCloser,
        speed
    };
}