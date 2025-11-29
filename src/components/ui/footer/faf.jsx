export const STATES = {
    IDLE: "IDLE",
    VERTICALJUMPING: "VERTICALJUMPING",
    JUMPING: "JUMPING",
    LANDING: "LANDING",
    TRIPPED: "TRIPPED",
    RECOVERING: "RECOVERING",
    WALKING: "WALKING",
    SPRINTING: "SPRINTING",
    SUPER_SPRINT: "SUPER_SPRINT",
    SITTING: "SITTING",
    BORED: "BORED",
    GETTINGUP: "GETTINGUP",
    OUTSIDE: "OUTSIDE",
};

export const CONSTANTS = {
    RECT_W: 40,
    RECT_H: 40
};

const STATE_CONFIG = {
    [STATES.IDLE]:              { friction: 0.85, canInput: true,  gravity: true },
    [STATES.WALKING]:           { friction: 0.95, canInput: true,  gravity: true },
    [STATES.SPRINTING]:         { friction: 0.98, canInput: true,  gravity: true },
    [STATES.SUPER_SPRINT]:      { friction: 0.95, canInput: true,  gravity: true },
    [STATES.VERTICALJUMPING]:   { friction: 0.90, canInput: false, gravity: true },
    [STATES.JUMPING]:           { friction: 0.99, canInput: true,  gravity: true },
    [STATES.LANDING]:           { friction: 0.60, canInput: false, gravity: true },
    [STATES.TRIPPED]:           { friction: 0.96, canInput: false, gravity: true },
    [STATES.RECOVERING]:        { friction: 0.70, canInput: false, gravity: true },
    [STATES.SITTING]:           { friction: 0.85, canInput: true,  gravity: true }, // Can input to "wake up"
    [STATES.GETTINGUP]:         { friction: 0.85, canInput: false, gravity: true }, // Locked while standing up
    [STATES.BORED]:             { friction: 0.85, canInput: true,  gravity: true },
    [STATES.OUTSIDE]:           { friction: 0.85, canInput: true,  gravity: true },
};

/**
 * Handles all physics, state transitions, and position updates.
 */
