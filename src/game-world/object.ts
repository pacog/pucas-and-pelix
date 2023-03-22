import { Point, Bounds, Circle, TWO_PI } from "@mathigon/euclid";
import { v4 as uuid } from "uuid";
import { range } from "../range";
import { collides } from "../utils/collides";
import { random, randomItem } from "../utils/random";

const MAX_OBJECT_AGE = 10_000; // ms
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
    age: number;
    position: Point;
    size: number;
    /** From 0 to 1 */
    rotation: number;
    sides: number;
    /** Revolutions per second */
    rotationSpeed: number;
    color: string;
    direction: number; // In radians
    speed: number;
    screenBounds: Bounds;

    constructor(
        position: Point,
        speed: number,
        screenSize: { height: number; width: number }
    ) {
        this.id = uuid();
        this.age = 0;
        this.position = position;
        this.size = random(MIN_SIZE, MAX_SIZE);
        this.rotation = random(0, 1);
        this.sides = Math.floor(random(MIN_SIDES, MAX_SIDES));
        this.rotationSpeed = random(-MAX_ROTATION_SPEED, MAX_ROTATION_SPEED);
        this.color = randomItem(palettes[1]);
        this.direction = random(0, TWO_PI);
        this.speed = speed;
        this.screenBounds = new Bounds(
            0,
            screenSize.width,
            0,
            screenSize.height
        );
    }

    update(elapsedTimeMs: number) {
        this.age += elapsedTimeMs;
        this.rotation += (this.rotationSpeed * elapsedTimeMs) / 1000;
        const addedPosition = new Point(
            Math.cos(this.direction) * this.speed,
            Math.sin(this.direction) * this.speed
        );
        this.position = this.position.add(addedPosition);
        if (!this.screenBounds.contains(this.position)) {
            this.direction += Math.PI;
        }
    }

    getPoligon() {
        const circle = new Circle(this.position, this.size);
        return Array.from(range(0, this.sides)).map((vertexIndex) => {
            return circle.at(this.rotation + vertexIndex / this.sides);
        });
    }

    collidesWith(bounds: Bounds) {
        const upperLeft = this.position.shift(this.size / -2, this.size / -2);
        const lowerRight = this.position.shift(this.size / 2, this.size / 2);
        const objBounds = new Bounds(
            upperLeft.x,
            lowerRight.x,
            upperLeft.y,
            lowerRight.y
        );
        return collides(bounds, objBounds);
    }

    isTooOld() {
        return this.age >= MAX_OBJECT_AGE;
    }

    getTimeToDie() {
        return Math.max(MAX_OBJECT_AGE - this.age, 0);
    }
}
