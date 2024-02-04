import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import TWEEN from '@tweenjs/tween.js'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import {
    EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
    RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
    ShaderPass
} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {
    OutlinePass
} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {
    GammaCorrectionShader
} from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// // 引入threejs镜头光晕扩展库
// import {
//     Lensflare,
//     LensflareElement
// } from 'three/addons/objects/Lensflare.js';

export default class Twin {
    constructor(params) {
        const {
            cameraPosition = new THREE.Vector3(100, 100, 100),
            cameraTarget = new THREE.Vector3(0, 0, 0),
            statsBool = true,
            guiBool = true,
            left = 0,
            top = 0,
        } = params;

        this.left = left;
        this.top = top;
        const width = window.innerWidth - this.left; //计算canvas画布当前宽度
        const height = window.innerHeight - this.top;//计算canvas画布当前高度

        // 场景
        this.scene = new THREE.Scene();
        // 相机
        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
        camera.position.copy(cameraPosition);
        this.cameraPosition0 = camera.position.clone();
        camera.lookAt(0, 0, 0);
        this.camera = camera;
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,

        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);
        // canvas画布布局定位
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = this.top + 'px';
        this.renderer.domElement.style.left = this.left + 'px';
        this.renderer.domElement.style.zIndex = '-1';//注意与其他HTML元素叠加关系

        // OrbitControls相机控件：旋转缩放操作
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enablePan = false; //禁止右键拖拽
        this.orbitControls.maxPolarAngle = Math.PI / 2 * 0.9;//限制上下旋转范围 不看到底部
        this.orbitControls.target.copy(cameraTarget);
        this.orbitControls.update();
        this.cameraTarget0 = cameraTarget;


        // gltf加载器
        // this.gltfLoader = new gltfLoader().gltfLoader;
        const dracoLoader = new DRACOLoader();
        // DRACOLoader依赖的多个js文件在public下的libs文件中
        dracoLoader.setDecoderPath('./libs/draco/gltf/');
        this.gltfLoader = new GLTFLoader(); //创建一个GLTF加载器
        this.gltfLoader.setDRACOLoader(dracoLoader);

        //.model属性用于存放gltf加载的模型
        this.model = new THREE.Group();
        this.scene.add(this.model);

        // 后处理
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        const gammaCorrection = new ShaderPass(GammaCorrectionShader);
        this.composer.addPass(gammaCorrection);
        // 高亮发光描边通道
        const outlinePass = new OutlinePass(new THREE.Vector2(width, height), this.scene,
            this.camera);
        outlinePass.selectedObjects = [];
        outlinePass.visibleEdgeColor.set(0x00ffff); //模型描边颜色，默认白色          
        outlinePass.edgeThickness = 4.0; //轮廓边缘描边厚度
        outlinePass.edgeStrength = 6.0; //边缘发光强度,数值大，更亮一些
        outlinePass.pulsePeriod = 2;//模型闪烁频率控制，默认0不闪烁

        outlinePass.hiddenEdgeColor.set(0x00ffff);// 不可见边缘的颜色



        this.composer.addPass(outlinePass);
        this.outlinePass = outlinePass;
        this.FXAAPass = new ShaderPass(FXAAShader);//抗锯齿通道
        this.FXAAPass.uniforms['resolution'].value.set(1 / width, 1 / height);
        this.composer.addPass(this.FXAAPass);

        // CSS2渲染器CSS2DRenderer
        const css2DRenderer = new CSS2DRenderer();
        css2DRenderer.setSize(width, height);
        css2DRenderer.domElement.style.position = 'absolute';
        // 相对标签原位置位置偏移大小
        css2DRenderer.domElement.style.top = '0px';
        css2DRenderer.domElement.style.left = '0px';
        // //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
        css2DRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(css2DRenderer.domElement);
        this.css2DRenderer = css2DRenderer;


        // CSS3渲染器CSS3DRenderer
        const css3DRenderer = new CSS3DRenderer();
        css3DRenderer.setSize(width, height);
        css3DRenderer.domElement.style.position = 'absolute';
        // 相对标签原位置位置偏移大小
        css3DRenderer.domElement.style.top = '0px';
        css3DRenderer.domElement.style.left = '0px';
        // //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
        css3DRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(css3DRenderer.domElement);
        this.css3DRenderer = css3DRenderer;


