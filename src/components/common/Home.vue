<template>
    <div class="wrapper">
        <v-head></v-head>
        <div class="content-box">
            <div class="content"  ref="content">
                <transition name="move" mode="out-in">
                    <keep-alive>
                        <router-view v-if="isRouterAlive" @fatherMethod="fatherMethod"></router-view>
                    </keep-alive>
                </transition>
                <el-backtop target=".content"></el-backtop>
            </div>
        </div>
    </div>
</template>

<script>
import vHead from './Header.vue';
import bus from './bus';
export default {
    provide() {
        return {
            reload: this.reload
        };
    },
    data() {
        return {
            tagsList: [],
            collapse: false,
            isRouterAlive: true
        };
    },
    components: {
        vHead,
    },
    created() {
        bus.$on('collapse-content', msg => {
            this.collapse = msg;
        });
    },
    methods: {
        reload() {
            this.isRouterAlive = false;
            this.$nextTick(function() {
                this.isRouterAlive = true;
            });
        },
        fatherMethod() {
            this.$refs.content.scrollTop = 0;
        }
    }
};
</script>
