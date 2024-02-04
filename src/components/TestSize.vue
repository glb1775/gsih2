<script setup>
import twin from './twin';
import { ref, onMounted, defineProps } from 'vue'
import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { twinStore } from '../store/index.js';

import { storeToRefs } from 'pinia'
const store = twinStore();
const { testSizeBool } = storeToRefs(store)

const sizeTagGroup = new THREE.Group();//所有标注对象插入，方便整体控制尺寸标签隐藏或显示
twin.model.add(sizeTagGroup)

// 射线拾取选择场景模型表面任意点xyz坐标
function rayChoosePoint(event, model, camera) {
    const px = event.offsetX;
    const py = event.offsetY;
    //屏幕坐标转标准设备坐标
    const x = (px / window.innerWidth) * 2 - 1;
    const y = -(py / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    //.setFromCamera()在点击位置生成raycaster的射线ray
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    // 射线交叉计算拾取模型
    const intersects = raycaster.intersectObject(model, true);
    let v3 = null;
    if (intersects.length > 0) {
        // 获取模型上选中的一点坐标
        v3 = intersects[0].point
    }
    return v3;
}

// 标注线不进行深度测试，渲染顺序放在最后
// 3D场景中，用有粗细的线条
// 两点绘制一条直线 用于标注尺寸
function createLine(p1, p2) {
    const material = new THREE.LineBasicMaterial({
        color: 0xffff00,
        depthTest: false,//不进行深度测试，后渲染，叠加在其它模型之上(解决两个问题)
        // 1.穿过模型，在内部看不到线条
        // 2.线条与mesh重合时候，深度冲突不清晰
    });
    const geometry = new THREE.BufferGeometry(); //创建一个几何体对象
    //类型数组创建顶点数据
    const vertices = new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]);
    geometry.attributes.position = new THREE.BufferAttribute(vertices, 3);
    const line = new THREE.Line(geometry, material);
    return line
}

// 删除标注的对象 通过按钮控制或者专门手动删除控制   数据是否保存根据情况来定

// Sprite标注  canvas作为画布标注数字  
// 3D数字，跟着相机自动旋转

// function createMesh(p,camera) {
//         const L = camera.position.clone().sub(p).length()
//     const geometry = new THREE.SphereGeometry(L/100);
//     const material = new THREE.MeshBasicMaterial({
//         color: 0x00ffff, //设置材质颜色
//         depthTest: false,
//     });
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.copy(p);
//     return mesh;
// }

function createMesh(p, dir, camera) {
    const L = camera.position.clone().sub(p).length()
    const h = L / 30
    const geometry = new THREE.CylinderGeometry(0, L / 200, h);
    geometry.translate(0, -h / 2, 0)
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff, //设置材质颜色
        depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    //通过四元数表示默认圆锥需要旋转的角度，才能和标注线段的方向一致
    const quaternion = new THREE.Quaternion();
    //参数dir表示线段方向，通过两点p1、p2计算即可，通过dir来控制圆锥朝向
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    mesh.quaternion.multiply(quaternion)
    mesh.position.copy(p);
    return mesh;
}
// 能设置粗细的标注线
function createLine2(p1, p2) {
    const material = new LineMaterial({
        color: 0xffffff,
        linewidth: 0.05,//在具有大小衰减的世界单位中，否则为像素
        worldUnits: true,//linewidth对应像素
    });
    // line.worldUnits=true
    // line.needsUpdate = true;
    const geometry = new LineGeometry();
    geometry.setPositions([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]);
    const line = new Line2(geometry, material);

    return line
}

// 计算模型上选中两点的距离
function length(p1, p2) {
    return p1.clone().sub(p2).length()
}

const testBool = ref(false);//测量状态
const background = ref("rgba(0, 0, 0, 0.3)")
const visibility = ref("visible")
// onMounted(() => {
//     const nameDomArr = document.getElementsByName('pos')
//     console.log('nameDomArr', nameDomArr);

// })

const sizeBool = () => {
    // testBool.value = !testBool.value
    store.testSizeBool = !store.testSizeBool
    if (store.testSizeBool) {
        background.value = "rgba(0, 0, 0, 0.8)"
        sizeTagGroup.visible = true
        const domArr = document.body.getElementsByClassName("sizeTag")
        for (let i = 0; i < domArr.length; i++) {
            domArr[i].style.visibility = "visible"

        }
    } else {
        background.value = "rgba(0, 0, 0, 0.3)"
        // sizeTagGroup组对象包含了所有标注线段或标签可以整体隐藏
        sizeTagGroup.visible = false
        // 如果你的标签是HTML，也可以增加CSS代码隐藏所有标注文字
        const domArr = document.body.getElementsByClassName("sizeTag")
        for (let i = 0; i < domArr.length; i++) {
            domArr[i].style.visibility = "hidden"

        }
    }
}

let clickNum = 0;//记录点击次数
let p1 = null;
let p2 = null;
let L = 0

// 通过鼠标按下抬起的时间差或者说距离差，来区分判断是鼠标拖动事件，还是鼠标拖动旋转事件
let mousedownX = 0;
let mousedownY = 0;
twin.renderer.domElement.addEventListener('mousedown', function (event) {
    mousedownX = event.offsetX;
    mousedownY = event.offsetX;
})



twin.renderer.domElement.addEventListener('mouseup', function (event) {
    const x = event.offsetX;
    const y = event.offsetX;
    if (Math.abs(x - mousedownX) < 1 && Math.abs(y - mousedownY) < 1) {
        if (store.testSizeBool) {
            clickNum += 1;
            if (clickNum == 1) {
                p1 = rayChoosePoint(event, twin.model, twin.camera)
                console.log('p1', p1);
            } else {
                clickNum = 0;
                p2 = rayChoosePoint(event, twin.model, twin.camera)
                console.log('p2', p2);
                if (p1 && p2) {
                    L = length(p1, p2).toFixed(2)
                    console.log('L', L);
                    sizeTag(p1, p2, L, twin.camera);//尺寸标注 箭头线段、尺寸数值
                }
                p1 = null;
                p2 = null;
            }
        }
    }

})