        this.initResize();// 监听窗口时间,更新Cavnas画布相关尺寸
        this.initEnvMap();//设置环境贴图

        if (statsBool) {
            //性能监视器stats.js,显示帧率
            this.stats = new Stats();
            document.body.appendChild(this.stats.dom);
        }


        if (guiBool) {
            this.gui = new GUI();
            this.gui.domElement.style.right = '0px';
            this.gui.domElement.style.width = '300px';
        }


        this.directionalLight = new THREE.DirectionalLight(0xffffff);
    }



    initResize() {
        // 监听窗口时间,更新Cavnas画布相关尺寸
        window.addEventListener('resize', () => {
            //重新计算canvas画布当前宽高度
            const width = window.innerWidth - this.left;
            const height = window.innerHeight - this.top;
            this.camera.aspect = width / height;//相机
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);//渲染器
            // 后处理
            this.composer.setSize(width, height);
            this.outlinePass.resolution.set(width, height);
            this.FXAAPass.uniforms['resolution'].value.set(1 / width, 1 / height);
            // CSS渲染器
            this.css2DRenderer.setSize(width, height);
            this.css3DRenderer.setSize(width, height);
        })

    }

    async initEnvMap() {
        const hdrLoader = new RGBELoader();//hdr格式图像加载器
        const envMap = await hdrLoader.loadAsync('./envMap.hdr');
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        // envMap.colorSpace  = THREE.SRGBColorSpace;//设置为SRGB颜色空间
        this.scene.environment = envMap;

        if (this.gui) {
            this.gui.add({ v: 1 }, 'v', 0, 5).onChange((v) => {
                this.model.traverse((obj) => {
                    if (obj.isMesh) {
                        obj.material.envMapIntensity = v;
                    }
                });
            }).name('环境贴图强度');
        }

        // 背景球体
        const sphereBack = new THREE.TextureLoader().load("./sphereBack.jpg");
        const geometry = new THREE.SphereGeometry(1200, 50, 50);
        const material = new THREE.MeshBasicMaterial({
            map: sphereBack,
            side: THREE.BackSide, //默认前面可见，设置为背面可见即可
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
    }




    // event：鼠标事件
    // chooseObjArr：需要射线拾取的模型对象构成的数组
    raychoose(event, chooseObjArr, camera) {
        const px = event.offsetX; //鼠标单击位置横坐标(以canvas左上角为基准)
        const py = event.offsetY; //鼠标单击位置纵坐标        
        const width = window.innerWidth - this.left;
        const height = window.innerHeight - this.top;
        //屏幕坐标转WebGL标准设备坐标
        const x = (px / width) * 2 - 1;
        const y = -(py / height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const intersects = raycaster.intersectObjects(chooseObjArr, true);
        let choose = null;
        // 考虑没有后代的特殊情况  注意代码bug
        for (let i = 0; i < chooseObjArr.length; i++) {
            const group = chooseObjArr[i];
            //递归遍历chooseObj，并给chooseObj的所有子孙后代设置一个ancestors属性指向自己
            group.traverse(function (obj) {
                obj.ancestors = group;
            })
        }
        if (intersects.length > 0) {
            choose = intersects[0].object.ancestors;
        }
        return choose;
    }



    // 创建一个CSS2 HTML标签对象  modelName模型对象名字,dom标签html对象
    css2Tag(dom) {
        //dom元素包装为CSS2模型对象CSS2DObject
        const label = new CSS2DObject(dom);
        // dom.style.pointerEvents = 'none';//避免HTML标签遮挡三维场景的鼠标事件
        // 设置HTML元素标签在three.js世界坐标中位置
        // label.position.set(x, y, z);
        // model.add(label);   
        // this.model.getObjectByName(modelName).add(label);
        return label
    }

    // 创建一个HTML标签对象  dom元素对象 s缩放倍数  ty：y方向标签偏移尺寸
    css3SpirteTag(objectName, dom, s,ty) {
        //dom元素包装为CSS3模型对象CSS3DObject
        const label = new CSS3DSprite(dom);
        dom.style.pointerEvents = 'none';//避免HTML标签遮挡三维场景的鼠标事件
        // 设置HTML元素标签在three.js世界坐标中位置
        // label.position.set(x, y, z);
        // const s = 0.01;
        label.scale.set(s, s, s);//根据场景范围和HTML像素，缩放标签
        label.position.y = ty
        this.model.getObjectByName(objectName).add(label);
        // return label;
    }

    css3ObjTag(domID) {
        const dom = document.getElementById(domID);
        //dom元素包装为CSS3模型对象CSS3DObject
        const label = new CSS3DObject(dom);
        dom.style.pointerEvents = 'none';//避免HTML标签遮挡三维场景的鼠标事件
        // 设置HTML元素标签在three.js世界坐标中位置
        const s = 0.01;
        label.scale.set(s, s, s);//根据场景范围和HTML像素，缩放标签
        return label;
    }



    render() {//部署时候使用
        this.renderer.setAnimationLoop(() => {
            // this.renderer.render(this.scene, this.camera);
            this.composer.render();
            TWEEN.update();
            this.css2DRenderer.render(this.scene, this.camera);
            this.css3DRenderer.render(this.scene, this.camera);

            if (this.stats) this.stats.update();
        })
    }



    // addStats() {
    //     const stats = new Stats();
    //     document.body.appendChild(stats.dom);
    // }
    addAxesHelper(size) {
        if (size === undefined) size = 100;
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
        return axesHelper;
    }
    addAmbientLight(intensity, max) {
        if (max === undefined) max = 2.0;
        if (intensity === undefined) intensity = 1.0;
        const ambient = new THREE.AmbientLight(0xffffff, intensity);
        this.scene.add(ambient);
        if (this.gui) this.gui.add(ambient, 'intensity').min(0).max(max).step(0.01).name('环境光强度');
    }

    addDirectionalLight(intensity, max) {
        if (max === undefined) max = 10.0;
        if (intensity === undefined) intensity = 7.0;
        const directionalLight = this.directionalLight;
        directionalLight.intensity = intensity;
        directionalLight.position.set(150, 150, 80);
        this.scene.add(directionalLight);
        if (this.gui) this.gui.add(directionalLight, 'intensity').min(0).max(max).step(0.01).name('日光强度');
        // 设置阴影
        // 设置用于计算阴影的光源对象
        directionalLight.castShadow = true;
        // 设置计算阴影的区域，最好刚好紧密包围在对象周围
        // 计算阴影的区域过大：模糊  过小：看不到或显示不完整
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 3000;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        // 为了清晰度，提升阴影贴图的尺寸
        directionalLight.shadow.mapSize.width = 1024 * 4;
        directionalLight.shadow.mapSize.height = 1024 * 4;
        directionalLight.shadow.radius = 2;

        this.directionalLight = directionalLight;


        this.renderer.shadowMap.enabled = true; // 设置渲染器，允许场景中使用阴影贴图
        this.renderer.shadowMap.type = THREE.VSMShadowMap; // 以免模型表面产生条纹影响渲染效果

        this.model.traverse(function (obj) {
            if (obj.type === 'Mesh') {
                // 设置产生投影的网格模型
                obj.castShadow = true;
                // 设置接收阴影的投影面
                obj.receiveShadow = true;
            }
        })


        // // 太阳模拟
        // const texLoader = new THREE.TextureLoader();
        // // 用于镜头光晕的纹理对象
        // const texture = texLoader.load("./lensflare.jpg");

        // // 创建两个镜头光晕Lensflare对象
        // const lensflareElement = new LensflareElement(texture, 600, 0, new THREE.Color(0xffffff)); //600:设置光晕像素大小
        // const lensflare1 = new Lensflare();

        // lensflare1.addElement(lensflareElement); // Lensflare可以根据需要包含多个LensflareElement
        // // const lensflare2 = new Lensflare();
        // // lensflare2.addElement(lensflareElement);
        // directionalLight.add(lensflare1);
        // // directionalLight.add(lensflare2);

    }




    // 相机动画形式切换到名为name的模型附近  s控制渲染范围
    setCameraTarget(model, s) {
        if (s == undefined) s = 1.0;
        // const model = this.model.getObjectByName(name);
        const box3 = new THREE.Box3();
        box3.expandByObject(model);
        const center = new THREE.Vector3();
        box3.getCenter(center);
        const size = new THREE.Vector3();
        box3.getSize(size);
        // // center + size 设置相机位置
        // this.camera.position.addVectors(center, size.multiplyScalar(1.2))
        // // 模型中心center作为目标观察点
        // // this.camera.lookAt(x, y, z);
        // this.orbitControls.target.copy(center); //与lookAt参数保持一致
        // this.orbitControls.update();

        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        // 当前相机位置  靠拢目标观察点，或者 视线不变  相机拖位置  多少会好点，目前好像也没事
        // bug误操作

        const cameraPos = new THREE.Vector3();
        // center + size 设置相机位置
        // cameraPos.addVectors(center, size.multiplyScalar(1.2))
        let max;// 计算包围盒的最大边长
        if (size.x > size.y) {
            max = size.x
        } else {
            max = size.y
        }
        if (max < size.z) max = size.z
        // size.set(max * 0.8, max * 0.8, max * 0.8)
        // size.set(max * 1.5, max * 1.5, max * 1.5)
        size.set(max * s, max * s, max * s)
        cameraPos.addVectors(center, size)

        const obj = {
            // 当前预览状态对应位置
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z,
            // 相机当前预览状态对应目标观察点
            tx: this.orbitControls.target.x,
            ty: this.orbitControls.target.y,
            tz: this.orbitControls.target.z,
        };
        const tween = new TWEEN.Tween(obj);
        tween.to({
            // center + size 设置相机位置
            x: cameraPos.x,
            y: cameraPos.y,
            z: cameraPos.z,
            // 模型中心center作为目标观察点
            tx: center.x,
            ty: center.y,
            tz: center.z,
        }, 1000);
        tween.onUpdate((v) => {
            this.camera.position.set(v.x, v.y, v.z);
            // camera.lookAt(v.tx, v.ty, v.tz);
            this.orbitControls.target.set(v.tx, v.ty, v.tz);
            this.orbitControls.update();
        });
        tween.start();
    }



    // 通过相机动画方式，回到整个场景预览状态
    changeCamera0() {
        const obj = {
            // 当前预览状态对应位置
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z,
            // 相机当前预览状态对应目标观察点
            tx: this.orbitControls.target.x,
            ty: this.orbitControls.target.y,
            tz: this.orbitControls.target.z,
        };
        const tween = new TWEEN.Tween(obj);
        tween.to({
            // 相机整体观察位置
            x: this.cameraPosition0.x,
            y: this.cameraPosition0.y,
            z: this.cameraPosition0.z,
            // 相机整体预览对应目标观察点
            tx: this.cameraTarget0.x,
            ty: this.cameraTarget0.y,
            tz: this.cameraTarget0.z,
        }, 1000);
        tween.onUpdate((v) => {
            this.camera.position.set(v.x, v.y, v.z);
            // camera.lookAt(v.tx, v.ty, v.tz);
            this.orbitControls.target.set(v.tx, v.ty, v.tz);
            this.orbitControls.update();
        });
        tween.start();
    }

    // 某个页面切换到那个状态
    changeCamera(pos, target) {
        if (!target) target = new THREE.Vector3(0, 0, 0);
        const obj = {
            // 当前预览状态对应位置
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z,
            // 相机当前预览状态对应目标观察点
            tx: this.orbitControls.target.x,
            ty: this.orbitControls.target.y,
            tz: this.orbitControls.target.z,
        };
        const tween = new TWEEN.Tween(obj);
        tween.to({
            // 相机整体观察位置
            x: pos.x,
            y: pos.y,
            z: pos.z,
            // 相机整体预览对应目标观察点
            tx: target.x,
            ty: target.y,
            tz: target.z,
        }, 1000);
        tween.onUpdate((v) => {
            this.camera.position.set(v.x, v.y, v.z);
            // camera.lookAt(v.tx, v.ty, v.tz);
            this.orbitControls.target.set(v.tx, v.ty, v.tz);
            this.orbitControls.update();
        });
        tween.start();
    }



    logCameraPosition() {
        // 鼠标旋转缩放场景，浏览器控制台打印相机坐标
        this.orbitControls.addEventListener('change', () => {
            const pos = this.camera.position;
            console.log('相机xyz坐标', [pos.x, pos.y, pos.z]);
            const target = this.orbitControls.target;
            console.log('目标观察点xyz坐标', [target.x, target.y, target.z]);
        })
    }


}

