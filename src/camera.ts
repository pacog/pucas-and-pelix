import * as posedetection from "@tensorflow-models/pose-detection";
import {
    DEFAULT_LINE_WIDTH,
    MODEL,
    SCORE_THRESHOLD,
    DEFAULT_RADIUS,
} from "./constants";

const COLOR_PALETTE = [
    "#ffffff",
    "#800000",
    "#469990",
    "#e6194b",
    "#42d4f4",
    "#fabed4",
    "#aaffc3",
    "#9a6324",
    "#000075",
    "#f58231",
    "#4363d8",
    "#ffd8b1",
    "#dcbeff",
    "#808000",
    "#ffe119",
    "#911eb4",
    "#bfef45",
    "#f032e6",
    "#3cb44b",
    "#a9a9a9",
];
export class Camera {
    video: HTMLVideoElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor() {
        this.video = document.getElementById("video") as HTMLVideoElement;
        if (!this.video) {
            throw new Error("Video element not found");
        }
        this.canvas = document.getElementById("output") as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error("canvas element not found");
        }
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    /**
     * Initiate a Camera instance and wait for the camera stream to be ready.
     */
    static async setupCamera({
        targetFPS,
        size,
    }: {
        targetFPS: number;
        size: { height: number; width: number };
    }) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                "Browser API navigator.mediaDevices.getUserMedia not available"
            );
        }

        const videoConfig = {
            audio: false,
            video: {
                facingMode: "user",
                ...size,
                frameRate: {
                    ideal: targetFPS,
                },
            },
        };

        const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

        const camera = new Camera();
        camera.video.srcObject = stream;

        await new Promise((resolve) => {
            camera.video.onloadedmetadata = () => {
                resolve(true);
            };
        });

        camera.video.play();

        const videoWidth = camera.video.videoWidth;
        const videoHeight = camera.video.videoHeight;
        // Must set below two lines, otherwise video element doesn't show.
        camera.video.width = videoWidth;
        camera.video.height = videoHeight;

        camera.canvas.width = videoWidth;
        camera.canvas.height = videoHeight;
        const canvasContainer = document.querySelector(
            ".canvas-wrapper"
        ) as HTMLElement;
        if (!canvasContainer) {
            throw new Error("canvas container not found");
        }
        canvasContainer.style.width = `${videoWidth}px`;
        canvasContainer.style.height = `${videoHeight}px`;

        // Because the image from camera is mirrored, need to flip horizontally.
        camera.ctx.translate(camera.video.videoWidth, 0);
        camera.ctx.scale(-1, 1);

        return camera;
    }

    drawCtx() {
        this.ctx.drawImage(
            this.video,
            0,
            0,
            this.video.videoWidth,
            this.video.videoHeight
        );
    }

    /**
     * Draw the keypoints and skeleton on the video.
     */
    drawResults(poses: posedetection.Pose[]) {
        for (const pose of poses) {
            this.drawResult(pose);
        }
    }

    /**
     * Draw the keypoints and skeleton on the video.
     */
    private drawResult(pose: posedetection.Pose) {
        if (pose.keypoints != null) {
            this.drawKeypoints(pose.keypoints);
            this.drawSkeleton(pose.keypoints, pose.id);
        }
    }

    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    private drawKeypoints(keypoints: posedetection.Keypoint[]) {
        const keypointInd = posedetection.util.getKeypointIndexBySide(MODEL);
        this.ctx.fillStyle = "Red";
        this.ctx.strokeStyle = "White";
        this.ctx.lineWidth = DEFAULT_LINE_WIDTH;

        for (const i of keypointInd.middle) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = "Green";
        for (const i of keypointInd.left) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = "Orange";
        for (const i of keypointInd.right) {
            this.drawKeypoint(keypoints[i]);
        }
    }

    private drawKeypoint(keypoint: posedetection.Keypoint) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1;

        if (score >= SCORE_THRESHOLD) {
            const circle = new Path2D();
            circle.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI);
            this.ctx.fill(circle);
            this.ctx.stroke(circle);
        }
    }

    /**
     * Draw the skeleton of a body on the video.
     * @param keypoints A list of keypoints.
     */
    private drawSkeleton(keypoints: posedetection.Keypoint[], poseId?: number) {
        // Each poseId is mapped to a color in the color palette.
        const color = !!poseId ? COLOR_PALETTE[poseId % 20] : "White";
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = DEFAULT_LINE_WIDTH;

        posedetection.util.getAdjacentPairs(MODEL).forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            // If score is null, just show the keypoint.
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;

            if (score1 >= SCORE_THRESHOLD && score2 >= SCORE_THRESHOLD) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }
}