// 新逻辑，点击第一次，就出现标注符号，滑动过程一直动态更新
twin.renderer.domElement.addEventListener('mousemove', function (event) {
    const x = event.offsetX;
    const y = event.offsetX;
    if (store.testSizeBool && p1) {
        p2 = rayChoosePoint(event, twin.model, twin.camera)
        L = length(p1, p2).toFixed(2)
        console.log('L', L);
        sizeTag(p1, p2, L, twin.camera);//尺寸标注 箭头线段、尺寸数值
    }
})

// twin.renderer.domElement.addEventListener('click', function (event) {
//     if (store.testSizeBool) {
//         clickNum += 1;
//         if (clickNum == 1) {
//             p1 = rayChoosePoint(event, twin.model, twin.camera)
//             console.log('p1', p1);
//         } else {
//             clickNum = 0;
//             p2 = rayChoosePoint(event, twin.model, twin.camera)
//             console.log('p2', p2);
//             if (p1 && p2) {
//                 L = length(p1, p2).toFixed(2)
//                 console.log('L', L);
//                 sizeTag(p1, p2, L, twin.camera);//尺寸标注 箭头线段、尺寸数值
//             }
//             p1 = null;
//             p2 = null;
//         }
//     }
// })




function sizeTag(p1, p2, size, camera) {
    const line = createLine(p1, p2);
    sizeTagGroup.add(line)

    const dir = p1.clone().sub(p2).normalize()
    sizeTagGroup.add(createMesh(p1, dir, camera))
    sizeTagGroup.add(createMesh(p2, dir.clone().negate(), camera))

    // 精灵模型标注
    // const canvas = createCanvas(size+'m')
    // const texture = new THREE.CanvasTexture(canvas);
    // const spriteMaterial = new THREE.SpriteMaterial({
    //     map: texture,
    //     depthTest: false,
    // });
    // const sprite = new THREE.Sprite(spriteMaterial);
    // const center = p1.clone().add(p2).divideScalar(2)
    // const y = camera.position.clone().sub(center).length()/25;//精灵y方向尺寸
    // // sprite宽高比和canvas画布保持一致
    // const x = canvas.width / canvas.height * y;//精灵x方向尺寸
    // sprite.scale.set(x, y, 1);// 控制精灵大小
    // sprite.position.copy(center);  
    // sprite.position.y += y / 2; 
    // sizeTagGroup.add(sprite);

    // CSS2或CSS3渲染标注
    const div = document.createElement('div')
    div.className = 'sizeTag';
    // div.classList.add("sizeTag");
    document.body.appendChild(div)
    div.style.fontSize = "20px"
    div.style.marginTop = "-20px"
    div.style.color = "#ffffff"
    // div.style.padding = "5px 10px"
    // div.style.background = "rgba(0,0,0,0.9)"
    div.textContent = size + 'm';
    const tag = new CSS2DObject(div);
    const center = p1.clone().add(p2).divideScalar(2)
    tag.position.copy(center);
    sizeTagGroup.add(tag);
}

// 生成一个canvas对象，标注文字为参数name
function createCanvas(name) {
    /**
     * 创建一个canvas对象，绘制几何图案或添加文字
     */
    const canvas = document.createElement("canvas");
    const arr = name.split(""); //分割为单独字符串
    let num = 0;
    const reg = /[\u4e00-\u9fa5]/;
    for (let i = 0; i < arr.length; i++) {
        if (reg.test(arr[i])) { //判断是不是汉字
            num += 1;
        } else {
            num += 0.5; //英文字母或数字累加0.5
        }
    }
    // 根据字符串符号类型和数量、文字font-size大小来设置canvas画布宽高度
    const h = 240; //根据渲染像素大小设置，过大性能差，过小不清晰
    const w = h + num * 110;
    canvas.width = w;
    canvas.height = h;
    const h1 = h * 0.8;
    const c = canvas.getContext('2d');
    // 定义轮廓颜色，黑色半透明
    c.fillStyle = "rgba(0,0,0,0.4)";
    // 绘制半圆+矩形轮廓
    const R = h1 / 2;
    c.arc(R, R, R, -Math.PI / 2, Math.PI / 2, true); //顺时针半圆
    c.arc(w - R, R, R, Math.PI / 2, -Math.PI / 2, true); //顺时针半圆
    c.fill();
    // 绘制箭头
    c.beginPath();
    const h2 = h - h1;
    c.moveTo(w / 2 - h2 * 0.6, h1);
    c.lineTo(w / 2 + h2 * 0.6, h1);
    c.lineTo(w / 2, h);
    c.fill();
    // 文字
    c.beginPath();
    c.translate(w / 2, h1 / 2);
    c.fillStyle = "#ffffff"; //文本填充颜色
    c.font = "normal 128px Times New Roman"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(name, 0, 0);
    return canvas;
}







</script>

<template>
    <div class="pos">
        <div id="Home" class="bu" :style="{ background: background }" @click="sizeBool()">测量</div>
    </div>
</template>

<style scoped>
.pos {
    /* background-color: aqua; */
    position: absolute;
    left: 50%;
    margin-left: -40px;
    bottom: 120px;
}

.bu {
    background: rgba(0, 0, 0, 0.3);
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    display: inline-block;
    border-radius: 30px;
}

.bu:hover {
    cursor: pointer;
}
</style>
