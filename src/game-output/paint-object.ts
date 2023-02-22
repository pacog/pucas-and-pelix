import { RoughCanvas } from "roughjs/bin/canvas";
import { PucasPelixObject } from "../game-world/object";
import { OBJECT_OPTIONS } from "./constants";
import { Projector } from "./projector";

export function paintObject(
    canvas: RoughCanvas,
    obj: PucasPelixObject,
    projector: Projector
) {
    canvas.rectangle(
        ...projector.project({ x: obj.bounds.xMin, y: obj.bounds.yMin }),
        obj.bounds.dx,
        obj.bounds.dy,
        OBJECT_OPTIONS
    );
}
