<script setup>
import twin from './twin';
import { ref, onMounted,defineProps } from 'vue'



const props = defineProps(['modelName','tagText'])

const tagDOM = ref(null);
onMounted(() => {
    twin.css3SpirteTag(props.modelName, tagDOM.value,0.1,1)
})



</script>

<template>
    <div class="SceneTag" ref="tagDOM">{{ tagText }}</div>
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
</style>
