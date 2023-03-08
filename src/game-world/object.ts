import { Point, Bounds, TWO_PI, Circle } from "@mathigon/euclid";
import { v4 as uuid } from "uuid";
import { range } from "../range";
import { collides } from "../utils/collides";
import { random, randomItem } from "../utils/random";

const MAX_ROTATION_SPEED = 0.5;
const MIN_SIDES = 3;
const MAX_SIDES = 8;
const MIN_SIZE = 50;
const MAX_SIZE = 120;
const palettes = [
    [
        "#ff6d00",
        "#ff7900",
        "#ff8500",
        "#ff9100",
        "#ff9e00",
        "#240046",
        "#3c096c",
        "#5a189a",
        "#7b2cbf",
        "#9d4edd",
    ],
    [
        "#f94144",
        "#f3722c",
        "#f8961e",
        "#f9844a",
        "#f9c74f",
        "#90be6d",
        "#43aa8b",
        "#4d908e",
        "#577590",
        "#277da1",
    ],
];

export class PucasPelixObject {
    id: string;
    position: Point;
    size: number;
    bounds: Bounds;
    /** From 0 to 1 */
    rotation: number;
    sides: number;
    /** Revolutions per second */
    rotationSpeed: number;
    color: string;

    constructor(position: Point) {
        this.id = uuid();
        this.position = position;
        this.size = random(MIN_SIZE, MAX_SIZE);
        this.rotation = random(0, 1);
        this.sides = Math.floor(random(MIN_SIDES, MAX_SIDES));
        this.rotationSpeed = random(-MAX_ROTATION_SPEED, MAX_ROTATION_SPEED);
        this.color = randomItem(palettes[1]);
        const upperLeft = this.position.shift(this.size / -2, this.size / -2);
        const lowerRight = this.position.shift(this.size / 2, this.size / 2);
        this.bounds = new Bounds(
            upperLeft.x,
            lowerRight.x,
            upperLeft.y,
            lowerRight.y
        );
    }

    update(elapsedTimeMs: number) {
        this.rotation += (this.rotationSpeed * elapsedTimeMs) / 1000;
    }

    getPoligon() {
        const circle = new Circle(this.position, this.size);
        return Array.from(range(0, this.sides)).map((vertexIndex) => {
            return circle.at(this.rotation + vertexIndex / this.sides);
        });
    }

    collidesWith(bounds: Bounds) {
        return collides(bounds, this.bounds);
    }
}
