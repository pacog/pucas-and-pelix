import { Line, Point } from "@mathigon/euclid";
import { Keypoint } from "@tensorflow-models/pose-detection";
import { RoughCanvas } from "roughjs/bin/canvas";
import { PucasPelixPlayer } from "../game-world/player";
import {
    COLOR_FADED,
    COLOR_FULL,
    MAX_FULL_SCORE,
    MIN_FULL_SCORE,
    PLAYER_LINE_OPTIONS,
    SIZE_PLAYER_POINTS,
    SIZE_COLLIDABLE_POINTS,
    PLAYER_COLLIDABLE_POINT_OPTIONS,
} from "./constants";
import { Projector } from "./projector";
import chroma from "chroma-js";
import { MIN_POSE_SCORE_COLLISIONS } from "../constants";

export function paintPlayer(
    canvas: RoughCanvas,
    player: PucasPelixPlayer,
    projector: Projector
) {
    if (!player.pose) {
        return;
    }
    const usefulBaseKeypoints = player.pose.keypoints;

    const pointsToPaint = ["pelix_right_eye", "pelix_left_eye"];
    const linesToPaint = [
        ["left_shoulder", "right_shoulder"],
        ["mouth_right", "mouth_left"],
        ["left_shoulder", "right_shoulder"],
        ["left_shoulder", "left_elbow", "left_wrist"],
        ["right_shoulder", "right_elbow", "right_wrist"],
        ["left_shoulder", "left_hip"],
        ["right_shoulder", "right_hip"],
        ["left_hip", "right_hip"],
        ["left_hip", "left_knee"],
        ["left_ankle", "left_knee"],
        ["right_hip", "right_knee"],
        ["right_ankle", "right_knee"],
    ];

    const curvesToPaint = [
        [
            "left_shoulder",
            "left_head",
            "top_head_tall",
            "right_head",
            "right_shoulder",
        ],
    ];

    const specialPointsToPaint = [
        "left_wrist",
        "left_ankle",
        "right_wrist",
        "right_ankle",
    ];

    const keypointsMap = new Map<string, Keypoint>();
    for (const keypoint of usefulBaseKeypoints) {
        if (keypoint.name) {
            keypointsMap.set(keypoint.name, keypoint);
        }
    }

    const augmentedKeypoints = augmentKeypoints(keypointsMap);

    pointsToPaint.forEach((pointName) => {
        const keypoint = augmentedKeypoints.get(pointName);
        if (!keypoint) {
            return;
        }
        canvas.circle(...projector.project(keypoint), SIZE_PLAYER_POINTS, {
            ...PLAYER_LINE_OPTIONS,
            stroke: getColorForKeypoints([keypoint]),
        });
    });

    linesToPaint.forEach((line) => {
        const keypoints = line.map((pointName) =>
            augmentedKeypoints.get(pointName)
        );
        if (keypoints.some((keypoint) => !keypoint)) {
            return;
        }
        canvas.linearPath(
            keypoints.map((keypoint) => {
                if (!keypoint) {
                    throw new Error("Empty keypoint");
                }
                return projector.project(keypoint);
            }),
            {
                ...PLAYER_LINE_OPTIONS,
                stroke: getColorForKeypoints(keypoints as Keypoint[]),
            }
        );
    });

    curvesToPaint.forEach((curve) => {
        const keypoints = curve.map((pointName) =>
            augmentedKeypoints.get(pointName)
        );
        if (keypoints.some((keypoint) => !keypoint)) {
            return;
        }
        canvas.curve(
            keypoints.map((keypoint) => {
                if (!keypoint) {
                    throw new Error("Empty keypoint");
                }
                return projector.project(keypoint);
            }),
            {
                ...PLAYER_LINE_OPTIONS,
                stroke: getColorForKeypoints(keypoints as Keypoint[]),
            }
        );
    });

    specialPointsToPaint.forEach((pointName) => {
        const keypoint = augmentedKeypoints.get(pointName);
        if (!keypoint || (keypoint.score || 0) < MIN_POSE_SCORE_COLLISIONS) {
            return;
        }
        canvas.circle(...projector.project(keypoint), SIZE_COLLIDABLE_POINTS, {
            ...PLAYER_COLLIDABLE_POINT_OPTIONS,
        });
    });
}

