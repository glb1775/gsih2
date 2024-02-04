import * as THREE from 'three';
import Twin from '../Three/Twin.js';

// const {scene,camera,renderer,orbitControls,css2DRenderer,css3DRenderer,composer,outlinePass,FXAAPass,gltfLoader,model} = new ThreeBase();

const twin = new Twin({
    // cameraPosition: new THREE.Vector3(25, 25, 25),//根据渲染场景范围大概设置相机位置  机房尺寸数量级几十米
    cameraPosition: new THREE.Vector3(-85.84685664950055, 52.610492399122684, 68.514715361941),
    cameraTarget: new THREE.Vector3(-2.2292622945646148, -13.031964916500405, 10.382246192489845),
    // left:200,
    // top:120,
    statsBool:false,//发布时候，去掉默的stats帧率界面
    guiBool:false,//发布时候，去掉默认gui界面
});
twin.render();//渲染场景，输出canvas画布，插入body中

twin.addAxesHelper();//添加坐标轴辅助工具


// 设置雾化效果
twin.scene.fog = new THREE.Fog(0x73a5c8, 800, 1600);

// function loop(){
//     twin.scene.rotateY(-0.01);
//     requestAnimationFrame(loop);
// }
// loop()

// twin.logCameraPosition();//执行后，当你鼠标旋转缩放场景，浏览器控制打印相机坐标

import { twinStore } from '../store/index.js';

import { storeToRefs } from 'pinia'
const store = twinStore();
const { loadBool, loadingBool } = storeToRefs(store)

// name:优先加载的模型名字
function loadPageGltf(name) {
    //全部模型名字
    const gltfArr = ['home', 'jifang', 'dianti', 'shebei', 'cheku'];
    const newGltfArr = [];
    for (let i = 0; i < gltfArr.length; i++) {
        // 除了当前页面需要加载模型，其他页面需要加载的模型
        if (gltfArr[i] !== name) newGltfArr.push(gltfArr[i]);
    }
    if (loadBool) {
        // 加载newGltfArr对应所有模型
    } else {
        if (!loadingBool) {
            //  加载当前页面模型，如果正在加载，就没有必要再次请求了
        }
    }
    // 统一的loading进度，在Twin里面引入store文件统一设置进度，看看效果怎么样
    // 怎么控制进度条是个问题，总不能多个loadvue把，应该统一合并，同一边写代码，感觉这个比较麻烦，先放一放
    // 多个页面怎么处理，是否删除内存，要看总文件大小
}




export default twin;