import { RoughCanvas } from "roughjs/bin/canvas";
import { PucasPelixObject } from "../game-world/object";
import { OBJECT_OPTIONS } from "./constants";
import { Projector } from "./projector";

export function paintObject(
    canvas: RoughCanvas,
    obj: PucasPelixObject,
    projector: Projector
) {
    const vertices = obj.getPoligon().map((v) => projector.project(v));
    canvas.polygon(vertices, OBJECT_OPTIONS);
}
