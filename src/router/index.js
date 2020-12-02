import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    // mode: 'history',
    routes: [
        {
            path: '/',
            redirect: '/featuresList'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '/appList',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/AppList.vue'),
                    meta: { title: '微博账号' }
                },
                {
                    path: '/featuresList',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/FeaturesList.vue'),
                    meta: { title: '功能列表' }
                },
                {
                    path: '/taskRelease/:name/:title',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/TaskRelease.vue'),
                    meta: { title: '任务发布' }
                },
                {
                    path: '/taskCreation',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/TaskCreation.vue'),
                    meta: { title: '任务创建' }
                },
                {
                    path: '/taskTable',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/TaskTable.vue'),
                    meta: { title: '阿法猪任务列表' }
                },
                {
                    path: '/taskTableT',
                    component: () => import(/* webpackChunkName: "table" */ '../components/page/TaskTableT.vue'),
                    meta: { title: '佩奇任务列表' }
                }
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../components/page/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
