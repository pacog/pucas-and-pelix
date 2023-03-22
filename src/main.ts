import { Pose, PoseDetector } from "@tensorflow-models/pose-detection";
import { getDetector } from "./pose-detection";
import { getVideoInput } from "./video-input";
import { GameOutput } from "./game-output/game-output";
import { GameWorld } from "./game-world/game-world";
import { MAX_POSES, MIN_POSE_SCORE } from "./constants";
import {
    playObjectAppeared,
    playObjectDestroyed,
    playObjectDiedNaturally,
    playPlayerHappy,
    setMute,
} from "./game-output/sounds";
import { PucasPelixUI } from "./ui/ui";

let detector: PoseDetector;
let videoInput: HTMLVideoElement;
let currentPoses: Pose[] = [];
let gameWorld: GameWorld;
let isMenuShown = false;
let gameOutput: GameOutput;
let currentTime = 0;
let lastFrameTime: number;
let currentFrameTime: number;

/**
 * Updates game world
 */
function gameLoop() {
    if (lastFrameTime === undefined) {
        lastFrameTime = Date.now();
    }
    currentFrameTime = Date.now();
    const elapsed = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;
    if (!isMenuShown) {
        currentTime += elapsed;
        // TODO: check if too much time has passed, to run incremental updates
        gameWorld.update(currentTime, currentPoses);
    }
    requestAnimationFrame(gameLoop);
}

async function updatePosesLoop() {
    requestAnimationFrame(updatePosesLoop);
    if (!isMenuShown) {
        // TODO: This can be throttled
        await updatePoses();
    }
}

function getGameWorld() {
    return gameWorld;
}

async function init() {
    new PucasPelixUI({
        onSoundChange: (isSoundOn) => {
            setMute(!isSoundOn);
        },
        onMenuChange: (newIsMenuShown) => {
            isMenuShown = newIsMenuShown;
            if (gameOutput) {
                gameOutput.setEnabled(!isMenuShown);
            }
        },
    });
    const videoInputInfo = await getVideoInput();
    detector = await getDetector();
    videoInput = videoInputInfo.videoElement;
    const onObjectDestroyed = () => {
        playObjectDestroyed();
        playPlayerHappy();
    };
    const onObjectCreated = () => {
        playObjectAppeared();
    };
    const onObjectDiedNaturally = () => {
        playObjectDiedNaturally();
    };
    gameWorld = new GameWorld({
        maxPlayers: MAX_POSES,
        size: videoInputInfo.containerSize,
        // TODO: improve event system
        onObjectDestroyed,
        onObjectCreated,
        onObjectDiedNaturally,
    });
    gameOutput = new GameOutput(
        document.getElementById("foreground") as HTMLCanvasElement,
        document.getElementById("background") as HTMLElement,
        {
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
        }
    );
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
