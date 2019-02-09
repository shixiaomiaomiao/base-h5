import { findDOMNode } from 'react-dom';
import UIManager from './UIManager'; // UIManager？模拟原生的UI管理模块

/**
 * 给web component 注入native 中通用的一些方法
 * **/

const NativeMethods = {
    blur() {
        UIManager.blur(findDOMNode(this));
    },
    focus() {
        UIManager.focus(findDOMNode(this));
    },
    setNativeProps(nativeProps) {
        if (!nativeProps) {
            return;
        }
        const domProps = createDOMProps(null, nativeProps, style => {

        });
        const node = findDOMNode(this);
        UIManager.updateView(node, domProps, this)
    },
    measure(callback) {
        UIManager.measure(findDOMNode(this), callback);
    },
    measureInWindow(callback) {
        UIManager.measureInWindow(findDOMNode(this), callback);
    },
    measureLayout(callback) {
        UIManager.measureLayout(findDOMNode(this), callback);
    },
}

export default NativeMethods;