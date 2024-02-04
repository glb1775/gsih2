<script setup>
import { ref } from 'vue'
const SceneTagArr = ref([
  {
    modelName:'设备A标注',//模型名字
    tagText: '设备A',//标签里面文字
  }, {
    modelName: '设备B标注',
    tagText: '设备B',
  }, {
    modelName: '仓库标注',
    tagText: '厂房C',
  },
  // {
  //   modelName: '停车场标注',
  //   tagText: '停车场',
  // }
])

import twin from './twin';
import * as THREE from 'three';
import CarRun from './CarRunLoop';
import SceneTag from './SceneTag.vue';
import chooseModel from './chooseModel.vue';
import ChangeButton from './ChangeButton.vue';
import TestSize from './TestSize.vue';


twin.scene.fog.near = 800
twin.scene.fog.far = 1600

// twin.addAmbientLight(1.0);//添加环境光
twin.addDirectionalLight(2);//添加日光和阴影
twin.model.traverse((obj) => {
  if (obj.isMesh) {
    obj.material.envMapIntensity = 0.7;
  }
});


CarRun(twin.model.getObjectByName('大货车'), twin.model); // 给定坐标，车运动动画

flag(twin.model.getObjectByName('红旗')); // 红旗序列帧动画
function flag(mesh) {
  const texture = mesh.material.map;
  // 设置阵列
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(1/8, 1);//从贴图上获取一部分，美术UV坐标设置好的话，不用设置
  const clock = new THREE.Clock();
  let t = 0;

  function loop() {
    t += clock.getDelta();
    if (t > 0.2) {
      t = 0;
      texture.offset.x += 1 / 8; //设置纹理动画    
    }
    requestAnimationFrame(loop);
  }
  loop();
}



</script>

<template>
  <!-- <SceneTag :name="停车场"/> -->
  <SceneTag v-for="(obj, i) in SceneTagArr" :key="i" :modelName="obj.modelName" :tagText="obj.tagText" />
  <chooseModel />
  <ChangeButton />
  <TestSize />
  
  
</template>

<style scoped></style>
