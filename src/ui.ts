let toggle: HTMLButtonElement;

export function initUI(onTogglePoseDetectionType: () => void) {
    toggle = document.getElementById(
        "pose-detection-type"
    ) as HTMLButtonElement;
    if (!toggle) {
        throw new Error("Toggle button not found");
    }
    toggle.addEventListener("click", onTogglePoseDetectionType);
}

export function updateTogglePoseDetectionType(name: string) {
    toggle.innerHTML = name;
}
