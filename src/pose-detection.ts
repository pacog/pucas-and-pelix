import {
    SupportedModels,
    movenet,
    createDetector,
} from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";

export async function getDetector() {
    const detector = await createDetector(SupportedModels.MoveNet, {
        modelType: movenet.modelType.MULTIPOSE_LIGHTNING,
    });

    if (!detector) {
        throw new Error("Error creating pose detector");
    }
    startTFBackend();
    return detector;
}

function startTFBackend() {
    const flagConfig = {
        WEBGL_CPU_FORWARD: true,
        WEBGL_FLUSH_THRESHOLD: -1,
        WEBGL_FORCE_F16_TEXTURES: false,
        WEBGL_PACK: true,
        WEBGL_RENDER_FLOAT32_CAPABLE: true,
        WEBGL_VERSION: 2,
    };

    tf.env().setFlags(flagConfig);

    const backendName = "webgl";

    const ENGINE = tf.engine();

    if (!(backendName in ENGINE.registryFactory)) {
        throw new Error(`${backendName} backend is not registered.`);
    }

    if (backendName in ENGINE.registry) {
        const backendFactory = tf.findBackendFactory(backendName);
        tf.removeBackend(backendName);
        tf.registerBackend(backendName, backendFactory);
    }

    return tf.setBackend(backendName);
}
