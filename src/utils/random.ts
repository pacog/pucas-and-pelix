export function random(min = 0, max = 1) {
    return min + Math.random() * (max - min);
}

export function randomItem<T>(array: T[]): T {
    const index = Math.floor(random(0, array.length));
    return array[index];
}
