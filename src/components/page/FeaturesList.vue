<template>
    <div class="features">
        <div class="afazhu">
            <el-collapse @change="handleChange">
                <el-collapse-item>
                    <template slot="title">
                        <h2>阿法猪</h2>
                        <span style="margin-left:10px;" :style="message === '正常'?'color:green;':'color:red;'">{{message}}</span>
                        <span style="margin-left:10px;">({{ this.isFold == 0 ? '已折叠' : '已展开' }})</span>
                    </template>
                    <div class="cardList">
                        <div v-for="(item, index) in List" :key="index" class="cardItem">
                            <div>
                                <img :src="item.imgSrc" />
                                <p style="margin: 10px 0;">{{ item.name }}</p>
                                <div style="text-align: center;" @click="item.status == 1 ? jumpTo(item) : ''">
                                    <el-button>{{ item.status == 1 ? '立即使用' : item.status == 1 ? '已下架' : '维护中' }}</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
        <div style="marginTop: 80px;">
            <h2>佩奇</h2>
            <div>
                <div v-for="(item, index) in tableList" :key="index">
                    <h3 v-if="item.sub" style="marginTop: 20px;">{{ item.title }}</h3>
                    <div class="cardList">
                        <div v-for="(val, i) in item.sub" :key="i" class="cardItem">
                            <div>
                                <img src="./../../assets/img/wb.jpg" />
                                <p style="margin: 10px 0;">{{ item.title + val.name }}</p>
                                <div style="text-align: center;">
                                    <el-button v-if="val.sub" @click="jump('taskRelease', item.title, val.name, item, val)"
                                        >立即使用</el-button
                                    >
                                    <el-button v-else disabled>维护中</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { getList, isShelf, getAccountNum } from './../../api/home';
import bus from './../common/bus';
export default {
    data() {
        return {
            totalNum: 0,
            activeNum: 0,
            List: [
                { id: 1258, name: '微博点赞', batch: false, imgSrc: require('../../assets/img/1258.jpeg'), status: 1 },
                { id: 1482, name: '一级评论', batch: false, imgSrc: require('../../assets/img/1482.jpg'), status: 1 },
                { id: 1685, name: '一级评论点赞', batch: false, imgSrc: require('../../assets/img/1685.jpg'), status: 1 },
                { id: 1482, name: '批量微博评论', batch: true, imgSrc: require('../../assets/img/1482.jpg'), status: 1 },
                { id: 1543, name: '微博单条发布', batch: false, imgSrc: require('../../assets/img/1543.jpg'), status: 1 },
                { id: 1543, name: '微博批量发布', batch: true, imgSrc: require('../../assets/img/1543.jpg'), status: 1 }
            ],
            tableList: [],
            isFold: 0,
            message: '正常'
        };
    },
    activated() {
        this.getData();
        this.getNum();
        let that = this
        setTimeout(()=>{
            that.accountInfo()
        },500)
    },
    mounted() {
        this.changeText();
        bus.$on('accountInfo', this.accountInfo)
    },
    methods: {
        handleChange(val) {
            this.isFold = val.length;
        },
        accountInfo () {
            let userInfo = localStorage.getItem('user')
            if (userInfo) {
                    this.message = '正常'
                    if(JSON.parse(userInfo).amount == 0 || JSON.parse(userInfo).amount == '0.00'){
                        this.message = '未充值'
                    }
                } else {
                    this.message = '未绑定'
            }
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
        changeText() {
            this.List.filter(function(param) {
                isShelf(param.id).then(res => {
                    let data = res.data;
                    if (data.error_code === 0) {
                        if (data.data.is_show == 1) {
                            param['status'] = 1;
                            return param;
                        } else if (data.data.is_show == 2) {
                            param['status'] = 2;
                            return param;
                        } else if (data.data.is_show == 3) {
                            param['status'] = 3;
                            return param;
                        }
                    } else {
                        this.$message.error(data.error_msg);
                    }
                });
            });
        },
        //阿法猪跳转
        jumpTo(params) {
            if (localStorage.getItem('user')) {
                isShelf(params.id).then(res => {
                    let data = res.data;
                    if (data.error_code === 0) {
                        if (data.data.is_show == 1) {
                            this.$router.push({ path: '/taskCreation', query: { Id: params.id, Batch: params.batch } });
                        } else if (data.data.is_show == 2) {
                            this.$message.warning('已下架');
                        } else if (data.data.is_show == 3) {
                            this.$message.warning('维护中');
                        }
                    } else {
                        this.$message.error(data.error_msg);
                    }
                });
            } else {
                this.$message.warning('请先绑定阿法猪账号');
            }
        },
        jump(param, name, title, index, content) {
            if (this.sum == 0) {
                this.$message.warning('请先进行微博账号导入');
                let that = this;
                setTimeout(() => {
                    that.$router.push({
                        path: '/appList'
                    });
                }, 1500);
            } else if(this.count == 0){
                this.$message.warning('请先保活微博账号');
                return
            } else {
                this.$router.push({
                    path: '/' + param + '/' + name + '/' + title + '?index=' + JSON.stringify(index) + '&content=' + JSON.stringify(content)
                });
            }
        },
        //获取自己的功能列表
        getData() {
            getList().then(res => {
                let data = res.data;
                if (data.code == 0) {
                    this.tableList = data.data;
                } else if (data.code == 4200) {
                    this.$message.warning('请重新登陆');
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(res.msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
        }
    }
};
</script>
<style scoped>
.features {
    width: 1200px;
    margin: 0 auto;
}
.afazhu h2{
   font-size: 1.8em;
}
.cardList {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.cardItem {
    width: 23%;
    margin: 10px;
    border: 1px solid #ebeef5;
    padding-bottom: 20px;
}
.cardItem:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
}
.cardItem img {
    width: 100%;
}
.cardItem p {
    font-size: 18px;
    text-align: center;
}
.cardItem button {
    width: 80%;
    margin-top: 10px;
}
</style>