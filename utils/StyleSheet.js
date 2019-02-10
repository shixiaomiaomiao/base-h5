import ReactNativePropRegistry from './ReactNativePropRegistry';
import unitlessNumbers from '../const/unitlessNumbers';
import normalizeColorFunc from 'normalize-css-color';

// todo ?? 不是很明白，怎么处理色值 
const processColor = (color) => {
  if (color === undefined || color === null) {
    return color;
  }

  // convert number and hex
  let int32Color = normalizeColorFunc(color);
  if (int32Color === undefined || int32Color === null) {
    return undefined;
  }

  int32Color = ((int32Color << 24) | (int32Color >>> 8)) >>> 0;

  return int32Color;
};

const defaultStyle = { width: 0, height: 0 };
const windowWidth = window.innerWidth;
const n = 375 / windowWidth ;

const normalizeValue = (property, value) => {
    if (!unitlessNumbers(property) && typeof value ==='number') {
        value = (( value * 2 ) / 75) * n + 'rem';
    }
    return value;
}

const isWebColor = (color) => {
    return color === 'currentcolor' ||
    color === 'currentColor' ||
    color === 'inherit' ||
    color.indexOf('var(') === 0;
}

const normalizeColor = (color) => {
    if (color === null) return;
    if (typeof color === 'string' && isWebColor(color)) {
        return color;
    }
    const colorInt = processColor(color);
    const r = (colorInt >> 16) & 255;
    const g = (colorInt >> 8) & 255;
    const b = colorInt & 255;
    const a = ((colorInt >> 24) & 255) / 255; // todo ??  为什么是24 呢？
    const alpha = (a * opacity).toFixed(2);
    return `rgba(${r},${g},${b},${alpha})`;
}

export const resolveShadowValue = (style) => {
    const { width, height, shadowRadius, shadowColor, shadowOpacity } = style || defaultStyle;
    const offsetX = normalizeValue(null, width);
    const offsetY = normalizeValue(null, height);
    const blurRadius = normalizeValue(null, shadowRadius || 0);
    const color = normalizeColor(shadowColor || 'dark', shadowOpacity);
    if (color) {
        return `${offsetX} ${offsetY} ${blurRadius} ${color}`;
    }
}


// 垂直，水平居中
const absoluteFillObject = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};


// 注册的id 
const absoluteFill = ReactNativePropRegistry.registry(absoluteFillObject);

const getStyle = (style) => {
    if (typeof style === 'number') {
        return ReactNativePropRegistry.getByID(style);
    }
    return style;
};


const flatten = (style) => {
    if (!style) {
        return undefined;
    }
    if (!Array.isArray(style)) {
        return getStyle(style);
    }
    const len = style.length;
    let result = {};
    for(let i = 0 ; i < len; i++) {
        const computedStyle = flatten(style[i]);
        if (computedStyle) {
            result = {
                ...result,
                ...computedStyle,
            };
        }

    }
    return result;

}


const StyleSheet = {
    absoluteFill,
    absoluteFillObject,
    flatten,
    create(styles) {
        let result = {};
        Object.keys(styles).forEach((key) => {
            const id = styles[key] && ReactNativePropRegistry.registry(styleItem);
            result[key] = id;
        });
        return result;
    },
};

export default StyleSheet;