function getColorForKeypoints(keypoints: Keypoint[]) {
    const minScore = keypoints.reduce((acc, keypoint) => {
        return Math.min(acc, keypoint.score || 0);
    }, 1);
    if (minScore <= MIN_FULL_SCORE) {
        return COLOR_FADED;
    }
    if (minScore >= MAX_FULL_SCORE) {
        return COLOR_FULL;
    }
    const fadeRatio =
        (minScore - MIN_FULL_SCORE) / (MAX_FULL_SCORE - MIN_FULL_SCORE);
    const scale = chroma.scale([COLOR_FADED, COLOR_FULL]);
    return scale(fadeRatio).hex();
}

function augmentKeypoints(keypoints: Map<string, Keypoint>) {
    const result = new Map(keypoints);

    const nose = result.get("nose");
    const rightEye = result.get("right_eye");
    const leftEye = result.get("left_eye");

    if (nose && rightEye && leftEye) {
        const score = Math.min(
            rightEye.score || 0,
            leftEye.score || 0,
            nose.score || 0
        );
        const lineEyes = new Line(
            new Point(rightEye.x, rightEye.y),
            new Point(leftEye.x, leftEye.y)
        );
        result.set("middle_eyes", {
            name: "middle_eyes",
            x: lineEyes.midpoint.x,
            y: lineEyes.midpoint.y,
            score,
        });
        const extraEyesSeparation = 0.75;
        const moreOpenEyesLine = new Line(
            new Point(
                lineEyes.at(0 - extraEyesSeparation).x,
                lineEyes.at(0 - extraEyesSeparation).y
            ),
            new Point(
                lineEyes.at(1 + extraEyesSeparation).x,
                lineEyes.at(1 + extraEyesSeparation).y
            )
        );
        const noseLineDown = lineEyes.perpendicularBisector;
        const eyesPosition = -2;
        const heightPointEyes = noseLineDown.at(eyesPosition);
        const openAndDownEyes = moreOpenEyesLine.parallel(heightPointEyes);
        result.set("pelix_right_eye", {
            name: "pelix_right_eye",
            x: openAndDownEyes.at(-0.5).x,
            y: openAndDownEyes.at(-0.5).y,
            score,
        });
        result.set("pelix_left_eye", {
            name: "pelix_left_eye",
            x: openAndDownEyes.at(0.5).x,
            y: openAndDownEyes.at(0.5).y,
            score,
        });

        const mouthNoseRotationPoint = noseLineDown.at(-2);
        const mouthLine = lineEyes.rotate(Math.PI, mouthNoseRotationPoint);
        result.set("mouth_right", {
            name: "mouth_right",
            x: mouthLine.at(0.25).x,
            y: mouthLine.at(0.25).y,
            score,
        });
        result.set("mouth_left", {
            name: "mouth_left",
            x: mouthLine.at(0.75).x,
            y: mouthLine.at(0.75).y,
            score,
        });
    }

    const middleEyes = result.get("middle_eyes");

    if (nose && middleEyes) {
        const score = Math.min(middleEyes.score || 0, nose.score || 0);

        const noseLine = new Line(
            new Point(middleEyes.x, middleEyes.y),
            new Point(nose.x, nose.y)
        );
        result.set("top_head_tall", {
            name: "top_head_tall",
            x: noseLine.at(-5).x,
            y: noseLine.at(-5).y,
            score,
        });
        result.set("top_head", {
            name: "top_head",
            x: noseLine.at(-4).x,
            y: noseLine.at(-4).y,
            score,
        });
        result.set("chin", {
            name: "chin",
            x: noseLine.at(4).x,
            y: noseLine.at(4).y,
            score,
        });
    }

    if (rightEye && leftEye) {
        const score = Math.min(rightEye.score || 0, leftEye.score || 0);
        const lineEyes = new Line(
            new Point(rightEye.x, rightEye.y),
            new Point(leftEye.x, leftEye.y)
        );
        const headWidth = 1.5;
        result.set("right_head", {
            name: "right_head",
            x: lineEyes.at(0 - headWidth).x,
            y: lineEyes.at(0 - headWidth).y,
            score,
        });
        result.set("left_head", {
            name: "left_head",
            x: lineEyes.at(1 + headWidth).x,
            y: lineEyes.at(1 + headWidth).y,
            score,
        });
    }

    return result;
}
