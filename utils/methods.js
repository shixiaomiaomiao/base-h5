import ReactDOM from 'react-dom';

const createDOMProps = (props) => {
    // todo 
    return props;
} 

export const createElement = (component, props, ...children) => {
    // todo  
    const Component = component;
    const domProps = createDOMProps(props);
    return ReactDOM.createElement(Component, domProps,...children)
}   

