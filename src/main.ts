import { PoseDetector } from "@tensorflow-models/pose-detection";
import { getDetector } from "./pose-detection";
import { getVideoInput } from "./video-input";

let detector: PoseDetector;
let videoInput: HTMLVideoElement;

async function gameLoop() {
    const poses = await detector.estimatePoses(videoInput, {
        maxPoses: 4,
        flipHorizontal: false,
    });
    console.log({ poses });
    requestAnimationFrame(gameLoop);
}

async function init() {
    detector = await getDetector();
    videoInput = await getVideoInput();
    console.log({ videoInput, detector });
    gameLoop();
}

init();
