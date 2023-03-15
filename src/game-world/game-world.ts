import { v4 as uuid } from "uuid";
import { Pose } from "@tensorflow-models/pose-detection";
import { Point } from "@mathigon/euclid";
import { MAX_POSES } from "../constants";
import { PucasPelixPlayer } from "./player";
import { PucasPelixObject } from "./object";
import { range } from "../range";
import { random } from "../utils/random";

const OBJECTS_NEXT_LEVEL = [5, 10, 15, 20, 25];

interface GameWorldOptions {
    maxPlayers: number;
    size: {
        width: number;
        height: number;
    };
    onObjectDestroyed: (obj: DestroyedObject) => void;
    onObjectDiedNaturally: (obj: PucasPelixObject) => void;
    onObjectCreated: (obj: PucasPelixObject) => void;
}

const CREATE_OBJECT_EVERY = 3_000; // ms

export class GameWorld {
    options: GameWorldOptions;
    players: PucasPelixPlayer[];
    objects: PucasPelixObject[];
    destroyedObjects: DestroyedObject[];
    lastUpdate = 0;

    constructor(options: GameWorldOptions) {
        this.options = options;
        this.players = Array.from(range(0, options.maxPlayers)).map(
            (index) => new PucasPelixPlayer(index)
        );
        this.objects = [];
        this.destroyedObjects = [];
    }

    update(currentTime: number, currentPoses: Pose[]) {
        if (!this.lastUpdate) {
            this.lastUpdate = currentTime;
        }
        const elapsedTime = currentTime - this.lastUpdate;
        for (const i of range(0, MAX_POSES)) {
            this.players[i].updateWithPose(currentPoses[i], currentTime);
        }
        this.objects.forEach((obj) => obj.update(elapsedTime));

        this.deleteOldObjects();
        this.maybeAddObject(elapsedTime);

        this.checkCollisions(currentTime);

        this.lastUpdate = currentTime;
    }

    private deleteOldObjects() {
        const remainingObjects: PucasPelixObject[] = [];
        const deletedObjects: PucasPelixObject[] = [];
        for (const obj of this.objects) {
            if (obj.isTooOld()) {
                deletedObjects.push(obj);
            } else {
                remainingObjects.push(obj);
            }
        }
        this.objects = remainingObjects;
        deletedObjects.forEach((obj) =>
            this.options.onObjectDiedNaturally(obj)
        );
    }

    private maybeAddObject(elapsedTime: number) {
        if (this.objects.length >= this.getMaxObjects()) {
            return;
        }
        const addObjectEvery = CREATE_OBJECT_EVERY; // ms
        const chance = elapsedTime / addObjectEvery;
        if (Math.random() > chance) {
            return;
        }

        const marginRatio = 0.1; // Percentage of the screen we leave as margin
        const position = new Point(
            random(
                marginRatio * this.options.size.width,
                (1 - marginRatio) * this.options.size.width
            ),
            random(
                marginRatio * this.options.size.height,
                (1 - marginRatio) * this.options.size.height
            )
        );
        const newObj = new PucasPelixObject(
            position,
            this.getRandomObjectSpeed(),
            this.options.size
        );
        this.objects.push(newObj);
        this.options.onObjectCreated(newObj);
    }

    private getMaxObjects() {
        if (this.destroyedObjects.length < OBJECTS_NEXT_LEVEL[0]) {
            return 1;
        }
        if (this.destroyedObjects.length < OBJECTS_NEXT_LEVEL[4]) {
            return 2;
        }
        return 3;
    }

    private getRandomObjectSpeed() {
        if (this.destroyedObjects.length < OBJECTS_NEXT_LEVEL[2]) {
            return 0;
        }
        if (this.destroyedObjects.length < OBJECTS_NEXT_LEVEL[3]) {
            return random(1, 2);
        }
        return random(2, 4);
    }

    private checkCollisions(currentTime: number) {
        const objects = this.objects;

        for (const player of this.players) {
            const bounds = player.getCollidableBounds();
            for (const bound of bounds) {
                for (const obj of objects) {
                    if (obj.collidesWith(bound)) {
                        this.notifyCollision(player, obj, currentTime);
                    }
                }
            }
        }
    }

    private notifyCollision(
        player: PucasPelixPlayer,
        object: PucasPelixObject,
        when: number
    ) {
        this.objects = this.objects.filter((o) => o.id !== object.id);
        const detroyedObject = {
            id: uuid(),
            player,
            object,
            when,
        };
        this.destroyedObjects.push(detroyedObject);
        player.notifyObjectDestroyed(detroyedObject);
        this.options.onObjectDestroyed(detroyedObject);
    }
}
