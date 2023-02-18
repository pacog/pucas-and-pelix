import {
    SupportedModels,
    movenet,
    createDetector,
} from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";
import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

export enum SUPPORTED_DETECTORS {
    PoseNet,
    MoveNet,
}

tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

export async function getDetector(
    type: SUPPORTED_DETECTORS = SUPPORTED_DETECTORS.PoseNet
) {
    let detector;
    if (type === SUPPORTED_DETECTORS.MoveNet) {
        detector = await createDetector(SupportedModels.MoveNet, {
            modelType: movenet.modelType.MULTIPOSE_LIGHTNING,
        });
    }
    if (type === SUPPORTED_DETECTORS.PoseNet) {
        detector = await createDetector(SupportedModels.PoseNet, {
            quantBytes: 4,
            architecture: "MobileNetV1",
            outputStride: 16,
            inputResolution: null,
            multiplier: 0.75,
        });
    }

    if (!detector) {
        throw new Error("Error creating pose detector");
    }
    setBackendAndEnvFlags();
    return detector;
}

import * as tf from "@tensorflow/tfjs-core";
import { BACKEND } from "./constants";

export const TUNABLE_FLAG_VALUE_RANGE_MAP = {
    WEBGL_VERSION: [1, 2],
    WASM_HAS_SIMD_SUPPORT: [true, false],
    WASM_HAS_MULTITHREAD_SUPPORT: [true, false],
    WEBGL_CPU_FORWARD: [true, false],
    WEBGL_PACK: [true, false],
    WEBGL_FORCE_F16_TEXTURES: [true, false],
    WEBGL_RENDER_FLOAT32_CAPABLE: [true, false],
    WEBGL_FLUSH_THRESHOLD: [-1, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    CHECK_COMPUTATION_FOR_ERRORS: [true, false],
};
/**
 * Reset the target backend.
 */
async function resetBackend(backendName: string) {
    const ENGINE = tf.engine();
    if (!(backendName in ENGINE.registryFactory)) {
        throw new Error(`${backendName} backend is not registered.`);
    }

    if (backendName in ENGINE.registry) {
        const backendFactory = tf.findBackendFactory(backendName);
        tf.removeBackend(backendName);
        tf.registerBackend(backendName, backendFactory);
    }

    await tf.setBackend(backendName);
}

async function setBackendAndEnvFlags() {
    const flagConfig = {
        WEBGL_CPU_FORWARD: true,
        WEBGL_FLUSH_THRESHOLD: -1,
        WEBGL_FORCE_F16_TEXTURES: false,
        WEBGL_PACK: true,
        WEBGL_RENDER_FLOAT32_CAPABLE: true,
        WEBGL_VERSION: 2,
    };

    tf.env().setFlags(flagConfig);

    const [runtime, $backend] = (BACKEND + "").split("-");

    if (runtime === "tfjs") {
        await resetBackend($backend);
    }
}
