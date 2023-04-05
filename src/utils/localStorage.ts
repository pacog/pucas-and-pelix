export function set(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn(e);
    }
}

export function setBoolean(key: string, value: boolean) {
    set(key, `${value}`);
}

export function getString(key: string) {
    let result = undefined;
    try {
        result = localStorage.getItem(key);
    } catch (e) {
        console.warn(e);
    }
    return result;
}

export function getBoolean(key: string, defaultValue = true) {
    const localStorageString = getString(key);
    if (
        typeof localStorageString === "undefined" ||
        localStorageString === null
    ) {
        return defaultValue;
    }
    return localStorageString === "true";
}
