import { Howl } from "howler";
import { randomItem } from "../utils/random";

class SoundSet {
    sounds: Howl[] = [];

    constructor(urlList: string[]) {
        urlList.forEach((file) => {
            const sound = new Howl({
                src: [file],
            });
            sound.once("load", () => {
                this.sounds.push(sound);
            });
        });
    }

    playRandom() {
        if (this.sounds?.length) {
            randomItem(this.sounds).play();
        }
    }
}

const appearSounds = new SoundSet([
    "/sounds/appear_1.mp3",
    "/sounds/appear_2.mp3",
    "/sounds/appear_3.mp3",
    "/sounds/appear_4.mp3",
]);

const destroyedSounds = new SoundSet([
    "/sounds/destroyed_1.mp3",
    "/sounds/destroyed_2.mp3",
    "/sounds/destroyed_3.mp3",
    "/sounds/destroyed_4.mp3",
    "/sounds/destroyed_5.mp3",
]);

const dieNaturallySounds = new SoundSet(["/sounds/destroyed_1.mp3"]);

export function playObjectDestroyed() {
    destroyedSounds.playRandom();
}

export function playObjectAppeared() {
    appearSounds.playRandom();
}

export function playObjectDiedNaturally() {
    dieNaturallySounds.playRandom();
}
