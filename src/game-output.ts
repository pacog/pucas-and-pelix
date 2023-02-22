import { Line, Point } from "@mathigon/euclid";
import { Keypoint } from "@tensorflow-models/pose-detection";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { GameWorld } from "./game-world";
import { PucasPelixPlayer } from "./player";

interface GameOutputOptions {
    getGameWorld: () => GameWorld;
    margins: { vertical: number; horizontal: number };
}

const LINE_OPTIONS = {
    roughness: 2, // Numerical value indicating how rough the drawing is. A rectangle with the roughness of 0 would be a perfect rectangle. Default value is 1. There is no upper limit to this value, but a value over 10 is mostly useless.

    //Numerical value indicating how curvy the lines are when drawing a sketch. A value of 0 will cause straight lines. Default value is 1.
    bowing: 2,

    //String value representing the color of the drawn objects. Default value is black (#000000). If the this is set to none, the shape vectors do not contain a stroke (This is different from having a transparent stroke).
    stroke: "#000000",

    // Numerical value to set the width of the strokes (in pixels). Default value is 1.
    strokeWidth: 4,

    // fill: '',
    // String value representing the color used to fill a shape. In hachure style fills, this represents the color of the hachure lines. In dots style, it represents the color of the dots.
    // Rough.js supports the following styles (Default value is hachure):
    // hachure draws sketchy parallel lines with the same roughness as defined by the roughness and the bowing properties of the shape. It can be further configured using the fillWeight, hachureAngle, and hachureGap properties.
    // solid is more like a conventional fill.
    // zigzag draws zig-zag lines filling the shape
    // cross-hatch Similar to hachure, but draws cross hatch lines (akin to two hachure fills 90 degrees from each other).
    // dots Fills the shape with sketchy dots.
    // dashed Similar to hachure but the individual lines are dashed. Dashes can be configured using the dashOffset and dashGap properties.
    // zigzag-line Similar to hachure but individual lines are drawn in a zig-zag fashion. The size of the zig-zag can be configured using the zigzagOffset proeprty
    // fillStyle:

    // curveFitting
    // When drawing ellipses, circles, and arcs, Let RoughJS know how close should the rendered dimensions be when compared to the specified one. Default value is 0.95 - which means the rendered dimensions will be at least 95% close to the specified dimensions. A value of 1 will ensure that the dimensions are almost 100% accurate.
};

/**
 * Will output the game world into the screen. Will take care of running its own game loop, and will request world data when needed.
 */
export class GameOutput {
    options: GameOutputOptions;
    rc: RoughCanvas;
    raf: number;
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    constructor(
        container: HTMLCanvasElement | null,
        options: GameOutputOptions
    ) {
        if (!container) {
            throw new Error("GameOutput needs a container");
        }
        this.options = options;
        this.canvas = container;
        this.canvasContext = container.getContext(
            "2d"
        ) as CanvasRenderingContext2D;
        const { width, height } = container.getBoundingClientRect();
        container.setAttribute("width", width + "");
        container.setAttribute("height", height + "");
        this.rc = rough.canvas(container);
        this.raf = requestAnimationFrame(() => this.tick());
    }

    tick() {
        const gameWorld = this.options.getGameWorld();

        this.clearCanvas();
        gameWorld.players.forEach((player) => {
            this.paintPlayer(player);
        });

        this.raf = requestAnimationFrame(() => this.tick());
    }

    clearCanvas() {
        this.canvasContext.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    project(coords: { x: number; y: number }): [number, number] {
        return [
            coords.x + this.options.margins.horizontal,
            coords.y + this.options.margins.vertical,
        ];
    }

    paintPlayer(player: PucasPelixPlayer) {
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
            this.rc.circle(
                ...this.project(keypoint),
                SIZE_POINTS,
                LINE_OPTIONS
            );
        });

        linesToPaint.forEach((line) => {
            const keypoints = line.map((pointName) =>
                augmentedKeypoints.get(pointName)
            );
            if (keypoints.some((keypoint) => !keypoint)) {
                return;
            }
            this.rc.linearPath(
                keypoints.map((keypoint) => {
                    if (!keypoint) {
                        throw new Error("Empty keypoint");
                    }
                    return this.project(keypoint);
                }),
                LINE_OPTIONS
            );
        });
    }
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

// ("nose");
// ("left_eye");
// ("right_eye");
// ("left_ear");
// ("right_ear");
// ("left_shoulder");
// ("right_shoulder");
// ("left_elbow");
// ("right_elbow");
// ("left_wrist");
// ("right_wrist");
// ("left_hip");
// ("right_hip");
// ("left_knee");
// ("right_knee");
// ("left_ankle");
// ("right_ankle");
