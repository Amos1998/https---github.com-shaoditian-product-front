<template>
    <div style="width: 1200px; margin: 0 auto;">
        <div class="crumbs">
            <el-page-header @back="goBack" content="阿法猪订单列表"> </el-page-header>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.keyword" placeholder="微博链接" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <el-table-column prop="id" label="ID" align="center"></el-table-column>
                <el-table-column label="订单类型 / 商品名称" width="280px" align="center">
                    <template slot-scope="scope">
                        <div>{{ scope.row.goods_name }}</div>
                        <div>订单号：{{ scope.row.order_id }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="订单内容" width="300px" align="center">
                    <template slot-scope="scope">
                        <div>昵称：{{ scope.row.weibo_nickname }}</div>
                        <div>内容：{{ scope.row.content }}</div>
                        <p v-for="(item, index) in scope.row.contents" :key="index">
                            {{ item }}
                        </p>
                    </template>
                </el-table-column>
                <el-table-column label="已加/总量/剩余" align="center">
                    <template slot-scope="scope">
                        <div v-if="scope.row.goods_id == 1258">
                            <p>{{ scope.row.finish_number + '/' + scope.row.number * 100 }}</p>
                            <p>
                                剩余：{{
                                    scope.row.number * 100 - scope.row.finish_number > 0
                                        ? scope.row.number * 100 - scope.row.finish_number
                                        : 0
                                }}
                            </p>
                        </div>
                        <div v-else>
                            <p>{{ scope.row.finish_number + '/' + scope.row.number }}</p>
                            <p>
                                剩余：{{ scope.row.number - scope.row.finish_number > 0 ? scope.row.number - scope.row.finish_number : 0 }}
                            </p>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="订单状态" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status == 3 ? 'success' : scope.row.status == 5 ? 'warning' : ''">
                            {{
                                scope.row.status == 3
                                    ? '已完成'
                                    : scope.row.status == 5
                                    ? '异常信息'
                                    : scope.row.status == 1
                                    ? '等待中'
                                    : scope.row.status == 2
                                    ? '审核中'
                                    : '排队'
                            }}
                        </el-tag>
                        <el-button size="mini" style="margin-top: 10px" @click="open((scope.$index, scope.row))">查询详情</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="执行时间" width="210px" align="left">
                    <template slot-scope="scope">
                        <div>开始：{{ scope.row.create_time }}</div>
                        <div>更新{{ scope.row.update_time }}</div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.current_page"
                    :page-size="query.size"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
        <div>
            <el-dialog title="查看详情" class="dialog" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false">
                <div v-if="dialogInfo.goods_id != 1543">
                    <p>开始数量：{{ this.dialogInfo.start_number }}</p>
                    <p>当前数量：{{ this.dialogInfo.finish_number }}</p>
                    <p>
                        下单内容：<span v-for="(item, i) in dialogInfo.contents" :key="i">{{ item }} &nbsp;&nbsp;</span>
                    </p>
                </div>
                <div v-else>
                    <p v-for="(item, index) in newInfo" :key="index">{{ item.card }}</p>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { orderManagement, orderInfo } from './../../api/home';

export default {
    data() {
        return {
            query: {
                user_id: JSON.parse(localStorage.getItem('user')).user_id,
                current_page: 1,
                keyword: '',
                size: 10,
                keyword_type: 'url',
                status: ''
            },
            tableData: [],
            pageTotal: 0,
            dialogVisible: false,
            dialogInfo: {},
            newInfo: {},
            timer: '',
            num: 0
        };
    },
    mounted() {},
    beforeRouteLeave(to, form, next) {
        this.num = 0
        clearInterval(this.timer);
        next()
    },
    activated() {
        this.num = 0
        clearInterval(this.timer);
        let that = this;
        this.timer = setInterval(() => {
            that.num = that.num + 1;
            that.getData();
        }, 1000);
    },
    methods: {
        goBack() {
            clearInterval(this.timer);
            this.$router.push({ path: '/featuresList' }); //返回首页
        },
        open(index) {
            this.dialogInfo = index;
            if (index.goods_id == 1543) {
                orderInfo(index).then(res => {
                    let data = res.data;
                    if (data.error_code == 0) {
                        this.newInfo = data.data;
                    } else {
                        this.$alert(data.error_msg, '提示', {
                            confirmButtonText: '确定'
                        });
                    }
                });
            }
            this.dialogVisible = true;
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            orderManagement(this.query).then(res => {
                let data = res.data;
                if (data.error_code == 0) {
                    if (this.num == 1) {
                        this.$message.success('成功获取数据');
                    }
                    this.tableData = data.data.data;
                    this.pageTotal = data.data.total;
                } else {
                    clearInterval(this.timer);
                    this.$alert(data.error_msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
        },
        // 触发搜索按钮
        handleSearch() {
            // let vaule = this.getTime(this.query.data)
            // console.log(vaule)
            this.$set(this.query, 'page', 1);
            this.getData();
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'current_page', val);
            this.getData();
            this.$emit('fatherMethod');
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.dialog p {
    font-size: 18px;
    line-height: 28px;
}
</style>