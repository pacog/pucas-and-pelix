import { Pose } from "@tensorflow-models/pose-detection";

export enum PlayerType {
    PUCAS,
    PELIX,
}

export class PucasPelixPlayer {
    pose: Pose | null = null;
    type: PlayerType;

    constructor(index: number) {
        if (index % 2 === 1) {
            this.type = PlayerType.PELIX;
        } else {
            this.type = PlayerType.PUCAS;
        }
    }

    updateWithPose(pose: Pose) {
        this.pose = pose || null;
    }
}
