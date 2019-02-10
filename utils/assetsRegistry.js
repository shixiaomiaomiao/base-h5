
const assets = [];


/**
 * asset: {
 * width,
 * height,
 * scales: [],
 * type,
 * httpServerLocation, // 远程图片的地址
 * fileSystemLocation, // 静态图片的地址
 * name,
 * hash,
 * __packager_asset,
 * }
 * **/
export const registryAsset = (asset) => {
    return assets.push(asset)
};
export const getAssetByID = (id) => {
    return assets[ id - 1];
};