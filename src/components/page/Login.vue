<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">产品后台</div>
            <!-- 登录 -->
            <div v-show="isLogin">
                <el-form :model="param" :rules="rules" status-icon ref="login" label-width="0px" class="ms-content">
                    <el-form-item prop="account">
                        <el-input v-model.trim="param.account" placeholder="请输入邮箱" clearable>
                            <el-button slot="prepend" icon="el-icon-user-solid"></el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="pwd">
                        <el-input type="password" placeholder="请输入密码" v-model.trim="param.pwd" @keyup.enter.native="submitForm()" clearable>
                            <el-button slot="prepend" icon="el-icon-lock"></el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item style="text-align:center;">
                        <el-button size="medium" style="width:100%;" :disabled="isHit" :type="btnType" @click="verifVisible = true" plain
                            ><i v-show="isHit" class="el-icon-check"></i>{{ verfText }}</el-button
                        >
                    </el-form-item>
                    <div class="login-btn">
                        <el-button type="primary" @click="submitForm(param)">登录</el-button>
                    </div>
                    <!-- <p class="login-tips" @click="isLogin = !isLogin">忘记密码</p> -->
                </el-form>
            </div>
            <!-- 忘记密码 -->
            <div v-show="!isLogin">
                <el-form :model="form" :rules="retrieveRules" status-icon ref="forget" label-width="0px" class="ms-content">
                    <el-form-item prop="phone">
                        <el-input v-model="form.phone" placeholder="请输入手机号" clearable>
                            <el-button slot="prepend" icon="el-icon-mobile-phone"></el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item label prop="code">
                        <div class="verify-wrapper">
                            <el-input
                                type="text"
                                maxlength="6"
                                suffix-icon="el-icon-lock"
                                placeholder="验证码"
                                v-model="form.code"
                                style="width: calc(100% - 110px);"
                                max-length="6"
                                clearable
                            />
                            <el-button class="sendMsg" :disabled="disabled" @click="getCode">{{ valiBtn }}</el-button>
                        </div>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            id="pwd"
                            v-model.trim="form.password"
                            type="password"
                            minlength="10"
                            maxlength="20"
                            placeholder="请输入新密码"
                            clearable
                            @keyup.enter.native="onSubmit()"
                        >
                            <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                        </el-input>
                    </el-form-item>
                    <div class="login-btn">
                        <el-button type="primary" @click="onSubmit()">确定</el-button>
                    </div>
                    <p class="back-tips" @click="isLogin = !isLogin">
                        <i class="el-icon-back">返回</i>
                    </p>
                </el-form>
            </div>
            <!-- 验证弹出框 -->
            <el-dialog
                id="slider"
                title="请拖动下方滑块完成拼图"
                :visible.sync="verifVisible"
                top="25vh"
                width="350px"
                @close="closeVerif"
                :close-on-click-modal="false"
            >
                <div class="dialog">
                    <el-alert v-if="isShow" class="notification" show-icon :title="title" :type="type" :closable="false"> </el-alert>
                    <slide-verify
                        ref="slideblock"
                        @success="onSuccess"
                        @again="onAgain"
                        @fulfilled="onFulfilled"
                        @fail="onFail"
                        @refresh="onRefresh"
                        :slider-text="text"
                        :imgs="imgs"
                        :accuracy="accuracy"
                    ></slide-verify>
                    <div>{{ msg }}</div>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { getLogin, bindAccount } from './../../api/home';
