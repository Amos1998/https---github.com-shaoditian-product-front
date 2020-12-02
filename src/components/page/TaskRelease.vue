<template>
    <div style="width: 1200px; margin: 0 auto;">
        <div class="crumbs">
            <el-page-header @back="goBack" content="任务创建"> </el-page-header>
        </div>
        <div class="container">
            <div class="form">
                <el-form ref="form" :model="form" label-width="150px">
                    <el-form-item :label="item.name" v-for="item in formData" :key="item.id">
                        <el-input v-model="form[item.keys]" v-if="item.keys != 'count'"></el-input>
                        <el-input-number size="medium" v-model="form[item.keys]" :min="0" :max="activeNum" label="计数" v-else></el-input-number>
                        <span v-if="item.keys == 'count'" style="color:red;margin-left: 10px;">{{ activeNum == 0 ? '提示：没有可用微博账号':''}}</span>
                    </el-form-item>
                    <!-- <el-form-item label="上传留言文件" prop="content" ref="crFile" v-if="isFile">
                        <el-upload
                            ref="editCrfile"
                            :file-list="form.crFile"
                            :data="form"
                            :action="UploadUrl"
                            :auto-upload="false"
                            :on-change="handleChange"
                            accept=".txt"
                            :on-remove="handleRemove"
                            multiple
                            :limit="limit"
                            :on-exceed="handleExceed"
                            :on-success="handleSuccess"
                            :before-upload="beforeUpload"
                        >
                            <i class="el-icon-upload"></i>
                            <div class="el-upload__text">
                                将文件拖到此处，或
                                <em>点击上传</em>
                            </div>
                            <div class="el-upload__tip" slot="tip" style="color:red;">*上传文件 目前仅支持txt格式</div>
                        </el-upload>
                    </el-form-item> -->
                    <el-form-item :label="labelText" prop="content" v-if="isFile">
                        <el-input type="textarea" :rows="10" :placeholder="placeText" v-model="form.content"> </el-input>
                    </el-form-item>
                    <!-- <el-form-item>
                        <el-radio v-model="postTaskData.exec_type" label="2">平台账号密码</el-radio>
                        <el-radio v-model="postTaskData.exec_type" label="1">手机号码</el-radio>
                    </el-form-item> -->
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">立即创建</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <!-- <div v-else>
                <h1>未开放</h1>
            </div> -->
        </div>
    </div>
</template>

<script>
import bus from './../common/bus';
import { getTaskList, getTaskExpandList, postTask, getAccountNum } from './../../api/home';

