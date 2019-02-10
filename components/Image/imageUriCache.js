
const dataPattern = /^data:/;
export default class ImageUriCache  {
    static _entries = {}; // 内部缓存图片 
    static _maximumEntries = 256;

    static has(uri) {
        const isData = uri.test(dataPattern);
        return isData || Boolean(ImageUriCache._entries[uri]);
    }
    // refCount, lastUsedTimestamp
    static add(uri) {
        const lastUsedTimestamp = Date.now();
        const entries = ImageUriCache._entries; // 引用传值
        const refCount = entries[uri] ? (entries[uri].refCount + 1) : 1;
        entries[uri] = {
            lastUsedTimestamp, // 用于标记最近使用的变量的时间，用于垃圾回收清理
            refCount, // 用于标记变量使用的次数，当为0 的时候，则可以去清除
        };
    }
    static remove(uri) {
        const entries = ImageUriCache._entries;
        if (entries[uri]) {
            entries[uri].refCount -= 1;
        }
        ImageUriCache._clearIfNeeded();
    }
    static _clearIfNeeded() {
        const entries = ImageUriCache._entries;
        const len = Object.keys(entries).length;
        if ( len + 1 > ImageUriCache._maximumEntries) {
            // 清理的原则: 当前的缓存数量已经达到最大值
            // 清理掉：最近使用时间最小（即：最后一次使用的时间最早的）&& refCount = 0的
            let leastUsedUri;
            let leastUsedEntry;
            Object.keys(entries).forEach((uri) => {
                if ((!leastUsedEntry || entries[uri] < leastUsedEntry.lastUsedTimestamp) 
                && entries[uri].refCount === 0) {
                    leastUsedUri = uri;
                    leastUsedEntry = entries[uri];
                }
            });
            if (leastUsedUri) {
                delete entries[leastUsedUri];
            }
        }
    }
}