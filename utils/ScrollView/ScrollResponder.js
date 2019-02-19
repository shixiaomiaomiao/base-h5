
const IS_ANIMATING_TOUCH_START_THRESHOLD_MS = 16;
const ScrollResponderMixin = {
    // 设置初始的一些标志信息
    scrollResponderMixinGetInitialState() {
        return {
            isTouching: false, // 是否正在touching 
            lastMomentumBeginTime: 0,  // 上一个时刻的开始时间
            lastMomentumEndTime: 0, // 上一个时刻的结束时间
            // Determine if the scroll view has been scrolled and therefore should
            // refuse to give up to its responder lock
            observedScrollSinceBecomingResponder: false, // 变成响应者以后观察滚动
            // Determine if releasing should dismiss the keyboard when we 
            // are in tap-to-dismiss mode 
            becomingResponderWhileAnimating: false,  // 当移动的时候变成响应者
        }
    },
    // 处理滚动是否应该设置响应者(是否正在touching)
    scrollResponderHandleScrollShouldSetResponder() {
        return this.state.isTouching; // 根据是否在touch
    },
    // 
    scrollResponderHandleStartShouldSetResponder() {
        return false;
    },
    // 根据是否正在滚动，设置响应捕获
    scrollResponderHandleStartShouldSetResponderCapture() {
        return this.scrollResponderIsAnimating();
    },
    scrollResponderHandleResponderReject() {
        // throw a warning
    },
    scrollResponderHandleTerminationRequeset() {
        return !this.state.observedScrollSinceBecomingResponder;
    },
    // 响应touchEnd事件
    scrollResponderHandleTouchEnd(e) {
        const nativeEvent = e.nativeEvent;
        this.state.isTouching = nativeEvent.touches.length !== 0;
        if (typeof this.props.onTouchEnd === 'function') {
            this.props.onTouchEnd(e);
        }
    },
    // 处理响应释放事件
    scrollResponderHandleResponderRelease(e) {
        if (typeof this.props.onResponder === 'function') {
            this.props.onResponderRelease(e);
        }
        // 找到当前TextInput获取到焦点的输入框
        const currentlyFocusedTextInput = TextInputState.currentlyFocusedField();
        if (
            !this.state.becomingResponderWhileAnimating && 
            !this.state.observedScrollSinceBecomingResponder && 
            !this.props.keyBoardShouldPersistTaps && 
            currentlyFocusedTextInput != null && 
            e.target !== currentFocusedTextInput
        ) {
            if (typeof this.props.onScrollResponderKeyBoardDismissed === 'function') {
                this.props.onScrollResponderKeyBoardDismissed && this.props.onScrollResponderKeyBoardDismissed(e);
            }
            TextInputState.blurTextInput(currentlyFocusedTextInput);   
        }
    },
    // 处理滚动事件
    scrollResponderHandleScroll(e) {
        this.state.observedScrollSinceBecomingResponder = true;
        this.props.onScroll && this.props.onScroll(e);
    },
    scrollResponderHandleResponderGrant(e) {
        this.state.observedScrollSinceBecomingResponder = false;
        this.props.onResponderGrant && this.props.onResponderGrant(e);
        this.state.becomingResponderWhileAnimating = this.scrollResponderIsAnimating();
    },
    scrollResponderHandleScrollBeginDrag(e) {
        this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(e);
    },
    scrollResponderHandleScrollEndDrag(e) {
        this.props.onScrollEndDrag && this.props.onScrollEndDrag(e);
    },
    // 
    scrollResponderHandleMomentumScrollBegin(e) {
        this.state.lastMomentumBeginTime = Date.now();
        this.props.onMomentumScrollBegin && this.props.onMomentumScrollBegin(e);
    },
    scrollResponderHandleMomentumScrollEnd(e) {
        this.state.lastMomentumEndTime = Date.now();
        this.props.onMomentumScrollEnd && this.props.onMomentumScrollEnd(e);
    },
    // touch事件
    scrollResponderHandleTouchStart(e) {
        this.state.isTouching = true;
        this.props.onTouchStart && this.props.onTouchStart(e);
    },
    // touch移动
    scrollResponderHandleTouchMove(e) {
        this.props.onTouchMove && this.props.onTouchMove(e);
    },
    scrollResponderIsAnimating() {
        const now = Date.now();
        // 现在与上次滚动结束的间隔时间
        const timeSinceLastMomentumScrollEnd = now - this.state.lastMomentumScrollEndTime;
        // 正在滚动的依据满足两者之一：
        // 1）时间间隔小于 16（为了防抖），
        // 2）最近的结束时间小于最近的开始时间
        const isAnimating = timeSinceLastMomentumScrollEnd > IS_ANIMATING_TOUCH_START_THRESHOLD_MS || 
        this.state.lastMomentumScrollEndTime < this.state.lastMomentumBeginTime;
        return isAnimating
    },
    scrollResponderGetScrollableNode() {
        // getScrollableNode 是给外部重写获取node节点的方法
        // findNodeHandle: 处理找寻node节点的方法
        return this.getScrollableNode ? this.getScrollableNode : findNodeHandle(this);
    },
    /


};

const ScrollResponder = {
    mixin: ScrollResponderMixin
};

export default ScrollResponder;