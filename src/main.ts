import { Pose, PoseDetector } from "@tensorflow-models/pose-detection";

import { getDetector, SUPPORTED_DETECTORS } from "./pose-detection";
import { range } from "./range";
import { getVideoInput } from "./video-input";
import { GameOutput } from "./game-output/game-output";
import { GameWorld } from "./game-world";
import { initUI, updateTogglePoseDetectionType } from "./ui";

const MAX_POSES = 4;
let detectorType: SUPPORTED_DETECTORS = SUPPORTED_DETECTORS.MoveNet;

let detector: PoseDetector;
let videoInput: HTMLVideoElement;
let currentPoses: Pose[] = [];
let gameWorld: GameWorld;

/**
 * Updates game world depending on input
 */
async function gameLoop() {
    const minAccuracy =
        detectorType === SUPPORTED_DETECTORS.MoveNet ? 0.15 : 0.15;
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
    detector = await getDetector(detectorType);
    videoInput = videoInputInfo.videoElement;
    gameWorld = new GameWorld({ maxPlayers: MAX_POSES });
    new GameOutput(document.getElementById("output") as HTMLCanvasElement, {
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
    initUI(onToggleDetectionType);
    updateUI();
    gameLoop();
}

function updateUI() {
    switch (detectorType) {
        case SUPPORTED_DETECTORS.MoveNet:
            updateTogglePoseDetectionType("New - MoveNet");
            break;
        case SUPPORTED_DETECTORS.PoseNet:
            updateTogglePoseDetectionType("Old - PoseNet");
            break;
    }
}

async function onToggleDetectionType() {
    console.log("onToggleDetectionType");
    if (detectorType === SUPPORTED_DETECTORS.MoveNet) {
        detectorType = SUPPORTED_DETECTORS.PoseNet;
    } else {
        detectorType = SUPPORTED_DETECTORS.MoveNet;
    }
    detector = await getDetector(detectorType);
    updateUI();
}

init();
