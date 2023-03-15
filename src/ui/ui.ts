import { getBoolean, setBoolean } from "../utils/localStorage";

const IS_SOUND_ON = "isSoundOn";
const SOUND_ON_CLASS = "ui-sound-on";

interface PucasPelixUIOptions {
    onSoundChange: (isSoundOn: boolean) => void;
}

export class PucasPelixUI {
    soundButton!: HTMLElement;
    isSoundOn!: boolean;
    options: PucasPelixUIOptions;

    constructor(options: PucasPelixUIOptions) {
        this.options = options;
        this.initSound();
    }

    initSound() {
        const soundButton = document.getElementById("ui-sound");
        if (!soundButton) {
            throw new Error("Couldn't find sound button");
        }
        this.soundButton = soundButton;
        this.isSoundOn = getBoolean(IS_SOUND_ON);
        this.updateSoundUI();
        this.soundButton.addEventListener("click", () => {
            this.isSoundOn = !this.isSoundOn;
            setBoolean(IS_SOUND_ON, this.isSoundOn);
            this.updateSoundUI();
        });
    }

    updateSoundUI() {
        const { classList } = this.soundButton;
        if (this.isSoundOn && !classList.contains(SOUND_ON_CLASS)) {
            classList.add(SOUND_ON_CLASS);
        }
        if (!this.isSoundOn && classList.contains(SOUND_ON_CLASS)) {
            classList.remove(SOUND_ON_CLASS);
        }
        this.options.onSoundChange(this.isSoundOn);
    }
}
