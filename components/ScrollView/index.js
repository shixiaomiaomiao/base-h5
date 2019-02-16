import StylesSheet from '../../utils/StyleSheet';

import ScrollResponder from  '../../utils/ScrollView/ScrollResponder'

const propsTypes = {
    scrollTo,
    scrollToEnd,
    // 
}

const ScrollView = createClass(propsTypes, {
    mixins: [ScrollResponder.mixin],
    getInitialState() {
        this.scrollResponderMixinGetInitialState();
    },
});

const commonTypes = {

}

const style = StylesSheet.createStyle({

})

export default ScrollView