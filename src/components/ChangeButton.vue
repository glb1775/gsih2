<script setup>
import twin from './twin';
import { ref, onMounted, defineProps } from 'vue'





const changeHome = () => {
    twin.changeCamera0();//动画形式回到默认整体预览状态
}

const changeAB = (modelName) => {
    const obj = twin.model.getObjectByName(modelName)
    // 相机动画
    twin.setCameraTarget(obj, 1.5)
}




</script>

<template>
    <div class="pos">
        <div id="Home" class="bu" @click="changeHome()">首页</div>
        <div id="A" class="bu" style="margin-left: 20px;"  @click="changeAB('设备A')">设备A</div>
        <div id="B" class="bu" style="margin-left: 20px;" @click="changeAB('设备B')">设备B</div>
    </div>
</template>

<style scoped>
.pos {
    /* background-color: aqua; */
    position: absolute;
    left: 50%;
    margin-left: -120px;
    bottom: 50px;
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
