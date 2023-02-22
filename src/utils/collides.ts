import { Bounds } from "@mathigon/euclid";

// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
export function collides(b1: Bounds, b2: Bounds) {
    return (
        b1.xMin < b2.xMax &&
        b1.xMax > b2.xMin &&
        b1.yMin < b2.yMax &&
        b1.yMax > b2.yMin
    );
}
