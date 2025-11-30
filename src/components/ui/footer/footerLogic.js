export const STATES = {
    IDLE: "IDLE",
    VERTICALJUMPING: "VERTICALJUMPING",
    JUMPING: "JUMPING",
    LANDING: "LANDING",
    TRIPPED: "TRIPPED",
    RECOVERING: "RECOVERING",
    WALKING: "WALKING",
    SPRINTING: "SPRINTING",
    SUPER_SPRINT: "SUPER_SPRINT", // Ready for your future implementation
    SITTING: "SITTING",
    BORED: "BORED",
    GETTINGUP: "GETTINGUP",
};

export const CONSTANTS = {
    RECT_W: 40,
    RECT_H: 40
};

const STATE_CONFIG = {
    [STATES.IDLE]:              { friction: 0.85, canInput: true,  gravity: true },
    [STATES.WALKING]:           { friction: 0.92, canInput: true,  gravity: true },
    [STATES.SPRINTING]:         { friction: 0.95, canInput: true,  gravity: true },
    [STATES.SUPER_SPRINT]:      { friction: 1,    canInput: true,  gravity: true }, // Low friction, high speed
    [STATES.VERTICALJUMPING]:   { friction: 0.90, canInput: false, gravity: true }, // Air resistance
    [STATES.JUMPING]:           { friction: 0.99, canInput: true,  gravity: true },
    [STATES.LANDING]:           { friction: 0.60, canInput: false, gravity: true }, // Slide to stop quickly
    [STATES.TRIPPED]:           { friction: 0.96, canInput: false, gravity: true }, // SLIDE! Don't stop instantly
    [STATES.RECOVERING]:        { friction: 0.70, canInput: false, gravity: true },
    [STATES.SITTING]:           { friction: 0.75, canInput: true,  gravity: true },
    [STATES.GETTINGUP]:           { friction: 0.55, canInput: true,  gravity: true },
    [STATES.BORED]:             { friction: 0.85, canInput: true,  gravity: true },
};

/**
 * Handles all physics, state transitions, and position updates.
 * @param {Object} sm - The mutable stickman object (stickman.current)
 * @param {Object} input - { x, y } (Relative mouse coordinates)
 * @param {Object} bounds - { width, height } (Canvas dimensions)
 * @param {Object} prevDistanceRef - Reference to store previous frame distance
 */

export function updateStickmanPhysics(sm, input, bounds, prevDistanceRef) {
    console.log(sm, input, bounds, prevDistanceRef);
    const { RECT_W, RECT_H } = CONSTANTS;

    sm.groundY = bounds.height - RECT_H;
    const speed = Math.abs(sm.velocityX);

    sm.targetX = Math.min(bounds.width, Math.max(0, input.x));

    const distanceToTarget = Math.round((sm.targetX - sm.x) * 100) / 100;

    const isMouseInsideCanvas =
        input.x >= 0 && input.x <= bounds.width &&
        input.y >= 0 && input.y <= bounds.height;

    // ===========================
    // 1. STATE MACHINE
    // ===========================

    switch (sm.state) {
        case STATES.TRIPPED:
            // Fall Tree
            sm.stateTimer--;
            if (sm.stateTimer <= 0) {
                sm.state = STATES.RECOVERING;
            }
            break;
        case STATES.SITTING:
            const isLeftWall = sm.x < bounds.width / 2;
            const tryingToLeave = isLeftWall ? (input.x > 50) : (input.x < bounds.width - 50);

            if (tryingToLeave) {
                sm.stateTimer = 60
                sm.state = STATES.GETTINGUP;
                // Optional: Nudge him slightly so he doesn't instantly sit back down
                sm.velocityX = isLeftWall ? 2 : -2;
            }
            break;
        case STATES.GETTINGUP:
            sm.stateTimer--;
            if (sm.stateTimer <= 0) {
                sm.state = STATES.IDLE;
            }
            break
        case STATES.IDLE:
        case STATES.WALKING:
        case STATES.SPRINTING:
        case STATES.SUPER_SPRINT:
            if (!sm.isGrounded) {
                sm.state = STATES.JUMPING;
            }
            else if (sm.x <= 0 || sm.x >= bounds.width) {
                sm.stateTimer = 60;
                sm.state = STATES.SITTING;
            }
            else if (speed > 7 && Math.random() > 0.9995) {
                sm.state = STATES.TRIPPED;
                sm.stateTimer = 60;
            }
            else if (
                isMouseInsideCanvas &&
                speed <= 4 &&
                Math.abs(distanceToTarget) < 20 &&
                input.y < bounds.top
            ) {
                sm.state = STATES.VERTICALJUMPING;
            }
            else if (speed > 8) sm.state = STATES.SUPER_SPRINT;
            else if (speed > 4)  sm.state = STATES.SPRINTING;
            else if (speed > 0.0125) sm.state = STATES.WALKING;
            else sm.state = STATES.IDLE;
            break;

        case STATES.JUMPING:
        case STATES.VERTICALJUMPING:
            if (sm.isGrounded) {
                sm.state = STATES.LANDING;
            }
            break;


        case STATES.LANDING:
        case STATES.RECOVERING:
            break;

    }

    // ===========================
    // 2. HORIZONTAL PHYSICS
    // ===========================

    const config = STATE_CONFIG[sm.state] || STATE_CONFIG[STATES.IDLE];

    if (config.canInput) {
        const accelerationForce = distanceToTarget * 0.00065;
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
        const heightToReach = sm.y - input.y;
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
    // 4. VERTICAL PHYSICS (GRAVITY)
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

    // if (sm.x - 50 < 0 || sm.x + 50  > bounds.width) {
    //     if (sm.x - 30 < 0 || sm.x + 30  > bounds.width) {
    //         sm.velocityX *= 1.05;
    //     } else {
    //         sm.velocityX *= 0.95;
    //     }
    // }

    sm.x += sm.velocityX;
    sm.x = Math.min(bounds.width, Math.max(0, sm.x));

    if (sm.x <= 15 || sm.x >= bounds.width -15) {
        // sm.velocityX = 0;
        sm.stateTimer = 60;
        sm.state = STATES.SITTING;
    }

    return {
        distanceToTarget,
        isGettingCloser: Math.abs(distanceToTarget) < Math.abs(prevDistanceRef.current),
        speed
    };
}