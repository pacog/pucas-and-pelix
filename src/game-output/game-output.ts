import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { GameWorld } from "../game-world/game-world";
import { paintPlayer } from "./paint-player";
import { paintObject } from "./paint-object";
import { Projector, CanvasMargins } from "./projector";

interface GameOutputOptions {
    getGameWorld: () => GameWorld;
    margins: CanvasMargins;
}

/**
 * Will output the game world into the screen. Will take care of running its own game loop, and will request world data when needed.
 */
export class GameOutput {
    options: GameOutputOptions;
    rc: RoughCanvas;
    raf: number;
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    projector: Projector;

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
        this.projector = new Projector(this.options.margins);
    }

    tick() {
        const gameWorld = this.options.getGameWorld();

        this.clearCanvas();
        gameWorld.players.forEach((player) => {
            paintPlayer(this.rc, player, this.projector);
        });

        gameWorld.objects.forEach((obj) => {
            paintObject(this.rc, obj, this.projector);
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
}
