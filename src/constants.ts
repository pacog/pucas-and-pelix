import { SupportedModels, movenet } from "@tensorflow-models/pose-detection";

export const MODEL = SupportedModels.MoveNet;
export const MODEL_TYPE = movenet.modelType.SINGLEPOSE_LIGHTNING;
export const SCORE_THRESHOLD = 0.3;
export const BACKEND: BACKEND_TYPES = "tfjs-webgl";
export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_RADIUS = 4;
export const MAX_POSES = 4;

export type BACKEND_TYPES = "tfjs-webgl" | "tfjs-wasm" | "tfjs-webgpu";
