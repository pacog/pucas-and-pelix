export interface CanvasMargins {
    vertical: number;
    horizontal: number;
}

/**
 * Takes cares of projecting points in the world to where they belong in the canvas
 * Will take into account the margins where there is no video input
 */
export class Projector {
    margins: CanvasMargins;

    constructor(canvasMargins: CanvasMargins) {
        this.margins = canvasMargins;
    }

    project(coords: { x: number; y: number }): [number, number] {
        return [
            coords.x + this.margins.horizontal,
            coords.y + this.margins.vertical,
        ];
    }
}
