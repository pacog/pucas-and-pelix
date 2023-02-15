import { Pose, PoseDetector } from "@tensorflow-models/pose-detection";

import { getDetector, SUPPORTED_DETECTORS } from "./pose-detection";
import { range } from "./range";
import { getVideoInput } from "./video-input";
import { GameOutput } from "./game-output";
import { GameWorld } from "./game-world";

const MAX_POSES = 4;
const DETECTOR_TYPE = SUPPORTED_DETECTORS.MoveNet;

let detector: PoseDetector;
let videoInput: HTMLVideoElement;
let gameOutput: GameOutput;
let currentPoses: Pose[] = [];
let gameWorld: GameWorld;

/**
 * Updates game world depending on input
 */
async function gameLoop() {
    const minAccuracy =
        DETECTOR_TYPE === SUPPORTED_DETECTORS.MoveNet ? 0.2 : 0.4;
    currentPoses = await detector.estimatePoses(videoInput, {
        maxPoses: MAX_POSES,
    });
    currentPoses = currentPoses
        .filter((pose) => (pose.score || 0) >= minAccuracy)
        .map((pose) => {
            return {
                ...pose,
                keypoints: pose.keypoints.filter(
                    (keypoint) => (keypoint.score || 0) >= minAccuracy
                ),
            };
        });

    for (const i of range(0, MAX_POSES)) {
        gameWorld.players[i].updateWithPose(currentPoses[i]);
    }
    requestAnimationFrame(gameLoop);
}

function getGameWorld() {
    return gameWorld;
}

async function init() {
    const videoInputInfo = await getVideoInput();
    detector = await getDetector(DETECTOR_TYPE);
    videoInput = videoInputInfo.videoElement;
    gameWorld = new GameWorld({ maxPlayers: MAX_POSES });
    gameOutput = new GameOutput(document.getElementById("pixi"), {
        getGameWorld,
        margins: {
            vertical:
                (videoInputInfo.containerSize.height -
                    (videoInputInfo.contentSize.height || 0) || 0) / 2,
            horizontal:
                (videoInputInfo.containerSize.width -
                    (videoInputInfo.contentSize.width || 0)) /
                2,
        },
    });
    gameLoop();
}

init();
