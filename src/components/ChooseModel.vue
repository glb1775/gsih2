<script setup>
import twin from './twin';
import { ref, onMounted, defineProps } from 'vue'
import { twinStore } from '../store/index.js';

import { storeToRefs } from 'pinia'
const store = twinStore();

// 本质模拟随机生成数据，实际开发，请求后端或后端推送
const name = ref('设备A');
const num = ref(0);
const person = ref('郭隆邦');
const state = ref('异常');
// const personId = 'www.webgl3d.cn';
const personId = ref('45632100');

const props = defineProps(['modelName', 'tagText'])
const messageTag = ref(null);
let chooseObjBool = ref(false);//标签对应所有模型是否有一个选中
onMounted(() => {
    const tag = twin.css2Tag(messageTag.value);
    let chooseObj = null
    // 点击射线拾取物体

    twin.renderer.domElement.addEventListener('click', (event) => {
        //有标签时候禁止射线拾取
        // 如果处于测量状态禁止拾取
        if (!chooseObjBool.value&&!store.testSizeBool) {
            if (chooseObj) {
                chooseObj = null
                // twin.outlinePass.selectedObjects = [];
                // chooseObjBool.value = false;//隐藏标签
            }
            chooseObj = twin.raychoose(event, twin.model.getObjectByName('存储罐').children, twin.camera)
            if (chooseObj) {
                twin.outlinePass.selectedObjects = [chooseObj];
                chooseObjBool.value = true;//显示标签
                chooseObj.getObjectByName(chooseObj.name + '标注').add(tag);

                // 相机动画
                twin.setCameraTarget(chooseObj, 1.5)

                name.value = chooseObj.name;
                num.value = Math.floor(200000 + 200000 * Math.random());//前端模拟数据
                // 数字滚动动画
                const NumMax = num.value
                num.value = 0;
                const interval = setInterval(function () {
                    if (num.value < NumMax) {
                        num.value += Math.floor(NumMax / 100);
                    } else {
                        clearInterval(interval);//一旦达到当日通车数量，取消周期性函数interval
                    }
                }, 5);

            } else {
                chooseObj = null;
                chooseObjBool.value = false;//隐藏标签
            }
        }
    })



})


const close = () => {
    twin.outlinePass.selectedObjects = [];
    chooseObjBool.value = false;//隐藏标签
    twin.changeCamera0();//动画形式回到默认整体预览状态
}



</script>

<template>
    <div ref="messageTag">
        <div v-if="chooseObjBool"
            style="width:465px;height:370px;position: absolute;color: #fff;z-index: 12;font-size: 16px;">

            <!-- top:-80px;left: 20px;相对原来位置偏移5标注 -->
            <!-- top:-280px;left: -230px; -->
            <div style="width:465px;opacity: 1.0;position:relative;top:-290px;left: -210px;">
                <!-- 标签信息背景图片 -->
                <div style="position: absolute;left: 0px;top: 0px;">
                    <img src="../assets/信息背景.png" alt="" style="width:400px;opacity: 1.0;">
                </div>

                <!-- 名称 -->
                <div style="position:absolute;left:48px;top:36px;font-size:16px;">
                    <div style="font-size:20px;font-weight: 400;">
                        <span>{{ name }}</span>
                    </div>
                    <div style="margin-top: 30px;">
                        <span style="font-weight: 400;margin-left: 80px;font-size: 40px;color: #00ffff;">{{ num }}L</span>
                    </div>
                    <div style="margin-top: 20px;">
                        <span style="color: #ccc;font-weight: 300;">管理</span><span
                            style="font-weight: 400;margin-left: 30px;">{{ person }}</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <span style="color: #ccc;font-weight: 300;">工号</span><span
                            style="font-weight: 400;margin-left: 30px;">{{ personId }}</span>
                    </div>
                </div>


                <!-- 姓名 工号 头像 -->
                <div style="position:absolute;left:285px;top:35px;">
                    <span style="color: #ffff00;">{{ state }}</span>


                </div>

                <div style="position:absolute;left:350px;top:20px;">
                    <img id="close" src="../assets/关闭.png" width="32" style="pointer-events: auto;" @click="close()">
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.SceneTag {
    color: #00ffff;
    font-size: 18px;
    padding: 4px 16px;
    padding-bottom: 8px;
    background-image: url(../assets/SceneTag.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
}

#close:hover {
    cursor: pointer;
}
</style>
