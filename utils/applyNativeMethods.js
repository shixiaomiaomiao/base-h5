
import NativeMethods from './NativeMethods'

const applyNativeMethods = Component => {
    Object.keys(NativeMethods).forEach((functionName) => {
        if (!Component[functionName]) {
            Component[functionName] = NativeMethods[functionName];
        }
    })
}

export default applyNativeMethods;