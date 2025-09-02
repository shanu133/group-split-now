import { RedisClient } from 'redis';
import { promisify } from 'util';

const redisClient = new RedisClient({ host: 'localhost', port: 6379 });
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

export const cacheData = async (key: string, value: string, expiration: number) => {
    await setAsync(key, value, 'EX', expiration);
};

export const getCachedData = async (key: string) => {
    const data = await getAsync(key);
    return data ? JSON.parse(data) : null;
};

export const clearCache = (key: string) => {
    redisClient.del(key);
};