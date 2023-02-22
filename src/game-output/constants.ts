export const COLOR_FULL = "#000000";
export const COLOR_FADED = "#FFFFFF";
// Threshold to paint lines of a player with the Full color, less than this will start fading it
export const MAX_FULL_SCORE = 0.7;
// Threshold to paint lines of a player with the faded color, less than this will do nothing, it will be completely faded already
export const MIN_FULL_SCORE = 0.1;

export const SIZE_PLAYER_POINTS = 10;
export const SIZE_COLLIDABLE_POINTS = 30;

export const OBJECT_STROKE = "#000000";
export const OBJECT_FILL = "#BB0000";
export const PLAYER_COLLIDABLE_FILL = "#00BB00";

const DEFAULT_LINE_OPTIONS = {
    roughness: 2,
    bowing: 2,
    stroke: COLOR_FULL,
    strokeWidth: 4,
};

export const PLAYER_LINE_OPTIONS = {
    ...DEFAULT_LINE_OPTIONS,
    stroke: COLOR_FULL,
};

export const OBJECT_OPTIONS = {
    ...DEFAULT_LINE_OPTIONS,
    stroke: OBJECT_STROKE,
    fill: OBJECT_FILL,
    fillStyle: "dots",
};

export const PLAYER_COLLIDABLE_POINT_OPTIONS = {
    ...DEFAULT_LINE_OPTIONS,
    stroke: OBJECT_STROKE,
    fill: PLAYER_COLLIDABLE_FILL,
    fillStyle: "zigzag",
};
