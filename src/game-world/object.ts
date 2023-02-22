import { Point, Bounds } from "@mathigon/euclid";
import { v4 as uuid } from "uuid";
import { collides } from "../utils/collides";

export class PucasPelixObject {
    id: string;
    position: Point;
    size: number;
    bounds: Bounds;

    constructor(position: Point) {
        this.id = uuid();
        this.position = position;
        this.size = 100;
        const upperLeft = this.position.shift(this.size / -2, this.size / -2);
        const lowerRight = this.position.shift(this.size / 2, this.size / 2);
        this.bounds = new Bounds(
            upperLeft.x,
            lowerRight.x,
            upperLeft.y,
            lowerRight.y
        );
    }

    collidesWith(bounds: Bounds) {
        return collides(bounds, this.bounds);
    }
}
