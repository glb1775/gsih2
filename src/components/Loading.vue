<script setup>
import * as THREE from 'three';
// import choose from "./choose.vue";
import { ref } from 'vue'
import twin from './twin';
// import router from '../router/index';

import { twinStore } from '../store/index.js';

import { storeToRefs } from 'pinia'
const store = twinStore();
const { loadBool } = storeToRefs(store)

const percent = ref(0);//模型加载百分比
// const loadBool = ref(false);//是否加载完成，控制进度条是否显示

// ,renderer,scene
const { gltfLoader, model } = twin;


if (!store.loadBool) {
  // gltfLoader.load("./model.glb", function (gltf) {
  //   store.loadBool = true;//加载完成设置vue组件数据
  //   model.add(gltf.scene);

  //   router.push({ path: '/' });//跳转到整体预览场景的页面
  // }, function (progress) {
  //   // console.log('_this.percent',_this.percent);
  //   // console.log('xhr.total',xhr.total);
  //   percent.value = Math.floor(progress.loaded / progress.total * 100); //换算为百分比
  // });


  // 异步操作
  const loadModel = async () => {
    try {
      const gltf = await gltfLoader.loadAsync("./model.glb", (progress) => {
        // console.log('_this.percent',_this.percent);
        console.log('progress.total', progress.total);
        // percent.value = Math.floor(progress.loaded / progress.total * 100); //换算为百分比

        percent.value = Math.floor(progress.loaded / 6224928 * 100); //换算为百分比


      })

      //隐藏首页之外的模型
      // gltf.scene.getObjectByName('home').visible = true;
      // gltf.scene.getObjectByName('jifang').visible = false;
      // gltf.scene.getObjectByName('cheku').visible = false;
      // gltf.scene.getObjectByName('dianti').visible = false;
      // gltf.scene.getObjectByName('shebei').visible = false;
      

      store.loadBool = true;//加载完成设置vue组件数据
      model.add(gltf.scene);




    } catch (error) {
      console.error(error);
    }
  };

  // 调用异步操作
  loadModel();




}






</script>

<template>
  <div class="back" v-if="!loadBool">
    <div class="name">智慧工厂3D可视化管理</div>
    <!-- 进度条 -->
    <el-progress class="percent" :stroke-width="6" :percentage="percent" />
  </div>
  <!-- <choose v-if="loadBool" /> -->
</template>

<style scoped>
.name {
  width: 400px;
  text-align: center;
  font-size: 36px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -120px;
  margin-left: -200px;
}

.percent {
  /* 居中 */
  width: 400px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -4px;
  margin-left: -200px;
  z-index: 11;
}


.back {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  color: #fff;
  /* color: rgb(230,255,255); */
  /* background: linear-gradient(to bottom, rgb(88,141,181), rgb(201,219,231)); */
  background: linear-gradient(to bottom, rgb(60, 105, 150), rgb(150, 150, 150));
  /* background: linear-gradient(to bottom, rgb(44,70,90), rgb(100,110,110)); */
}
</style>