export default {
    inject: ['reload'],
    data() {
        return {
            name: '',
            title: '',
            appList: [],
            taskList: [],
            UploadUrl: '',
            taskFile: [],
            isFile: false,
            form: {
                count: 0
            },
            labelText:'评论内容',
            placeText:
                '每行代表一条评论,自定义评论要求：每行最多130字，\n自动维护自定义评论内容单次最多填写5千行，超过内容自动截断；\n购买数量>自定义评论数量，会自动循环代粘贴至输入数量，\n反之则会代删除评论数量。\n评论内容不能重复',
            limit: 1,
            num: 1,
            appType: {
                type: '',
                id: ''
            },
            taskType: {
                type: '',
                id: ''
            },
            postTaskData: {
                android_app_id: '',
                function_id: '',
                quantity: 1,
                status: 0,
                script_url: '',
                app_url: '',
                content: '',
                exec_type: '2',
                script_pkg_name: '',
                app_pkg_name: ''
            },
            testFrom: [],
            totalNum: 0,
            activeNum: 0,
        };
    },
    activated() {
        this.getNum()
    },
    mounted() {
        // console.log(this.$route);
        let content = JSON.parse(this.$route.query.content);
        let appType = JSON.parse(this.$route.query.index);

        this.postTaskData.app_pkg_name = appType.app_pkg_name;
        this.postTaskData.app_url = appType.url;
        this.postTaskData.android_app_id = appType.id;

        this.postTaskData.script_pkg_name = content.script_pkg_name;
        this.postTaskData.script_url = content.url;
        this.postTaskData.function_id = content.id;

        this.name = this.$route.params.name;
        this.title = this.$route.params.title;

        if (this.title.search('发布') == -1) {
            this.placeText =
                '每行代表一条评论,自定义评论要求：每行最多130字，\n自动维护自定义评论内容单次最多填写5千行，超过内容自动截断；\n购买数量>自定义评论数量，会自动循环代粘贴至输入数量，\n反之则会代删除评论数量。\n评论内容不能重复';
            this.labelText='评论内容'
        } else {
            this.placeText = '发布内容';
            this.labelText='微博内容'
        }

        this.getData(content.id);
    },
    computed: {
        //显示上传留言文件
        formData: function() {
            let that = this;
            let res = this.testFrom.filter(function(param) {
                if (param.keys == 'content') {
                    that.isFile = true;
                }
                return param.keys != 'content';
            });
            return res;
        }
    },
    watch: {
        $route: function(newVal, oldVal) {
            if (this.$route.path.indexOf('/taskRelease') != -1) {
                this.isFile = false;
                let content = JSON.parse(newVal.query.content);
                let appType = JSON.parse(newVal.query.index);

                this.postTaskData.app_pkg_name = appType.app_pkg_name;
                this.postTaskData.app_url = appType.url;
                this.postTaskData.android_app_id = appType.id;

                this.postTaskData.script_pkg_name = content.script_pkg_name;
                this.postTaskData.script_url = content.url;
                this.postTaskData.function_id = content.id;

                this.name = this.$route.params.name;
                this.title = this.$route.params.title;

                if (this.title.search('发布') == -1) {
                    this.placeText =
                        '每行代表一条评论,自定义评论要求：每行最多130字，\n自动维护自定义评论内容单次最多填写5千行，超过内容自动截断；\n购买数量>自定义评论数量，会自动循环代粘贴至输入数量，\n反之则会代删除评论数量。\n评论内容不能重复';
                    this.labelText='评论内容'
                } else {
                    this.placeText = '发布内容';
                    this.labelText='微博内容'
                }
                this.getData(content.id);
            }
        }
    },
    methods: {
        goBack() {
            this.form = {
                count: 0
            };
            this.$router.go(-1); //返回上一层
        },
        changeNum(currentValue, oldValue){
            console.log(currentValue)
            console.log(oldValue)
        },
        //围脖账号信息
        getNum() {
            getAccountNum().then(res => {
                let data = res.data;
                if (data.code == 0) {
                    this.activeNum = data.data.count;
                    this.totalNum = data.data.sum;
                } else if (data.code == 4200) {
                    this.$message.warning('请重新登陆');
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(res.msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
        },
        //
        selExist(params) {
            params.some((item, index) => {
                console.log(item.sub);
            });
        },
        //限制上传文件个数
        handleExceed(files, fileList) {
            this.$message.warning(`最多上传 ${this.limit} 个文件`);
        },
        //移除上传文件
        handleRemove(file, fileList) {
            for (var i = 0; i < this.fileList.length; i++) {
                if (this.fileList[i].uid == file.uid) {
                    this.fileList.splice(i, 1);
                    break;
                }
            }
        },
        getData(id) {
            getTaskExpandList(id).then(res => {
                // console.log(res);
                let data = res.data;
                if (data.code == 0) {
                    if (data.data.length != 0) {
                        this.testFrom = data.data;
                    } else {
                        this.testFrom = [];
                        bus.$emit('closeIndex');
                        console.log('关闭');
                    }
                } else if (data.code == 4200) {
                    this.$message.warning('请重新登陆');
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(res.msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
        },
        //规定上传文件的格式
        beforeUpload(file) {
            console.log(file);
            var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1);
            const extension = testmsg === 'txt';
            if (!extension) {
                this.$message({
                    message: '上传文件只能是 txt格式!',
                    type: 'warning'
                });
            }
            return extension;
        },
        // 上传测试文件
        handleSuccess(res) {
            if (res.code == 0) {
                this.$message.success('上传成功');
                this.form.crFile = [];
            } else if (res.code == 4200) {
                this.$message.warning('请重新登陆');
                this.$router.push({ path: '/login' });
            } else {
                this.$alert(res.msg, '提示', {
                    confirmButtonText: '确定'
                });
            }
        },
        handleChange(file) {
            let reader = new FileReader();
            if (typeof FileReader === 'undefined') {
                this.$message({
                    type: 'info',
                    message: '您的浏览器不支持文件读取。'
                });
                return;
            }
            reader.readAsText(file.raw, 'utf-8');
            var _this = this;
            reader.onload = function(e) {
                _this.textInfo = e.target.result;
                _this.form['content'] = e.target.result;
            };
        },
        async onSubmit() {
            if(this.activeNum == 0){
                this.$message.warning('没有可用微博账号!');
                return;
            }
            if(this.form.count == 0 ){
                this.$message.warning('数量不能为0');
                return;
            }
            this.postTaskData.quantity = this.form.count;
            // this.form.count = this.num
            if (Object.keys(this.form).length == this.testFrom.length) {
                if (
                    this.title.search('留言') == 0 &&
                    this.form.content.replace(/(^\s*)|(\s*$)/g, '').split('\n').length != this.form.count
                ) {
                    this.$message.warning('评论文字行数应与评论数量相同！');
                    return;
                }
                this.postTaskData.content = JSON.stringify(this.form);
                await postTask(this.postTaskData).then(res => {
                    let data = res.data;
                    // console.log(data);
                    if (data.code == 0) {
                        this.$message.success('发布成功');
                        this.form = {
                            count: 1
                        };
                        let that = this;
                        setTimeout(() => {
                            this.$router.push({
                                path: '/taskTableT'
                            });
                            this.reload();
                        }, 1800);
                    } else if (data.code == 4200) {
                        this.$message.warning('请重新登陆');
                        this.$router.push({ path: '/login' });
                    } else {
                        this.$alert(data.msg, '提示', {
                            confirmButtonText: '确定'
                        });
                    }
                });
            } else {
                this.$message.warning('请填写完整信息');
            }
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}
.form {
    width: 550px;
}
</style>
<style>
@import '../../../node_modules/element-ui/lib/theme-chalk/index.css';
.el-textarea .el-textarea__inner {
    resize: none;
}
</style>