import img0 from './../../assets/img/img6.jpg';
import img1 from './../../assets/img/img1.jpg';
import img2 from './../../assets/img/img2.jpg';
import img3 from './../../assets/img/img3.jpg';
import img4 from './../../assets/img/img4.jpg';
import img5 from './../../assets/img/img5.jpg';
export default {
    data: function() {
        var checkPhone = (rule, value, callback) => {
            const reg = /^0?(13[0-9]|15[012356789]|18[0-9]|14[578]|16[6]|17[035768]|19[19])[0-9]{8}$/;
            if (reg.test(value)) {
                return callback();
            }
            callback('请输入合法的手机号');
        };
        return {
            msg: '',
            text: '向右滑动->',
            imgs: [img0, img1, img2, img3, img4, img5],
            accuracy: 5, // 精确度小，可允许的误差范围小；为1时，则表示滑块要与凹槽完全重叠，才能验证成功。默认值为5
            verifVisible: false,
            isShow: false,
            isHit: false,
            btnType: '',
            title: '验证通过',
            verfText: '点击完成验证',
            type: 'success',
            isLogin: true,
            param: {
                account: '',
                pwd: ''
            },
            rules: {
                account: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { max: 50, message: '邮箱在50字以内', trigger: 'blur' },
                    {
                        pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                        message: '请检查邮箱格式是否正确',
                        trigger: 'blur'
                    }
                ],
                pwd: [{ required: true, message: '请输入密码', trigger: 'blur' }]
            },
            form: {
                phone: '',
                code: '',
                password: ''
            },
            retrieveRules: {
                phone: [{ validator: checkPhone, message: '请输入手机号', required: true, trigger: 'blur' }],
                code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
                password: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    {
                        pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_]).{10,20}$/,
                        message: '请输入长度为10-20位包含数字、字母、特殊字符的密码',
                        trigger: 'blur'
                    }
                ]
            },
            valiBtn: '获取验证码',
            disabled: false
        };
    },
    methods: {
        //登录
        submitForm(param) {
            if (this.isHit) {
                this.$refs.login.validate(valid => {
                    if (valid) {
                        getLogin(param).then(res => {
                            let data = res.data;
                            if (data.code === 0) {
                                this.$message.success('登录成功');
                                localStorage.setItem('Token', data.data.token);
                                let form = data.data.afazhu;
                                if (Object.keys(form).length == 2) {
                                    bindAccount(form.account, form.password).then(res => {
                                        let data = res.data;
                                        if (data.error_code === 0) {
                                            localStorage.setItem('access_token', data.data.access_token);
                                            localStorage.setItem('expires_in', data.data.expires_in);
                                            localStorage.setItem('user', JSON.stringify(data.data.user));
                                        } else {
                                            this.$message.error(data.error_msg);
                                        }
                                    });
                                }
                                this.$router.push('/');
                            } else if (data.code === 4000) {
                                this.$message.error(data.msg);
                            }
                        });
                    } else {
                        this.$message.error('请输入账号和密码');
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        },
        //获取验证码
        //获取验证码 并只验证手机号 是否正确
        getCode() {
            this.$refs['forget'].validateField('phone', err => {
                if (err) {
                    console.log('未通过');
                    return;
                } else {
                    console.log('已通过');
                    this.tackBtn(); //验证码倒数60秒
                    // let fd = new FormData(); //POST 请求需要 转化为Form
                    // fd.append('PhoneNumber', this.form.phone);
                    // fd.append('NeedCheck', 2);
                    // this.$axios({
                    //     method: 'POST',
                    //     data: fd,
                    //     url: '/api/sgsaccount/vcodeget'
                    // }).then((res) => {
                    //     console.log(res);
                    // });
                }
            });
        },
        tackBtn() {
            //验证码倒数60秒
            let time = 60;
            let timer = setInterval(() => {
                if (time == 0) {
                    clearInterval(timer);
                    this.valiBtn = '获取验证码';
                    this.disabled = false;
                } else {
                    this.disabled = true;
                    this.valiBtn = time + '秒后重试';
                    time--;
                }
            }, 1000);
        },
        //设置新密码并登录
        onSubmit(formName) {},
        closeVerif() {
            this.verifVisible = false;
            this.handleClick();
            this.isShow = false;
        },
        //滑动拼图验证
        onSuccess(times) {
            this.isShow = true;
            this.verfText = '验证通过';
            this.title = '验证通过';
            this.type = 'success';
            setTimeout(() => {
                this.isHit = true;
                this.btnType = 'primary';
                this.verifVisible = false;
            }, 2000);
            this.msg = `验证通过, 耗时${(times / 1000).toFixed(1)}s`;
        },
        onFail() {
            this.isShow = true;
            this.title = '验证失败，请重试';
            this.type = 'error';
            setTimeout(() => {
                this.isShow = false;
            }, 800);
            this.msg = '';
        },
        onRefresh() {
            console.log('点击了刷新小图标');
            this.msg = '';
        },
        onFulfilled() {
            console.log('刷新成功啦！');
        },
        onAgain() {
            console.log('检测到非人为操作的哦！');
            this.msg = 'try again';
            // 刷新
            this.handleClick();
        },
        handleClick() {
            this.$refs.slideblock.reset();
            this.msg = '';
        }
    }
};
</script>
<style>
#slider .el-dialog__body {
    padding: 5px 20px 30px;
}
</style>
<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../../assets/img/login-bg.jpg);
    background-size: 100%;
}
.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
}
.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}
.ms-content {
    padding: 30px 30px;
}
.login-btn {
    text-align: center;
    margin-top: 30px;
}
.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}
.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #fff;
    text-align: right;
    cursor: pointer;
}
.back-tips {
    font-size: 22px;
    line-height: 35px;
    color: #fff;
    cursor: pointer;
}
.login-tips:hover,
.back-tips:hover {
    color: #409eff;
}
.sendMsg {
    height: 36px;
    vertical-align: middle;
    width: 100px;
    margin-left: 5px;
    padding: 10px 15px;
}
.el-icon-check {
    font-size: 24px;
    vertical-align: sub;
}
.dialog {
    position: relative;
}
.dialog .notification {
    position: absolute;
    top: -10px;
    z-index: 9999;
}
</style>
