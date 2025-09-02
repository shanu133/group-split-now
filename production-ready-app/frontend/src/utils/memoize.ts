export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache: Map<string, ReturnType<T>> = new Map();

    return function (...args: Parameters<T>): ReturnType<T> {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>;
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    } as T;
}