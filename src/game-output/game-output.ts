import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { GameWorld } from "../game-world/game-world";
import { paintPlayer } from "./paint-player";
import { paintObject } from "./paint-object";
import { Projector, CanvasMargins } from "./projector";
import { Application, Graphics } from "pixi.js";

interface GameOutputOptions {
    getGameWorld: () => GameWorld;
    margins: CanvasMargins;
}

/**
 * Will output the game world into the screen. Will take care of running its own game loop, and will request world data when needed.
 */
export class GameOutput {
    options: GameOutputOptions;
    foregroundRoughCanvas!: RoughCanvas;
    raf: number;
    foregroundCanvas!: HTMLCanvasElement;
    foregroundCanvasContext!: CanvasRenderingContext2D;
    backgroundGraphics!: Graphics;
    projector: Projector;
    lastPaintedDestroyedObject: number;

    constructor(
        foregroundHTMLCanvas: HTMLCanvasElement | null,
        backgroundHTML: HTMLElement | null,
        options: GameOutputOptions
    ) {
        this.options = options;
        this.createForegroundCanvas(foregroundHTMLCanvas);
        this.createBackgroundCanvas(backgroundHTML);
        this.raf = requestAnimationFrame(() => this.tick());
        this.projector = new Projector(this.options.margins);
        this.lastPaintedDestroyedObject = -1;
    }

    private createForegroundCanvas(
        foregroundHTMLCanvas: HTMLCanvasElement | null
    ) {
        if (!foregroundHTMLCanvas) {
            throw new Error("GameOutput needs a foregroundHTMLCanvas");
        }
        this.foregroundCanvas = foregroundHTMLCanvas;
        this.foregroundCanvasContext = foregroundHTMLCanvas.getContext(
            "2d"
        ) as CanvasRenderingContext2D;
        const { width, height } = foregroundHTMLCanvas.getBoundingClientRect();
        foregroundHTMLCanvas.setAttribute("width", width + "");
        foregroundHTMLCanvas.setAttribute("height", height + "");
        this.foregroundRoughCanvas = rough.canvas(foregroundHTMLCanvas);
    }

    private createBackgroundCanvas(backgroundHTML: HTMLElement | null) {
        if (!backgroundHTML) {
            throw new Error("GameOutput needs a backgroundHTML");
        }
        const { width, height } = backgroundHTML.getBoundingClientRect();
        const app = new Application({ backgroundAlpha: 0, width, height });
        backgroundHTML.appendChild(app.view as any);
        this.backgroundGraphics = new Graphics();
        app.stage.addChild(this.backgroundGraphics);
    }

    tick() {
        const gameWorld = this.options.getGameWorld();

        this.clearForegroundCanvas();
        gameWorld.players.forEach((player) => {
            paintPlayer(this.foregroundRoughCanvas, player, this.projector);
        });

        gameWorld.objects.forEach((obj) => {
            paintObject(this.foregroundRoughCanvas, obj, this.projector);
        });

        for (
            let i = this.lastPaintedDestroyedObject + 1;
            i < gameWorld.destroyedObjects.length;
            i++
        ) {
            const obj = gameWorld.destroyedObjects[i].object;
            this.backgroundGraphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
            this.backgroundGraphics.beginFill(0xde3249, 0.1);
            this.backgroundGraphics.drawCircle(
                ...this.projector.project(obj.position),
                100
            );
            this.backgroundGraphics.endFill();
            this.lastPaintedDestroyedObject = i;
        }

        this.raf = requestAnimationFrame(() => this.tick());
    }

    clearForegroundCanvas() {
        this.foregroundCanvasContext.clearRect(
            0,
            0,
            this.foregroundCanvas.width,
            this.foregroundCanvas.height
        );
    }
}
