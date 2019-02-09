/**
一个ImageLoader 加载对象
具有getSize, load, abort, prefetch 方法
**/

let id = 0; // 请求加载图片的编号
let requests = {}; // 请求完图片以后的缓存对象

const ImageLoader = {
	// 获取图片的真实宽、高
	getSize(uri, success, fail) {
		// 图片是否已经加载完成的标志
		let completeFlag = false;
		let count = 0; // 为了避免轮询的栈溢出
		const requestId = ImageLoader.load(uri, callBack, errorCallBack);
		// 等待图片加载完成，通过轮询去判断
		const interval = setInterval(callBack, 16); // 为啥是16？ ，轮询的间隔
		function callBack() {
			count++;
			const image = requests[`${requestId}`];
			if (image) {
				// naturalWidth, naturalHeight 是图片的真实宽高属性
				// 支持性非常好： https://caniuse.com/#search=naturalWidth
				const { naturalWidth, naturalHeight } = image;
				if (naturalWidth && naturalHeight) {
					success(naturalWidth, naturalHeight);
				}
				completeFlag = true;
			}
			if (completeFlag || count > 10) {
				// 清理
				ImageLoader.abort(requestId);
				clearInterval(interval);
			}
		}
		function errorCallBack (e) {
			if (typeof fail === 'function') {
				fail(e);
			}
			// 清理
			ImageLoader.abort(requestId);
			clearInterval(interval);
		}
	},
	// 加载图片
	load(uri, onLoad, onError) {
		id++;
		// 利用Image对象的自身方式去加载图片
		const image = new Window.Image();
		image.onerror = onError;
		image.onload = e => {
			// image.decode 存在兼容性的问题
			if (typeof image.decode === 'function') {
				image.decode().then(() => {
					onLoad(e);
				}).catch((e) => {
					onError(e);
				})
			} else {
				setTimeout(() => {
					onLoad(e);
				}, 0)
			}
		}
		requests[`${id}`] = image;
		image.src = uri;
		return id;
	},
	// 取消加载图片 
	abort(requestId) {
		const image = requests[`${requestId}`];
		if (image) {
			image.onload = image.onerror = image = null;
		}
		delete requests[`${requestId}`];
	},
	// 预加载图片
	prefetch(uri) {
		return new Promise((resolve, reject) => {
			ImageLoader.load(uri, resolve, reject);
		});
	},
};

export default ImageLoader;