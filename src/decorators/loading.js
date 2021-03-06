import { Toast} from 'antd-mobile';

export default function loading (target, name, descriptor){
    const method = descriptor.value;
    descriptor.value = async (...args)=>{
        Toast.loading("加载中");
        let ret = await method.apply(target, args);
        return ret;
    }
    return descriptor;
}