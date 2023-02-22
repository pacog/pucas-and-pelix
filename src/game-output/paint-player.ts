import { Line, Point } from "@mathigon/euclid";
import { Keypoint } from "@tensorflow-models/pose-detection";
import { RoughCanvas } from "roughjs/bin/canvas";
import { PucasPelixPlayer } from "../player";
import { PLAYER_LINE_OPTIONS } from "./constants";
import { Projector } from "./projector";

export function paintPlayer(
    canvas: RoughCanvas,
    player: PucasPelixPlayer,
    projector: Projector
) {
    const SIZE_POINTS = 10;

    if (!player.pose) {
        return;
    }
    const usefulBaseKeypoints = player.pose.keypoints;

    const pointsToPaint = [
        "left_eye",
        "right_eye",
        // "nose",
        // "left_shoulder",
        // "right_shoulder",
        // "middle_eyes",
        // "mouth_center",
        // "mouth_right",
        // "mouth_left",
        // "top_head",
        // "right_head",
        // "left_head",
        // "chin",
    ];
    const linesToPaint = [
        ["left_shoulder", "right_shoulder"],
        [
            "left_shoulder",
            "left_head",
            "top_head",
            "right_head",
            "right_shoulder",
        ],
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
        canvas.circle(
            ...projector.project(keypoint),
            SIZE_POINTS,
            PLAYER_LINE_OPTIONS
        );
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
            PLAYER_LINE_OPTIONS
        );
    });
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
        const nosePoint = new Point(nose.x, nose.y);
        const noseLine = lineEyes.parallel(nosePoint);
        const mouthPoint = lineEyes.midpoint.reflect(noseLine);
        result.set("mouth_center", {
            name: "mouth_center",
            x: mouthPoint.x,
            y: mouthPoint.y,
            score,
        });
        const mouthLine = lineEyes.rotate(Math.PI, nosePoint);
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
        result.set("right_head", {
            name: "right_head",
            x: lineEyes.at(-1).x,
            y: lineEyes.at(-1).y,
            score,
        });
        result.set("left_head", {
            name: "left_head",
            x: lineEyes.at(2).x,
            y: lineEyes.at(2).y,
            score,
        });
    }

    return result;
}
