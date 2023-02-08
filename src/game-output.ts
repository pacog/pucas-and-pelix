import { Application, Graphics } from "pixi.js";
import { GameWorld } from "./game-world";

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
        console.log("tick", gameWorld.players.length);
        this.playerGraphics.clear();
        gameWorld.players.forEach((player) => {
            if (!player.pose) {
                return;
            }
            const leftEye = player.pose.keypoints.find(
                (keypoint) => keypoint.name === "left_eye"
            );
            const rightEye = player.pose.keypoints.find(
                (keypoint) => keypoint.name === "right_eye"
            );
            if (!leftEye || !rightEye) {
                return;
            }
            this.playerGraphics.lineStyle(2, 0xffffff, 1);
            this.playerGraphics.moveTo(...this.project(leftEye));
            this.playerGraphics.lineTo(...this.project(rightEye));
            this.playerGraphics.closePath();
        });
    }

    project(coords: { x: number; y: number }): [number, number] {
        return [
            coords.x + this.options.margins.horizontal,
            coords.y + this.options.margins.vertical,
        ];
    }
}
