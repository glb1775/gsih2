import { defineStore } from 'pinia'

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const twinStore = defineStore('main', {
    state: () => {
        return {
            loadBool:false,//首页模型是否加载完成
            testSizeBool:false,//测量状态
            // loadingBool: false,//首页模型是否正在加载
            // jifang: false,//机房单独model是否加载
        }
    }
})


