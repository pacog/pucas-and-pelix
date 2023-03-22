import { getBoolean, setBoolean } from "../utils/localStorage";

const IS_SOUND_ON = "isSoundOn";
const SOUND_ON_CLASS = "ui-sound-on";
const MENU_SHOWN_CLASS = "ui-menu-shown";

interface PucasPelixUIOptions {
    onSoundChange: (isSoundOn: boolean) => void;
    onMenuChange: (isMenuShown: boolean) => void;
}

// NOTE: no events listener are removed since this object will tsay alive for the duration of the page

export class PucasPelixUI {
    soundButton!: HTMLElement;
    menuButton!: HTMLElement;
    menu!: HTMLElement;
    isSoundOn!: boolean;
    isMenuShown!: boolean;
    options: PucasPelixUIOptions;

    constructor(options: PucasPelixUIOptions) {
        this.options = options;
        this.initSound();
        this.initMenu();
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

    initMenu() {
        const menuButton = document.getElementById("ui-menu-button");
        const menu = document.getElementById("ui-menu");
        if (!menuButton || !menu) {
            throw new Error("Couldn't find menu button or menu");
        }
        this.menuButton = menuButton;
        this.menu = menu;
        this.isMenuShown = false;
        this.menuButton.addEventListener("click", () => this.toggleMenu());
        document.addEventListener("keydown", (evt) => {
            if (evt.key === "Escape") {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        this.isMenuShown = !this.isMenuShown;
        this.updateMenuUI();
    }

    updateMenuUI() {
        const { classList } = this.menu;
        if (this.isMenuShown && !classList.contains(MENU_SHOWN_CLASS)) {
            classList.add(MENU_SHOWN_CLASS);
        }
        if (!this.isMenuShown && classList.contains(MENU_SHOWN_CLASS)) {
            classList.remove(MENU_SHOWN_CLASS);
        }
        this.options.onMenuChange(this.isMenuShown);
    }
}
