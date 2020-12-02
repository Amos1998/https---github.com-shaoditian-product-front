<template>
    <div style="width: 1200px; margin: 0 auto;">
        <div class="crumbs">
            <el-page-header @back="goBack" content="佩奇订单列表"> </el-page-header>
        </div>
        <div class="container">
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
            >
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="app_name" label="App名称" align="center"></el-table-column>
                <el-table-column prop="function_name" label="任务类型" align="center"></el-table-column>
                <el-table-column label="任务数量" align="center">
                    <template slot-scope="scope">
                        <el-tag type="info">{{  scope.row.quantity_finished+'/'+scope.row.quantity }}</el-tag>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="账号类别" align="center">
                    <template slot-scope="scope">
                        {{  scope.row.exec_type == 1 ?'手机号码' : scope.row.exec_type == 2 ? '平台账号密码' : '' }}
                    </template>
                </el-table-column> -->
                <el-table-column label="状态" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status == -1 ? 'danger' : scope.row.status == 0 ? 'warning' : 'success' ">
                            {{ scope.row.status == -1 ? '失败' : scope.row.status == 0 ? '未开始' : scope.row.status == 1 ? '完成' : scope.row.status == 2 ? '执行中' : '' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column :formatter="dateFormatter" prop="created_time" label="生成时间" align="center"></el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.page"
                    :page-size="query.size"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { getTask } from './../../api/home';

export default {
    data() {
        return {
            query: {
                taskType: '',
                name: '',
                status: '',
                data: '',
                page: 1,
                size: 10
            },
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            addVisible: false,
            idx: -1,
            id: -1,
            timer:'',
            num: 0
        };
    },
    mounted() {
    },
    beforeRouteLeave(to, form, next) {
        this.num = 0
        clearInterval(this.timer);
        next()
    },
    activated() {
        let that = this
        this.timer = setInterval(()=>{
            that.num = that.num + 1
            that.getData();
        },1000)
    },
    methods: {
        goBack() {
            this.num = 0
            clearInterval(this.timer)
            this.$router.push({ path: '/featuresList' }); //返回首页
        },
        // 日期格式化
        dateFormatter(row, column) {
            let datetime = row.created_time;
            if (datetime) {
                datetime = new Date(datetime*1000);
                let y = datetime.getFullYear() + '-';
                let mon = datetime.getMonth() + 1 + '-';
                let d = datetime.getDate();
                return y + mon + d;
            }
            return '';
        },
        // 获取 easy-mock 的模拟数据
        getData(num) {
            getTask(this.query).then((res) => {
                let data = res.data;
                // console.log(data);
                if (data.code == 0) {
                    if(this.num == 1){
                        this.$message.success ('成功获取数据');
                    }
                    this.tableData = data.data.data;
                    this.pageTotal = data.data.total;
                } else if (data.code == 4200) {
                    clearInterval(this.timer)
                    this.$message.warning ('请重新登陆');
                    this.$router.push({ path: '/login' });
                } else {
                    clearInterval(this.timer)
                    this.$alert(data.msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
        },
        //修改日期格式
        getTime(value) {
            let year = value.getFullYear(); //年
            let month = value.getMonth() + 1; //月
            let date = value.getDate(); //日
            month = month < 10 ? '0' + month : month;
            date = date < 10 ? '0' + date : date;
            let str = year + '-' + month + '-' + date;
            return str;
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'page', val);
            this.getData();
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
</style>