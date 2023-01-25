import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
import * as posedetection from "@tensorflow-models/pose-detection";
import { Camera } from "./camera";
import { setBackendAndEnvFlags } from "./util";
import { MODEL, MODEL_TYPE, MAX_POSES } from "./constants";

tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

let detector: posedetection.PoseDetector | null;
let camera: Camera;

async function createDetector() {
    return posedetection.createDetector(MODEL, {
        modelType: MODEL_TYPE,
    });
}

async function renderResult() {
    // TODO: extract
    if (camera.video.readyState < 2) {
        await new Promise((resolve) => {
            camera.video.onloadeddata = () => {
                resolve(true);
            };
        });
    }

    let poses = null;

    // Detector can be null if initialization failed (for example when loading
    // from a URL that does not exist).
    if (!!detector) {
        // Detectors can throw errors, for example when using custom URLs that
        // contain a model that doesn't provide the expected output.
        try {
            poses = await detector.estimatePoses(camera.video, {
                maxPoses: MAX_POSES,
                flipHorizontal: false,
            });
        } catch (error) {
            detector.dispose();
            detector = null;
            alert(error);
        }
    }

    camera.drawCtx();

    if (poses && poses.length > 0) {
        camera.drawResults(poses);
    }
}

async function renderPrediction() {
    await renderResult();
    requestAnimationFrame(renderPrediction);
}

async function app() {
    camera = await Camera.setupCamera({
        targetFPS: 60,
        size: { width: 640, height: 480 },
    });

    await setBackendAndEnvFlags();

    detector = await createDetector();

    renderPrediction();
}

app();
