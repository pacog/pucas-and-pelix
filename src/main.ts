import { Pose, PoseDetector } from "@tensorflow-models/pose-detection";
import { getDetector } from "./pose-detection";
import { getVideoInput } from "./video-input";
import { GameOutput } from "./game-output/game-output";
import { GameWorld } from "./game-world/game-world";
import { MAX_POSES, MIN_POSE_SCORE } from "./constants";

let detector: PoseDetector;
let videoInput: HTMLVideoElement;
let currentPoses: Pose[] = [];
let gameWorld: GameWorld;

/**
 * Updates game world
 */
function gameLoop() {
    // TODO: check if too much time has passed, to run incremental updates
    gameWorld.update(getCurrentTime(), currentPoses);

    requestAnimationFrame(gameLoop);
}

async function updatePosesLoop() {
    requestAnimationFrame(updatePosesLoop);
    // TODO: This can be throttled
    await updatePoses();
}

function getGameWorld() {
    return gameWorld;
}

async function init() {
    const videoInputInfo = await getVideoInput();
    detector = await getDetector();
    videoInput = videoInputInfo.videoElement;
    gameWorld = new GameWorld({
        maxPlayers: MAX_POSES,
        size: videoInputInfo.containerSize,
    });
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
    updatePosesLoop();
    gameLoop();
}

init();

async function updatePoses() {
    currentPoses = await detector.estimatePoses(videoInput, {
        maxPoses: MAX_POSES,
    });
    currentPoses = currentPoses
        .filter((pose) => (pose.score || 0) >= MIN_POSE_SCORE)
        .map((pose) => {
            return {
                ...pose,
                keypoints: pose.keypoints.filter(
                    (keypoint) => (keypoint.score || 0) >= MIN_POSE_SCORE
                ),
            };
        });
}

function getCurrentTime() {
    return Date.now();
}
