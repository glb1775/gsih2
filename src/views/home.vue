<script setup>
import Loading from '../components/Loading.vue'
import HeadPage from '../components/HeadPage.vue'


import Home3D from '../components/Home3D.vue'
// import twin from '../components/twin';
// import router from '../router/index';



import { twinStore } from '../store/index.js';

import { storeToRefs } from 'pinia'
const store = twinStore();
const { loadBool } = storeToRefs(store)

</script>

<template>
  <HeadPage />
  <Loading  v-if="!loadBool"/>
  <Home3D v-if="loadBool"/>
</template>

<style scoped>

</style>
