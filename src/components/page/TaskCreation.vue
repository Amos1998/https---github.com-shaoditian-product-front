<template>
    <div style="width:1200px;margin:0 auto;">
        <div class="crumbs">
            <el-page-header @back="goBack" content="任务创建"> </el-page-header>
        </div>
        <div
            class="container"
            v-loading.lock="loading"
            element-loading-text="运行中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.1)"
        >
            <el-form ref="form" :model="form" label-width="150px" :rules="rules">
                <el-form-item :label="urlText" prop="url" v-if="isUrl">
                    <el-input v-model.trim="form.url" :placeholder="urlPlace"></el-input>
                </el-form-item>
                <el-form-item label="分类主题" prop="category_theme" v-if="isTheme">
                    <el-input
                        v-model.trim="form.category_theme"
                        placeholder="防重复投放博主标记：同类内容禁止投放相同博主需进行相同标记"
                    ></el-input>
                </el-form-item>
                <el-form-item label="评论内容" v-if="isFile" prop="comment_data">
                    <el-input
                        style="width: 95%;"
                        type="textarea"
                        :rows="10"
                        placeholder="每行代表一条评论，自定义评论要求：每行最多130字，
自动维护自定义评论内容单次最多填写5千行，超过内容自动截断；
购买数量>自定义评论数量，会自动循环代粘贴至输入数量，
反之则会代删除评论数量。
评论内容不能重复"
                        v-model="form.comment_data"
                        @keydown.native="listen($event)"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item label="批量博文链接" v-if="!isUrl" prop="batchUrl">
                    <el-input
                        style="width: 95%;"
                        type="textarea"
                        :rows="10"
                        placeholder="多条链接请换行，格式：
https://xxxx.xxx/xxxxxxxxxxxxxxxxx"
                        v-model="form.batchUrl"
                        @keydown.native="listen($event)"
                    >
                    </el-input>
                </el-form-item>
                <el-form-item label="购买数量">
                    <el-input-number size="medium" v-model="form.number" :min="minNum" label="计数"></el-input-number>
                    <span> {{ this.isHundred ? '百' : '个' }}</span> 
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">立即创建</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { wbLike, firstComment, firstCommentLike, WbRelease } from './../../api/home';

