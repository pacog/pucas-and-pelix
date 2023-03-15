import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { GameWorld } from "../game-world/game-world";
import { paintPlayer } from "./paint-player";
import { paintObject } from "./paint-object";
import { Projector, CanvasMargins } from "./projector";
import { Application, Graphics, Sprite } from "pixi.js";
import { random } from "../utils/random";
import chroma from "chroma-js";

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
    backgroundApp!: Application;
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
        this.backgroundApp = new Application({
            backgroundAlpha: 0,
            width,
            height,
        });
        backgroundHTML.appendChild(this.backgroundApp.view as any);
    }

    tick() {
        const gameWorld = this.options.getGameWorld();

        this.paintForegroundObjects(gameWorld);
        this.paintBGDestroyedObjects(gameWorld);

        this.raf = requestAnimationFrame(() => this.tick());
    }

    paintForegroundObjects(gameWorld: GameWorld) {
        this.clearForegroundCanvas();
        gameWorld.players.forEach((player) => {
            paintPlayer(this.foregroundRoughCanvas, player, this.projector);
        });

        gameWorld.objects.forEach((obj) => {
            paintObject(this.foregroundRoughCanvas, obj, this.projector);
        });
    }

    paintBGDestroyedObjects(gameWorld: GameWorld) {
        for (
            let i = this.lastPaintedDestroyedObject + 1;
            i < gameWorld.destroyedObjects.length;
            i++
        ) {
            const variation = Math.floor(random(1, 7));
            const splatter = Sprite.from(`./img/paint_${variation}.png`);
            splatter.anchor.set(0.5);
            const obj = gameWorld.destroyedObjects[i].object;
            const position = this.projector.project(obj.position);
            // move the sprite to the center of the screen
            splatter.x = position[0];
            splatter.y = position[1];
            splatter.tint = chroma(obj.color).num();
            splatter.scale.set(random(0.3, 0.6));
            splatter.angle = random(0, 360);

            this.backgroundApp.stage.addChild(splatter);
            this.lastPaintedDestroyedObject = i;
        }
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
