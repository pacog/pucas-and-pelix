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

/**
 * Set environment flags.
 *
 * This is a wrapper function of `tf.env().setFlags()` to constrain users to
 * only set tunable flags (the keys of `TUNABLE_FLAG_TYPE_MAP`).
 *
 * ```js
 * const flagConfig = {
 *        WEBGL_PACK: false,
 *      };
 * await setEnvFlags(flagConfig);
 *
 * console.log(tf.env().getBool('WEBGL_PACK')); // false
 * console.log(tf.env().getBool('WEBGL_PACK_BINARY_OPERATIONS')); // false
 * ```
 */
export async function setBackendAndEnvFlags() {
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
