<template>
    <div>
        <div class="header">
            <div class="logo"><router-link to="/featuresList" style="color: #fff">产品后台</router-link></div>
            <div class="header-right">
                <div class="header-user-con">
                    <!-- 用户头像 -->
                    <div class="user-avator">
                        <img src="../../assets/img/img.jpg" />
                    </div>
                    <!-- 用户名下拉菜单 -->
                    <el-dropdown class="user-name" trigger="click" @visible-change="changeValue($event)" @command="handleCommand">
                        <span class="el-dropdown-link">
                            {{ username }}
                            <i class="el-icon-caret-bottom"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>
                                <router-link tag="li" to="/appList">微博账号导入</router-link>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <div tag="li" @click="jumpTo('/taskTable')">阿法猪订单列表</div>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <div tag="li" @click="jumpTo('/taskTableT')">佩奇订单列表</div>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <div @click="open">{{ this.title }}</div>
                            </el-dropdown-item>
                            <el-dropdown-item command="loginout" divided>退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>
        <!-- 绑定弹出框 -->
        <el-dialog :title="title" :visible.sync="bindVisible" width="30%" @close="closeBind" :close-on-click-modal="false">
            <el-form ref="bindform" :model="bindform" :rules="rules" label-width="70px">
                <el-form-item label="账号" prop="mobile">
                    <el-input v-model="bindform.mobile"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="bindform.password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveBind">确 定</el-button>
                <el-button @click="closeBind">取 消</el-button>
            </span>
        </el-dialog>
        <!-- 绑定弹出框 -->
        <el-dialog title="OTA导入" :visible.sync="otaVisible" width="30%" @close="closeOTA" :close-on-click-modal="false" class="appOTA">
            <!-- <el-upload
                ref="otaCrfile"
                :auto-upload="false"
                action="#"
                multiple
                :limit="limit"
                :on-exceed="handleExceed"
                :on-success="handleSuccess"
                :on-change="handleChange"
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    将文件拖到此处，或
                    <em>点击上传</em>
                </div>
            </el-upload> -->
            <input id="fileSelector" type="file" />
            <div id="msg"></div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveOTA">确 定</el-button>
                <el-button @click="closeOTA">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import bus from '../common/bus';
import COS from 'cos-js-sdk-v5';
import SparkMD5 from 'spark-md5';
import CryptoJS from 'crypto-js';
import { bindAccount, editAccount, addOTA } from './../../api/home';
import { encryptDes, decryptDes, generatekey } from '@/assets/js/aes';

