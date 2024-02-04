import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),// hash模式：createWebHashHistory，history模式：createWebHistory
    routes: [
        // {
        //     path:'/',
        //     component: () => import('../views/Load.vue')
        // },
        // {
        //     path:'/home',
        //     component:()=>import('../views/home.vue')
        // },

        { path: '/', redirect: '/home' },
        {
            path: '/home',
            component: () => import('../views/home.vue')
        },
        // {
        //     path: '/login',
        //     component: () => import('../views/cheku.vue')
        // },
        // {
        //     path: '/floor/:id',
        //     component: () => import('../views/floor.vue')
        // },
        // {
        //     path: '/jifang',
        //     component: () => import('../views/jifang.vue')
        // },
        // {
        //     path: '/dianti',
        //     component: () => import('../views/dianti.vue')
        // },
        // {
        //     path: '/shebei',
        //     component: () => import('../views/shebei.vue')
        // }
    ]
})

export default router