import { v4 as uuid } from "uuid";
import { Bounds } from "@mathigon/euclid";
import { Pose } from "@tensorflow-models/pose-detection";
import { MIN_POSE_SCORE_COLLISIONS } from "../constants";

export enum PlayerType {
    PUCAS,
    PELIX,
    PAPIP,
    PAMIP,
}

const COLLIDABLE_BBOX_SIZE = 10;
const HAPPY_AFTER_DESTROYING = 1000;

export class PucasPelixPlayer {
    id: string;
    pose: Pose | null = null;
    type: PlayerType;
    destroyedObjects: DestroyedObject[] = [];
    currentTime: number | null;

    constructor(index: number) {
        this.id = uuid();
        this.currentTime = null;
        if (index % 4 === 0) {
            this.type = PlayerType.PUCAS;
        }
        if (index % 4 === 1) {
            this.type = PlayerType.PELIX;
        }
        if (index % 4 === 2) {
            this.type = PlayerType.PAPIP;
        } else {
            this.type = PlayerType.PAMIP;
        }
    }

    updateWithPose(pose: Pose, currentTime: number) {
        this.pose = pose || null;
        this.currentTime = currentTime;
    }

    getCollidableBounds() {
        if (!this.pose) {
            return [];
        }
        const collidableKeypointKeys = [
            "left_wrist",
            "right_wrist",
            "right_ankle",
            "left_ankle",
        ];
        const keypoints = this.pose.keypoints.filter(
            (keypoint) =>
                (keypoint.score || 0) >= MIN_POSE_SCORE_COLLISIONS &&
                collidableKeypointKeys.includes(keypoint.name || "")
        );
        return keypoints.map(
            (keypoint) =>
                new Bounds(
                    keypoint.x - COLLIDABLE_BBOX_SIZE / 2,
                    keypoint.x + COLLIDABLE_BBOX_SIZE / 2,
                    keypoint.y - COLLIDABLE_BBOX_SIZE / 2,
                    keypoint.y + COLLIDABLE_BBOX_SIZE / 2
                )
        );
    }

    notifyObjectDestroyed(obj: DestroyedObject) {
        console.log("notifyObjectDestroyed", obj);
        this.destroyedObjects.push(obj);
    }

    isHappy() {
        console.log("isHappy");
        if (!this.destroyedObjects.length || !this.currentTime) {
            return;
        }
        const lastDestroyed =
            this.destroyedObjects[this.destroyedObjects.length - 1];
        const timeSinceDestruction = this.currentTime - lastDestroyed.when;
        console.log(timeSinceDestruction);
        return timeSinceDestruction < HAPPY_AFTER_DESTROYING;
    }

    getHappyColor() {
        switch (this.type) {
            case PlayerType.PUCAS:
                return "#3a86ff";
            case PlayerType.PELIX:
                return "#8338ec";
            case PlayerType.PAPIP:
                return "#ff006e";
            default:
                return "#fb5607";
        }
    }
}
