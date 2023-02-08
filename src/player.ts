import { Pose } from "@tensorflow-models/pose-detection";

export class PucasPelixPlayer {
    pose: Pose | null = null;

    updateWithPose(pose: Pose) {
        this.pose = pose || null;
    }
}