export function updateStickmanPhysics(sm, input, bounds, prevDistanceRef) {
    const { RECT_W, RECT_H } = CONSTANTS;
    sm.groundY = bounds.height - RECT_H;
    const speed = Math.abs(sm.velocityX);

    // Physics Targets
    sm.targetX = Math.min(bounds.width, Math.max(0, input.x));
    const distanceToTarget = Math.round((sm.targetX - sm.x) * 100) / 100;

    // Check mouse bounds
    const isMouseInsideCanvas =
        input.x >= 0 && input.x <= bounds.width &&
        input.y >= 0 && input.y <= bounds.height;

    // ===========================
    // 1. STATE MACHINE
    // ===========================

    // A. PRIORITY: Tripped
    if (sm.state === STATES.TRIPPED) {
        sm.stateTimer--;
        sm.velocityY *= 0.0005;
        if (sm.stateTimer <= 0) {
            sm.state = STATES.RECOVERING;
        }
        return { distanceToTarget: 0, speed: 0 };
    }

    // B. LOCKED STATES (Animations must finish)
    if (sm.state === STATES.RECOVERING || sm.state === STATES.LANDING || sm.state === STATES.GETTINGUP) {
        sm.velocityX *= 0.8; // Slide to a halt
        // Exit to IDLE is handled by FooterCanvas when animation ends
    }

    // C. NORMAL TRANSITIONS
    else {
        switch (sm.state) {
            case STATES.IDLE:
            case STATES.WALKING:
            case STATES.SPRINTING:
            case STATES.SUPER_SPRINT:
                if (!sm.isGrounded) {
                    sm.state = STATES.JUMPING;
                }
                // Removed the "x <= 0" check here because the Trap at the bottom handles it
                else if (speed > 7 && Math.random() > 0.9995) {
                    sm.state = STATES.TRIPPED;
                    sm.stateTimer = 60;
                }
                else if (
                    isMouseInsideCanvas &&
                    speed <= 4 &&
                    Math.abs(distanceToTarget) < 20 &&
                    input.y < bounds.top // Mouse above canvas top
                ) {
                    sm.state = STATES.VERTICALJUMPING;
                }
                else if (speed > 8) sm.state = STATES.SUPER_SPRINT;
                else if (speed > 3)  sm.state = STATES.SPRINTING;
                else if (speed > 0.25) sm.state = STATES.WALKING;
                else sm.state = STATES.IDLE;
                break;

            case STATES.JUMPING:
            case STATES.VERTICALJUMPING:
                if (sm.isGrounded) {
                    sm.state = STATES.LANDING;
                }
                break;

            case STATES.SITTING:
                // Exit Strategy: If user pulls stickman away from the wall
                // If on Left Wall, input must be to the right (> 50px)
                // If on Right Wall, input must be to the left (< width - 50px)
                const isLeftWall = sm.x < bounds.width / 2;
                const tryingToLeave = isLeftWall ? (input.x > 50) : (input.x < bounds.width - 50);

                if (tryingToLeave) {
                    sm.state = STATES.GETTINGUP;
                    // Optional: Nudge him slightly so he doesn't instantly sit back down
                    sm.velocityX = isLeftWall ? 2 : -2;
                }
                break;
        }
    }

    // ===========================
    // 2. HORIZONTAL PHYSICS
    // ===========================

    const config = STATE_CONFIG[sm.state] || STATE_CONFIG[STATES.IDLE];

    if (config.canInput) {
        const accelerationForce = distanceToTarget * 0.0005;
        sm.velocityX += accelerationForce;
    }

    sm.velocityX *= config.friction;

    const currentMaxSpeed = sm.state === STATES.SUPER_SPRINT ? 12 : sm.maxSpeed;
    if (Math.abs(sm.velocityX) > currentMaxSpeed) {
        sm.velocityX = Math.sign(sm.velocityX) * currentMaxSpeed;
    }

    // ===========================
    // 3. JUMP LOGIC
    // ===========================

    const isCursorAbove = input.y < sm.y;
    const canRunningJump = config.canInput && sm.isGrounded && speed > 5 && Math.abs(distanceToTarget) > 40 && Math.abs(distanceToTarget) < 80 && isCursorAbove && input.y > 0;
    const canVerticalJump = sm.state === STATES.VERTICALJUMPING && sm.isGrounded;

    if (canRunningJump || canVerticalJump) {
        const heightToReach = Math.max(20, sm.y - input.y);
        const timeToApex = Math.sqrt((2 * heightToReach) / sm.gravity);
        const calculatedJumpForce = -sm.gravity * timeToApex;

        sm.velocityY = calculatedJumpForce * 1.1;
        sm.velocityY = Math.max(sm.velocityY, -20);
        sm.velocityY = Math.min(sm.velocityY, -5);
        sm.isGrounded = false;

        if(canVerticalJump) sm.state = STATES.VERTICALJUMPING;
        else sm.state = STATES.JUMPING;
    }

    // ===========================
    // 4. VERTICAL PHYSICS
    // ===========================

    prevDistanceRef.current = distanceToTarget;

    if (!sm.isGrounded) {
        sm.velocityY += sm.gravity;
        sm.y += sm.velocityY;
        sm.velocityX *= Math.pow(sm.friction, 1 / 4);

        if (sm.y >= sm.groundY) {
            sm.y = sm.groundY;
            sm.velocityY = 0;
            sm.isGrounded = true;
        }
    } else {
        sm.y = sm.groundY;
    }

    sm.x += sm.velocityX;
    sm.x = Math.min(bounds.width, Math.max(0, sm.x));

    // ===========================
    // 5. EDGE TRAP (Sitting)
    // ===========================
    // If at the edges, force sitting unless we are already busy tripping/getting up
    if (sm.x <= 5 || sm.x >= bounds.width) {
        if (
            sm.state !== STATES.SITTING &&
            sm.state !== STATES.GETTINGUP &&
            sm.state !== STATES.RECOVERING &&
            sm.state !== STATES.TRIPPED
        ) {
            sm.velocityX = 0;
            sm.state = STATES.SITTING;
            sm.stateTimer = 60; // Optional timer if you want to delay animations
        }
    }

    return {
        distanceToTarget,
        isGettingCloser: Math.abs(distanceToTarget) < Math.abs(prevDistanceRef.current),
        speed
    };
}