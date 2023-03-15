import { RoughCanvas } from "roughjs/bin/canvas";
import { PucasPelixObject } from "../game-world/object";
import { OBJECT_OPTIONS, OBJECT_STROKE } from "./constants";
import { Projector } from "./projector";
import chroma from "chroma-js";

const START_FADING_BEFORE_DYING = 2000; //ms

export function paintObject(
    canvas: RoughCanvas,
    obj: PucasPelixObject,
    projector: Projector
) {
    const vertices = obj.getPoligon().map((v) => projector.project(v));
    const timeToDie = obj.getTimeToDie();
    let stroke = OBJECT_STROKE;
    let fill = obj.color;
    if (timeToDie < START_FADING_BEFORE_DYING) {
        const alpha = timeToDie / START_FADING_BEFORE_DYING;
        stroke = chroma(OBJECT_STROKE).alpha(alpha).hex();
        fill = chroma(fill).alpha(alpha).hex();
    }
    canvas.polygon(vertices, { ...OBJECT_OPTIONS, stroke, fill });
}
