import { v4 as uuid } from "uuid";
import { Bounds } from "@mathigon/euclid";
import { Pose } from "@tensorflow-models/pose-detection";
import { MIN_POSE_SCORE_COLLISIONS } from "../constants";

export enum PlayerType {
    PUCAS,
    PELIX,
}

const COLLIDABLE_BBOX_SIZE = 10;

export class PucasPelixPlayer {
    id: string;
    pose: Pose | null = null;
    type: PlayerType;

    constructor(index: number) {
        this.id = uuid();
        if (index % 2 === 1) {
            this.type = PlayerType.PELIX;
        } else {
            this.type = PlayerType.PUCAS;
        }
    }

    updateWithPose(pose: Pose) {
        this.pose = pose || null;
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
}
