import { v4 as uuid } from "uuid";
import { Pose } from "@tensorflow-models/pose-detection";
import { Point } from "@mathigon/euclid";
import { MAX_POSES } from "../constants";
import { PucasPelixPlayer } from "./player";
import { PucasPelixObject } from "./object";
import { range } from "../range";
import { random } from "../utils/random";

interface GameWorldOptions {
    maxPlayers: number;
    size: {
        width: number;
        height: number;
    };
}

interface DestroyedObject {
    id: string;
    when: number; // milliseconds from world start
    object: PucasPelixObject;
    player: PucasPelixPlayer;
}

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
        for (const i of range(0, MAX_POSES)) {
            this.players[i].updateWithPose(currentPoses[i]);
        }

        if (!this.objects.length) {
            this.maybeAddObject(currentTime - this.lastUpdate);
        }

        this.checkCollisions(currentTime);

        this.lastUpdate = currentTime;
    }

    private maybeAddObject(elapsedTime: number) {
        const addObjectEvery = 3_000; // ms
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
        const newObj = new PucasPelixObject(position);
        this.objects.push(newObj);
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
        this.destroyedObjects.push({
            id: uuid(),
            player,
            object,
            when,
        });
    }
}
