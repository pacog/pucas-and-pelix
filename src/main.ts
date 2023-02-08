import { Pose, PoseDetector } from "@tensorflow-models/pose-detection";

import { getDetector } from "./pose-detection";
import { range } from "./range";
import { getVideoInput } from "./video-input";
import { GameOutput } from "./game-output";
import { GameWorld } from "./game-world";

const MAX_POSES = 4;

let detector: PoseDetector;
let videoInput: HTMLVideoElement;
let gameOutput: GameOutput;
let currentPoses: Pose[] = [];
let gameWorld: GameWorld;

/**
 * Updates game world depending on input
 */
async function gameLoop() {
    currentPoses = await detector.estimatePoses(videoInput, {
        maxPoses: MAX_POSES,
        flipHorizontal: false,
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
    detector = await getDetector();
    const videoInputInfo = await getVideoInput();
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
