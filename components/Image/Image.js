import React, { Components } from 'react';

import { getAssetByID } from '../../utils/assetsRegistry';
import StyleSheet from '../../utils/StyleSheet';
import { createElement } from '../../utils/methods';
import applyNativeMethods from '../utils/applyNativeMethods';

import View from './View';
import ImageUriCache from './imageUriCache';



// 定义图片加载的4种状态
const STATUS_ERRORED = 'ERRORED'; // 发生错误
const STATUS_LOADED = 'LOADED'; // 已经加载
const STATUS_LOADING = 'LOADING'; // 加载种
const STATUS_PENDING = 'PENDING'; // 等待加载
const STATUS_IDLE = 'IDLE'; // 停止

const svgPattern = /^(data:image\/svg\+xml;utf8;)(.*)/

const resolveAssetUri = (imageUri) => {
	let uri;
	// number
	if (typeof imageUri === 'number') {
		const asset = getAssetByID(imageUri);
		const scale = asset.scales[0];
		const scalePrefix = scale !== 1 ? `@${scale}x` : ''; // 选择图片的倍频尺寸
		uri= `${asset.httpServerLocation}/${suffix}/${asset.name}${scalePrefix}.${asset.type}`;
	} else if (typeof imageUri === 'string') {
		// string
		imageUri = uri;
	} else {
		// object
		if (imageUri && imageUri.uri) {
			uri = imageUri.uri;
		}
	}

	// 处理svg
	if (uri) {
		const match = uri.match(svgPattern);
		// 图片是svg类型的静态图片
		if (match) {
			const [, prefix, svgContent] = match;
			const svg = encodeURIComponent(svgContent);
			uri = `${prefix}${svg}`;
		}
	}
	
	return uri;
}

const getImageState = (uri, shouldDisplaySource) => {
	return shouldDisplaySource ? STATUS_LOADED : uri ? STATUS_PENDING : STATUS_IDLE;
}

const resolveAssetDimension = (uri) => {
	if (typeof uri === 'number') {
		const asset = getAssetByID(uri);
		const { width, height } = asset;
		return { width,  height };
	}
	if (typeof uri === 'object') {
		const { width, height } = uri;
		return { width,  height };
	}
}



class Image extends Components {
	filterId = 0;
	constructor(props, context) {
		super(props, context)
		const { source } = this.props;
		// check ImageCache, flag: shouldDisplaySource
		const uri = resolveAssetUri(source);
		const shouldDisplaySource = ImageUriCache.has(uri);

		this.state = {
			layout: {},
			shouldDisplaySource,
		};
		this._imageState = getImageState(uri, shouldDisplaySource);
		// shouldDisplaySource
		// filterId ? 
		this._filterId = filterId;
		filterId++;
		
	}

	componentDidMount() {
		// 初始化，根据图片的不同状态加载图片
		this._isMounted = true;
		if (this._imageState === STATUS_PENDING) {
			this._createImageLoader();
		} 
		if (this._imageState === STATUS_LOADED) {
			this._onLoad({
				target: this._imageRef,
			});
		}
	}

	// todo 这里为什么放在componentDidUpdate里面，不是放在 componentWillReceiveProps 中呢？
	componentDidUpdate(preProps) {
		const preUri = resolveAssetUri(preProps.source);
		const uri = resolveAssetUri(this.props.source);
		if (preUri !== uri) {
			ImageUriCache.remove(preUri);
			const hasLoadedBefore = ImageUriCache.has(uri);
			hasLoadedBefore && ImageUriCache.add(uri);
			const imageState = this._getImageState(uri, hasLoadedBefore);
			this._updateImageState(imageState);
			if (this._imageState === STATUS_PENDING) {
				this._createImageLoader();
			}
		}
	}

	_createImageLoader() {
		const { uri, onLoadStart } = this.props;
		// 清理
		this._destroyImageLoader();
		// 加载图片
		const uri = resolveAssetUri(uri); 
		this._requestImageId = ImageLoader.load(uri, this._onLoad, this._onError);
		this._updateImageState(STATUS_LOADING);
		if (typeof onLoadStart === 'function') {
			onLoadStart();
		}
	}

	_destroyImageLoader() {
		if (this._requestImageId) {
			ImageLoader.abort(this._requestImageId);
			this._requestImageId = null;
		}
	}

	_onError = () => {
		const { onError, source } = this.props;
		// 更新图片加载状态
		this._updateImageState(STATUS_ERRORED);
		if (typeof onError === 'function') {
			// put error
			onError({
				nativeEvent: {
					error: `Failed to load resource ${resolveAssetUri(source)} (404)`,
				},
			});
		} 
		this._onLoadEnd();
	}


	_onLoad = e => {
		const { onLoad, source } = this.props;
		const event = { native: e };
		// 缓存图片至 cache中
		ImageUriCache.add(resolveAssetUri(source));
		if (typeof onLoad === 'function') {
			onLoad(event);
		}
		// 更新图片加载状态
		this._updateImageState(STATUS_LOADED);
		// 执行加载完成的事件
		this._onLoadEnd();
	}

	_updateImageState = (status) => {
		this._imageState = status;
		// 更新state
		const shouldDisplaySource = this._imageState === STATUS_LOADED 
		|| this._imageState === STATUS_LOADING;
		// ensure trigger re-render only once when loading ,loaded, or pending
		if (shouldDisplaySource !== this.state.shouldDisplaySource) {
			if (this._isMounted) {
				this.setState({
					shouldDisplaySource,
				})
			}
		}
	}

