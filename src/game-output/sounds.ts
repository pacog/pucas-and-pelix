import { Howl } from "howler";
import { randomItem } from "../utils/random";

const appearFiles = [
    "/sounds/appear_1.mp3",
    "/sounds/appear_2.mp3",
    "/sounds/appear_3.mp3",
    "/sounds/appear_4.mp3",
];
const destroyedFiles = [
    "/sounds/destroyed_1.mp3",
    "/sounds/destroyed_2.mp3",
    "/sounds/destroyed_3.mp3",
    "/sounds/destroyed_4.mp3",
    "/sounds/destroyed_5.mp3",
];

destroyedFiles.forEach((file) => {
    const sound = new Howl({
        src: [file],
    });
    sound.once("load", () => {
        objectDestroyedSounds.push(sound);
    });
});

appearFiles.forEach((file) => {
    const sound = new Howl({
        src: [file],
    });
    sound.once("load", () => {
        appearSounds.push(sound);
    });
});

const objectDestroyedSounds: Howl[] = [];
const appearSounds: Howl[] = [];

export function playObjectDestroyed() {
    if (objectDestroyedSounds?.length) {
        randomItem(objectDestroyedSounds).play();
    }
}

export function playObjectAppeared() {
    if (appearSounds?.length) {
        randomItem(appearSounds).play();
    }
}
