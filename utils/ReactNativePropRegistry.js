

const emptyObj = {};
const prefix = 'r';
const uniqueID = 1;
const objects = {};

// 给你一个id ,加上prefix ，类似于两把钥匙🔑？ 🔐？ 加密？ 有意思
const createKey = id => `${prefix}-${id}`; 


export default class ReactNativePropRegistry {
    // 什么时候注册呢？？🤔
    static registry(object) {
        const id = uniqueID++;
        const key = createKey(id);
        objects[key] = object;
        return id;
    }
    static getByID(id) {
        if (!id) {
            return emptyObj;
        }
        const key = createKey(id);
        return objects[key] || emptyObj;
    }
}