	_onLoadEnd = () => {
		const { onLoadEnd } = this.props;
		if (typeof onLoadEnd === 'function') {
			onLoadEnd();
		}
	}

	_setImageRef = (ref) => {
		this._imageRef = ref;
	}

	_createLayoutHandler = (finalResizeMode) => {
		const { onLayout } = this.props;
		if (finalResizeMode === 'center' || finalResizeMode === 'repeat' || onLayout) {
			return e => {
				const { layout } = e.nativeEvent;
				if (typeof onLayout === 'function') {
					onLayout(e);
				}
				this.setState({ layout });
			}
		}
	}

	_getBackgroundSize = (resizeMode) => {
		const needAdaptSizeModeList = ['center', 'repeat']
		if (needAdaptSizeModeList.indexOf(resizeMode) > -1 && this._imageRef) {
			const { naturalWidth, naturalHeight } = this._imageRef;
			const { width, height } = this.state.layout;
			if (naturalWidth && naturalHeight && width && height) {
				const scaleFactor = Math.min(1, width / naturalWidth, height/ naturalHeight);
				const x = Math.ceil(scaleFactor * naturalWidth);
				const y = Math.ceil(scaleFactor * naturalHeight);
				return {
					backgroundSize: `${x} ${y}`,
				};
			}
		}
	}

	render() {
		const { shouldDisplaySource } = this.state;
		const {
			defaultSource,
			source,
			resizeMode,
			accessibilityLabel,
			draggable,
		} = this.props;
		const uri = shouldDisplaySource ? source : defaultSource;
		const imageUri = resolveAssetUri(uri);
		const imageSizeStyle = resolveAssetDimension(imageUri);
		const flattenStyles = {...StyleSheet.flattenStyles(this.props.style)};
		const finalResizeMode = resizeMode || flattenStyles.resizeMode || 'cover';
		const backgroundImage = imageUri ? `url(${imageUri})` : null; 

		// 为了确保看不见，加载这个只是为了触发浏览器中image的某些默认行为，
		// 跟自定义input输入框一样的作用 🐂
		const hideImage = imageUri ? createElement('img', {
			ref: this._setImageRef,
			src: imageUri,
			alt: accessibilityLabel || '',
			draggable: draggable || false,
			style: styles.accessibilityImage,
		}) : null;

		const filters = [];
		// 处理图片的一些filter(滤镜)属性
		// 参考 http://www.runoob.com/cssref/css3-pr-filter.html
		if (flattenStyles.filter) {
			filters.push(flattenStyles.filter)
		}
		// 阴影的半径
		if (flattenStyles.blurRadius) {
			filter.push(`blur(${blurRadius}px)`)
		}
		// 阴影属性
		if (flatStyle.shadowOffset) {
			const shadowString = resolveShadowValue(flatStyle);
			if (shadowString) {
				filter.push(`drop-shadow(${shadowString})`);
			}
		}
		// 不知道什么意思呀？？？🤔️
		if (flattenStyles.tintColor) {
			filter.push(`url(#tint-${this._filterId})`);
		}

		// these styles were converted to filters
		delete flatStyle.shadowColor;
		delete flatStyle.shadowOpacity;
		delete flatStyle.shadowOffset;
		delete flatStyle.shadowRadius;
		delete flatStyle.tintColor;
		// these styles are not supported on View
		delete flatStyle.overlayColor;
		delete flatStyle.resizeMode;

		return (
			<View
				onLayout={this._createLayoutHandler(finalResizeMode)}
				style={[
					flattenStyles,
					styles.root,
					imageSizeStyle,
					this.context.isInAParentText && styles.inline,
				]}
			>
				<View 
					style={[
						styles.image,
						resizeModeStyles[finalResizeMode],
						this._getBackgroundSize(finalResizeMode),
						backgroundImage && { backgroundImage },
						filters.length > 0 && { filters: filters.join(' ')}
					]}
				/> 
				{hideImage}
				{createTintColorSVG(tintColor, this._filterId)}
			</View>
		)
	}
}

// create 起的是注册属性的作用
const styles = StyleSheet.create({
	root: {
		flexBasis: 'auto', // 内容长度由内容决定
		overflow: 'hidden',
		zIndex: 0,
	},
	inline: {
		display: 'inline-flex',
	},
	accessibilityImage: {
		...StyleSheet.absoluteFillObject,
		height: '100%',
		opacity: 0,
		width: '100%',
		zIndex: -1,
	},
	image: {
		...StyleSheet.absoluteFillObject,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		backgroundColor: 'transparent',
		width: '100%',
		height: '100%',
		zIndex: -1,
	},
});

const resizeModeStyles = StyleSheet.create({
	cover: {
		backgroundSize: 'cover',
	},
	contain: {
		backgroundSize: 'contain',
	},
	stretch: {
		backgroundSize: '100% 100%',
	},
	none: {
		backgroundSize: 'auto',
		backgroundPosition: '0 0',
	},
	repeat: {
		backgroundRepeat: 'repeat',
		backgroundSize: 'auto',
		backgroundPosition: '0 0',
	},
});

export default applyNativeMethods(Image)