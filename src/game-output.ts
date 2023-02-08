import { Keypoint } from "@tensorflow-models/pose-detection";
import { Application, Graphics } from "pixi.js";
import { GameWorld } from "./game-world";
import { PucasPelixPlayer } from "./player";

interface GameOutputOptions {
    getGameWorld: () => GameWorld;
    margins: { vertical: number; horizontal: number };
}

/**
 * Will output the game world into the screen. Will take care of running its own game loop, and will request world data when needed.
 */
export class GameOutput {
    options: GameOutputOptions;
    app: Application;
    playerGraphics: Graphics;

    constructor(container: HTMLElement | null, options: GameOutputOptions) {
        if (!container) {
            throw new Error("GameOutput needs a container");
        }
        this.options = options;
        const { width, height } = container.getBoundingClientRect();
        this.app = new Application({
            antialias: true,
            width,
            height,
            backgroundAlpha: 0,
        });
        container.appendChild(this.app.view as unknown as Node);
        this.app.ticker.add(() => this.tick(options.getGameWorld()));

        this.playerGraphics = new Graphics();
        this.app.stage.addChild(this.playerGraphics);
    }

    tick(gameWorld: GameWorld) {
        this.playerGraphics.clear();
        gameWorld.players.forEach((player) => {
            this.paintPlayer(player);
        });
    }

    project(coords: { x: number; y: number }): [number, number] {
        return [
            coords.x + this.options.margins.horizontal,
            coords.y + this.options.margins.vertical,
        ];
    }

    paintPlayer(player: PucasPelixPlayer) {
        const MIN_ACCURACY = 0.4;
        if (!player.pose) {
            return;
        }
        const usefulBaseKeypoints = player.pose.keypoints.filter(
            (keypoint) => (keypoint.score || 0) > MIN_ACCURACY
        );

        // TODO: object that creates new keypoints from old ones

        const pointsToPaint = [
            "left_eye",
            "right_eye",
            "left_shoulder",
            "right_shoulder",
        ];
        const linesToPaint = [
            ["left_shoulder", "right_shoulder"],
            ["left_shoulder", "right_shoulder"],
            ["left_shoulder", "left_elbow", "left_wrist"],
            ["right_shoulder", "right_elbow", "right_wrist"],
        ];

        const keypointsMap = new Map<string, Keypoint>();
        for (const keypoint of usefulBaseKeypoints) {
            if (keypoint.name) {
                keypointsMap.set(keypoint.name, keypoint);
            }
        }

        pointsToPaint.forEach((pointName) => {
            const keypoint = keypointsMap.get(pointName);
            if (!keypoint) {
                return;
            }
            this.playerGraphics.beginFill(0xde3249, 1);
            this.playerGraphics.drawCircle(...this.project(keypoint), 10);
            this.playerGraphics.endFill();
        });

        linesToPaint.forEach((line) => {
            const keypoints = line.map((pointName) =>
                keypointsMap.get(pointName)
            );
            if (keypoints.some((keypoint) => !keypoint)) {
                return;
            }
            this.playerGraphics.lineStyle(2, 0xffffff, 1);
            keypoints.forEach((keypoint, index) => {
                if (!keypoint) {
                    return;
                }
                if (index === 0) {
                    this.playerGraphics.moveTo(...this.project(keypoint));
                } else {
                    this.playerGraphics.lineTo(...this.project(keypoint));
                }
            });
        });
    }
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