export default {
    data() {
        return {
            loading: false,
            urlText: '博文地址',
            urlPlace: '示例：http://weibo.com/2455270935/GBm3CuIHU',
            minNum: 1,
            form: {
                goods_id: '',
                url: '',
                number: '',
                comment_data: '',
                batchUrl: '',
                category_theme: ''
            },
            rules: {
                url: [{ required: true, message: '地址链接不能为空', trigger: 'blur' }],
                comment_data: [{ required: true, message: '评论内容不能为空', trigger: 'blur' }],
                batchUrl: [{ required: true, message: '批量地址链接不能为空', trigger: 'blur' }],
                category_theme: [{ required: true, message: '分类主题不能为空', trigger: 'blur' }]
            },
            numArr: 10,
            isFile: false,
            isHundred: false,
            isUrl: true,
            isTheme: false
        };
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            // 通过 `vm` 访问组件实例
            vm.form={
            goods_id: '',
            url: '',
            number: '',
            comment_data: '',
            batchUrl: '',
            category_theme: ''
        }
            // console.log(this.$route.query.Id)
        vm.form.goods_id = vm.$route.query.Id;
        // console.log(vm.form)
        if (vm.$route.query.Id == 1482) {
            vm.isFile = true;
        } else {
            vm.isFile = false;
        }

        if (vm.$route.query.Id == 1258) {
            vm.isHundred = true;
        } else {
            vm.isHundred = false;
        }

        if (vm.$route.query.Id == 1685) {
            vm.urlText = '评论赞网址/ID';
            vm.urlPlace =
                '支持多个格式  例如：HnvCMnIFt ,1234567891234567 ,http://service.account.weibo.com/reportspam?rid=HnvCMnIFt&type=2&url=&bottomnav=1&wvr=6';
            vm.minNum = 10;
        } else {
            vm.urlText = '博文地址';
            vm.urlPlace = '示例：http://weibo.com/2455270935/GBm3CuIHU';
            vm.minNum = 1;
        }

        if (vm.$route.query.Batch == 'true' || vm.$route.query.Batch == true) {
            vm.isUrl = false;
        } else {
            vm.isUrl = true;
        }

        if (vm.$route.query.Id == 1543) {
            vm.isTheme = true;
        } else {
            vm.isTheme = false;
        }
        });
    },
    created() {
        // console.log(this.$route.query.Id)
        this.form={
            goods_id: '',
            url: '',
            number: '',
            comment_data: '',
            batchUrl: '',
            category_theme: ''
        }
        this.form.goods_id = this.$route.query.Id;
        // console.log(this.form)
        if (this.$route.query.Id == 1482) {
            this.isFile = true;
        } else {
            this.isFile = false;
        }

        if (this.$route.query.Id == 1258) {
            this.isHundred = true;
        } else {
            this.isHundred = false;
        }

        if (this.$route.query.Id == 1685) {
            this.urlText = '评论赞网址/ID';
            this.urlPlace =
                '支持多个格式  例如：HnvCMnIFt ,1234567891234567 ,http://service.account.weibo.com/reportspam?rid=HnvCMnIFt&type=2&url=&bottomnav=1&wvr=6';
            this.minNum = 10;
        } else {
            this.urlText = '博文地址';
            this.urlPlace = '示例：http://weibo.com/2455270935/GBm3CuIHU';
            this.minNum = 1;
        }

        if (this.$route.query.Batch == 'true' || this.$route.query.Batch == true) {
            this.isUrl = false;
        } else {
            this.isUrl = true;
        }

        if (this.$route.query.Id == 1543) {
            this.isTheme = true;
        } else {
            this.isTheme = false;
        }
    },
    methods: {
        goBack() {
            // this.$refs['form'].resetFields();
            this.$router.go(-1); //返回上一层
        },
        //换行
        listen(event) {
            if (event.keyCode === 13) {
                // event.preventDefault(); // 阻止浏览器默认换行操作
                return false;
            }
        },
        //评论
        comment(form, isOver) {
            firstComment(form).then(res => {
                let data = res.data;
                if (data.error_code === 0) {
                    if (isOver) {
                        this.loading = false;
                        this.$message.success('创建成功');
                        let that = this;
                        setTimeout(() => {
                            that.$router.push({
                                path: '/taskTable'
                            });
                        }, 1800);
                    }
                } else {
                    this.loading = false;
                    this.$message.error(data.error_msg);
                }
            });
        },
        //发布
        release(form, isOver) {
            WbRelease(form).then(res => {
                let data = res.data;
                if (data.error_code === 0) {
                    if (isOver) {
                        this.loading = false;
                        this.$message.success('创建成功');
                        let that = this;
                        setTimeout(() => {
                            that.$router.push({
                                path: '/taskTable'
                            });
                        }, 1800);
                    }
                } else {
                    this.loading = false;
                    this.$message.error(data.error_msg);
                }
            });
        },
        onSubmit() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    if (this.form.goods_id == '1258') {
                        //微博点赞
                        this.loading = true;
                        wbLike(this.form).then(res => {
                            let data = res.data;
                            if (data.error_code === 0) {
                                this.loading = false;
                                this.$message.success('创建成功');
                                let that = this;
                                setTimeout(() => {
                                    that.$router.push({
                                        path: '/taskTable'
                                    });
                                }, 1800);
                            } else {
                                this.loading = false;
                                this.$message.error(data.error_msg);
                            }
                        });
                    } else if (this.form.goods_id == '1482') {
                        if (this.$route.query.Batch == 'true' || this.$route.query.Batch == true) {
                            //批量评论
                            this.loading = true;
                            let arr = this.form.batchUrl.split(/[(\r\n)\r\n]+/);
                            for (let i = 0; i < arr.length; i++) {
                                this.form.url = arr[i];
                                this.comment(this.form);
                                if (i == arr.length - 1) {
                                    this.loading = false;
                                    this.$message.success('创建成功');
                                    let that = this;
                                    setTimeout(() => {
                                        that.$router.push({
                                            path: '/taskTable'
                                        });
                                    }, 1800);
                                }
                            }
                        } else {
                            //一级评论
                            this.loading = true;
                            this.comment(this.form, true);
                        }
                    } else if (this.form.goods_id == '1685') {
                        //一级评论点赞
                        this.loading = true;
                        firstCommentLike(this.form).then(res => {
                            let data = res.data;
                            if (data.error_code === 0) {
                                this.loading = false;
                                this.$message.success('创建成功');
                                let that = this;
                                setTimeout(() => {
                                    that.$router.push({
                                        path: '/taskTable'
                                    });
                                }, 1800);
                            } else {
                                this.loading = false;
                                this.$message.error(data.error_msg);
                            }
                        });
                    } else if (this.form.goods_id == '1543') {
                        if (this.$route.query.Batch == 'true' || this.$route.query.Batch == true) {
                            //批量微博发布
                            let arr = this.form.batchUrl.split(/[(\r\n)\r\n]+/);
                            this.loading = true;
                            for (let i = 0; i < arr.length; i++) {
                                this.form.url = arr[i];
                                this.release(this.form);
                                if (i == arr.length - 1) {
                                    this.loading = false;
                                    this.$message.success('创建成功');
                                    let that = this;
                                    setTimeout(() => {
                                        that.$router.push({
                                            path: '/taskTable'
                                        });
                                    }, 1800);
                                }
                            }
                        } else {
                            //单条微博发布
                            this.loading = true;
                            this.release(this.form, true);
                        }
                    }
                } else {
                    return false;
                }
            });
        }
    },
    watch: {
        '$route.query': function(newVal, oldVal) {
            // this.$refs['form'].resetFields();
            this.form.goods_id = newVal.Id;
            if (newVal.Id == 1482) {
                this.isFile = true;
            } else {
                this.isFile = false;
            }

            if (newVal.Id == 1258) {
                this.isHundred = true;
            } else {
                this.isHundred = false;
            }
            if (newVal.Id == 1685) {
                this.urlText = '评论赞网址/ID';
                this.urlPlace =
                    '支持多个格式  例如：HnvCMnIFt ,1234567891234567 ,http://service.account.weibo.com/reportspam?rid=HnvCMnIFt&type=2&url=&bottomnav=1&wvr=6';
                this.minNum = 10;
                this.isUrl = true;
            } else {
                this.isUrl = true;
                this.urlText = '博文地址';
                this.urlPlace = '示例：http://weibo.com/2455270935/GBm3CuIHU';
                this.minNum = 1;
            }

            if (newVal.Batch == 'true' || newVal.Batch == true) {
                this.isUrl = false;
            } else {
                this.isUrl = true;
            }

            if (newVal.Id == 1543) {
                this.isTheme = true;
            } else {
                this.isTheme = false;
            }
        }
    }
};
</script>

<style scoped>
.leftRow {
    background: #f5f5f5;
    display: inline-block;
    height: 202px;
    width: 5%;
}
</style>