export default {
    data() {
        return {
            collapse: false,
            fullscreen: false,
            name: '管理员',
            title: '绑定afagou账号',
            message: 2,
            bindVisible: false,
            otaVisible: false,
            bindform: {
                mobile: '',
                password: ''
            },
            rules: {
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    {
                        pattern: /^0?(13[0-9]|15[012356789]|18[0-9]|14[578]|16[6]|17[035768]|19[19])[0-9]{8}$/,
                        message: '请检查手机号格式是否正确',
                        trigger: 'blur'
                    }
                ],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
            },
            File: [],
            limit: 1,
            md5: ''
        };
    },
    created() {},
    computed: {
        username() {
            let username = localStorage.getItem('ms_username');
            return username ? username : this.name;
        }
    },
    methods: {
        changeValue(callback) {
            if (callback) {
                if (localStorage.getItem('user')) {
                    this.title = '修改afazhu账号';
                } else {
                    this.title = '绑定afazhu账号';
                }
            }
        },
        test() {
            // var keys = generatekey(16);

            //如果是对象/数组的话，需要先JSON.stringify转换成字符串

            var encrypts = encryptDes(JSON.stringify({"version":"201"}), '46049dc5efcda0387fd89a31a28bf557');

            var dess = JSON.parse(decryptDes(encrypts, '46049dc5efcda0387fd89a31a28bf557'));
            // var encrypts = that.$encrypt('1234asdasd',keys);

            // var dess = that.$decrypt(encrypts,keys);
            console.log(encrypts);
            console.log(encrypts.length);
            console.log(dess);
        },
        jumpTo(param) {
            if (param != '/taskTable') {
                this.$router.push({ path: param });
            } else {
                if (localStorage.getItem('user')) {
                    this.$router.push({ path: '/taskTable' });
                } else {
                    this.$message.warning('请先绑定阿法猪账号');
                }
            }
        },
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command == 'loginout') {
                localStorage.clear();
                this.$router.push('/login');
            }
        },
        //app-ota导入
        saveOTA() {
            let file = document.getElementById('fileSelector').files[0];
            console.log(file);
            this.File = file;
            if (!file) {
                document.getElementById('msg').innerText = '未选择上传文件';
                return;
            }

            document.getElementById('msg').innerText = '';
            const _this = this;
            let fileReader = new FileReader();
            console.log(fileReader);
            //此处打印file可看到file下的raw为文件属性
            let dataFile = file;
            let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
            let spark = new SparkMD5.ArrayBuffer();
            //获取文件二进制数据
            fileReader.readAsArrayBuffer(dataFile);

            //异步执行函数
            fileReader.onload = function(e) {
                spark.append(e.target.result);
                _this.md5 = spark.end();
                console.log(_this.md5);
                let Base64 = require('js-base64').Base64;
                let name = file.name.split('.')[0];
                console.log(name);

                try {
                    let baseresult = Base64.decode(name);
                    let key = _this.md5;
                    let bytes = CryptoJS.AES.decrypt(baseresult, key);
                    let originalText = bytes.toString(CryptoJS.enc.Utf8);
                    let jsonResult = JSON.parse(originalText);
                    _this.version = jsonResult.version;
                    console.log(jsonResult.version);
                } catch (err) {
                    _this.$message.error('请检查文件重试！');
                    return;
                }

                let that = this;

                file &&
                    _this.uploadFile(file, function(err, data) {
                        console.log(err || data);
                        if (err) {
                            _this.$message.error('上传失败');
                        } else if (data) {
                            let form = {
                                name: Date.parse(new Date()),
                                url: 'https://store-1304115265.cos.ap-hongkong.myqcloud.com/' + data.url.split('/api')[1],
                                version: _this.version,
                                md5: _this.md5
                            };
                            console.log(form);
                            _this.$message.success('上传成功，ETag=' + data.ETag + ' URL=' + data.url);
                            addOTA(form).then(res => {
                                let data = res.data;
                                if (data.code == 0) {
                                } else if (data.code == 4200) {
                                    this.$router.push({ path: '/login' });
                                } else {
                                    this.$alert(data.msg, '提示', {
                                        confirmButtonText: '确定'
                                    });
                                }
                            });
                            _this.otaVisible = false;
                        }
                    });
            };
        },
        // 计算签名
        getAuthorization(options, callback) {
            // 前端使用固定密钥计算签名（适用于前端调试，为了安全性，建议使用临时密钥生成签名）
            // 临时密钥参考链接：https://github.com/tencentyun/cos-js-sdk-v5
            let authorization = COS.getAuthorization({
                SecretId: 'AKIDg7IF2gm95nFjx0BLBYib7lAJEtwlP0Ti', // 你的固定密钥SecretId，需修改
                SecretKey: '92elfJgmW2LNFuKSXR6VdhphIcfSzFDr', // 你的固定密钥SecretKey，需修改
                Method: options.Method,
                Key: options.Key,
                Query: options.Query,
                Headers: options.Headers
            });
            callback(null, {
                Authorization: authorization
            });
        },
        // 上传文件
        uploadFile(file, callback) {
            // 请求用到的参数
            let prefix = '/api/';

            let Key = 'droid-ota/outdoor/' + file.name; // 这里指定上传目录和文件名，可根据情况修改
            this.getAuthorization({ Method: 'get', Key: Key }, function(err, info) {
                if (err) {
                    alert(err);
                    return;
                }
                let auth = info.Authorization;
                //let XCosSecurityToken = info.XCosSecurityToken; // 使用固定密钥不需要此参数，临时密钥才需要
                let url = prefix + Key;
                let xhr = new XMLHttpRequest();
                xhr.open('post', url, true);
                xhr.setRequestHeader('Authorization', auth);
                //XCosSecurityToken && xhr.setRequestHeader('x-cos-security-token', XCosSecurityToken); // 使用固定密钥不需要此参数，临时密钥才需要
                xhr.onload = function() {
                    console.log(xhr);
                    if (xhr.status === 200 || xhr.status === 206) {
                        let ETag = xhr.getResponseHeader('etag');
                        callback(null, { url: url, ETag: ETag });
                    } else {
                        callback('文件 ' + Key + ' 上传失败，状态码：' + xhr.status);
                    }
                };
                xhr.onerror = function() {
                    callback('文件 ' + Key + ' 上传失败，请检查是否没配置 CORS 跨域规则');
                };
                xhr.send(file);
            });
        },
        //限制上传文件个数
        handleExceed(files, fileList) {
            this.$message.warning(`最多上传 ${this.limit} 个文件`);
        },
        // 封面上传
        handleSuccess(res) {
            // console.log(res);
        },
        openOTA() {
            this.otaVisible = true;
        },
        closeOTA() {
            let file = document.getElementById('fileSelector').files[0];
            this.otaVisible = false;
        },
        //AFAZHU账号绑定
        saveBind() {
            this.$refs['bindform'].validate(valid => {
                if (valid) {
                    bindAccount(this.bindform.mobile, this.bindform.password).then(res => {
                        let data = res.data;
                        // console.log(res);
                        if (data.error_code == 0) {
                            localStorage.setItem('access_token', data.data.access_token);
                            localStorage.setItem('expires_in', data.data.expires_in);
                            localStorage.setItem('user', JSON.stringify(data.data.user));
                            editAccount(this.bindform).then(res => {
                                let data = res.data;
                                if (data.code == 0) {
                                    this.title = '修改afazhu账号';
                                    this.$message.success('绑定成功');
                                    bus.$emit('accountInfo');
                                } else if (data.code == 4200) {
                                    this.$message.warning('请重新登陆');
                                    this.$router.push({ path: '/login' });
                                } else {
                                    this.$alert(res.msg, '提示', {
                                        confirmButtonText: '确定'
                                    });
                                }
                            });
                            this.bindVisible = false;
                        } else {
                            this.$message.error(data.error_msg);
                        }
                    });
                } else {
                    this.$message.error('请输入账号和密码');
                    return false;
                }
            });
        },
        open() {
            this.bindVisible = true;
        },
        closeBind() {
            this.bindVisible = false;
            this.$refs['bindform'].resetFields();
        }
    },
    mounted() {}
};
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;
    color: #fff;
}
.collapse-btn {
    float: left;
    padding: 0 21px;
    cursor: pointer;
    line-height: 70px;
}
.header .logo {
    float: left;
    width: 250px;
    line-height: 70px;
    text-align: center;
}
.header-right {
    float: right;
    padding-right: 50px;
}
.header-user-con {
    display: flex;
    height: 70px;
    align-items: center;
}
.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
}
.btn-bell-badge {
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}
.btn-bell .el-icon-bell {
    color: #fff;
}
.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 20px;
}
.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: #fff;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
</style>
