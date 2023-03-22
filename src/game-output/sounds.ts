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
    "./sounds/appear_1.mp3",
    "./sounds/appear_2.mp3",
    "./sounds/appear_3.mp3",
]);

const destroyedSounds = new SoundSet([
    "./sounds/destroy_1.mp3",
    "./sounds/destroy_2.mp3",
]);

const playerHappySounds = new SoundSet([
    "./sounds/yeah_1.mp3",
    "./sounds/yeah_2.mp3",
    "./sounds/yeah_3.mp3",
    "./sounds/yeah_4.mp3",
    "./sounds/yeah_5.mp3",
]);

const dieNaturallySounds = new SoundSet(["./sounds/destroy_1.mp3"]);

export function playObjectDestroyed() {
    destroyedSounds.playRandom();
}

export function playObjectAppeared() {
    appearSounds.playRandom();
}

export function playObjectDiedNaturally() {
    dieNaturallySounds.playRandom();
}

export function playPlayerHappy() {
    setTimeout(() => {
        playerHappySounds.playRandom();
    }, 500);
}

export function setMute(shouldMute: boolean) {
    Howler.mute(shouldMute);
}
