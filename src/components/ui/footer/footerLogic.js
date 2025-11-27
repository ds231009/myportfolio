export const STATES = {
    IDLE: "IDLE",
    WALKING: "WALKING",
    SPRINTING: "SPRINTING",
    OUTSIDE: "OUTSIDE",
    JUMPING: "JUMPING",
    VERTICLEJUMPING: "VERTICLEJUMPING",
    TRIPPED: "TRIPPED"
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
    sm.targetX = Math.min(bounds.width - RECT_W, Math.max(0, input.x - RECT_W / 2));
    const distanceToTarget = Math.round((sm.targetX - sm.x) * 100) / 100;
    const accelerationForce = distanceToTarget * 0.0005;

    // ===========================
    // 1. STATE MACHINE
    // ===========================
    if (sm.state === STATES.TRIPPED) {
        sm.stateTimer--;
        sm.velocityY *= 0.0005; // Dampen vertical bounce if tripped
        if (sm.stateTimer <= 0) {
            sm.state = STATES.IDLE; // Get up
            sm.y -= 20; // Pop him up a bit
        }
    }
    // Normal State Transitions
    else {
        if (!sm.isGrounded) {
            sm.state = STATES.JUMPING;

        } else if (speed <= 0.5  && distanceToTarget < 80 ) {
            // console.log(bounds,input, input.x , bounds.left + bounds.width)
            if (input.x < bounds.left || input.x > bounds.width) {
                sm.state = STATES.OUTSIDE;
            }
            else {
                sm.state = STATES.VERTICLEJUMPING;
            }
        } else if (speed > 5) {
            sm.state = STATES.SPRINTING;
        } else if (speed > 0.5) {
            sm.state = STATES.WALKING;
        } else {
            sm.state = STATES.IDLE;
        }

        // CHECK FOR TRIP CONDITION
        // If moving fast (>5) and target is BEHIND us, and we try to turn instantly
        const distToTargetRaw = sm.targetX - sm.x;
        const movingOppositeToTarget = (distToTargetRaw > 0 && sm.velocityX < -4) || (distToTargetRaw < 0 && sm.velocityX > 4);

        if (sm.state === STATES.SPRINTING && Math.random() > 0.995) { // 5% chance to trip when turning fast
            sm.state = STATES.TRIPPED;
            sm.stateTimer = 60; // Stay tripped for 60 frames (1 second)
            sm.velocityX *= 0.025; // Keep sliding a bit
            // console.log("OOF! Tripped!");
        }
    }

    // ===========================
    // 2. HORIZONTAL PHYSICS
    // ===========================



    // Apply acceleration only if not tripped
    if (sm.state !== STATES.TRIPPED) {
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

    // Check if getting closer compared to previous frame
    const isGettingCloser = Math.abs(distanceToTarget) < Math.abs(prevDistanceRef.current);

    const verticalDistance = sm.y - input.y;
    const isCursorAbove = input.y < sm.y;

    if (
        sm.state !== STATES.TRIPPED && // Can't jump if tripped
        Math.abs(sm.velocityX) > 5 &&
        Math.abs(distanceToTarget) > 40 &&
        Math.abs(distanceToTarget) < 80 &&
        isCursorAbove &&
        input.y > 0 && // Cursor is within canvas
        sm.isGrounded
    ) {
        const heightToReach = verticalDistance;
        const timeToApex = Math.sqrt((2 * heightToReach) / sm.gravity);
        const calculatedJumpForce = -sm.gravity * timeToApex;

        // Add a bit extra to ensure we reach it
        sm.velocityY = calculatedJumpForce * 1.1;

        // Clamp jump force to reasonable values
        sm.velocityY = Math.max(sm.velocityY, -20); // Max jump height
        sm.velocityY = Math.min(sm.velocityY, -5);  // Min jump height

        sm.isGrounded = false;
        // console.log("JUMP! Trying to reach height:", heightToReach.toFixed(2), "JumpForce:", sm.velocityY.toFixed(2));
    }

    // Update reference for next frame
    prevDistanceRef.current = distanceToTarget;

    // ===========================
    // 4. VERTICAL PHYSICS (GRAVITY)
    // ===========================
    if (!sm.isGrounded) {
        sm.velocityY += sm.gravity; // Gravity pulls down
        sm.y += sm.velocityY;
        sm.velocityX *= Math.pow(sm.friction, 1 / 4); // Air resistance

        // Check if landed
        if (sm.y >= sm.groundY) {
            sm.y = sm.groundY;
            sm.velocityY = 0;
            sm.isGrounded = true;
        }
    } else {
        // On ground - stay at ground level
        sm.y = sm.groundY;
    }

    // Update horizontal position
    sm.x += sm.velocityX;
    sm.x = Math.min(bounds.width - RECT_W, Math.max(RECT_W, sm.x));
    if (sm.x === 0 || sm.x === bounds.width - RECT_W) {
        sm.velocityX = 0
    }

    return {
        distanceToTarget,
        isGettingCloser,
        speed
    };
}