const homeCache = new Map();

export function getHomePageFromCache(key: string): any {
  const cached = homeCache.get(key);
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return cached.data;
  }
  return null;
}

export function setHomePageToCache(key: string, data: any): void {
  homeCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearHomePageCache(): void {
  homeCache.clear();
}
