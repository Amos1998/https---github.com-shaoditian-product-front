<template>
    <div style="width: 1200px; margin: 0 auto;">
        <div class="crumbs">
            <el-page-header @back="goBack" content="OTA管理"> </el-page-header>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
            >
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="name" label="名称" align="center"></el-table-column>
                <el-table-column prop="version" label="版本号" align="center"></el-table-column>
                <el-table-column prop="appName" label="APP类别" align="center"></el-table-column>
                <el-table-column prop="channel" label="渠道" align="center"></el-table-column>
                <el-table-column prop="url" label="脚本地址" align="center"></el-table-column>
                <el-table-column prop="desc" label="脚本描述" align="center"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status == 1 ? 'success' : scope.row.status == 0 ? 'danger' : ''">{{
                            scope.row.status == 1 ? '正常' : scope.row.status == 0 ? '下架' : ''
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column :formatter="dateFormatter" prop="created_time" label="创建时间" align="center"></el-table-column>
                <el-table-column label="操作" min-width="250" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="success " icon="el-icon-s-promotion" @click="handlePush(scope.$index, scope.row)">推送</el-button>
                    </template>
                </el-table-column>
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

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @close="closeEdit" :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="用户名" prop="name">
                    <el-input v-model.trim="form.name"></el-input>
                </el-form-item>
                <el-form-item label="版本号" prop="version">
                    <el-input v-model="form.version"></el-input>
                </el-form-item>
                <el-form-item label="APP类别" prop="android_app_id">
                    <el-select v-model="form.android_app_id" placeholder="请选择" class="handle-select mr10">
                        <el-option v-for="(item, index) in appList" :key="index" :label="item.app_pkg_name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="渠道" prop="channel">
                    <el-input type="number" v-model="form.channel"></el-input>
                </el-form-item>
                <el-form-item label="脚本地址" prop="url">
                    <el-input v-model="form.url"></el-input>
                </el-form-item>
                <el-form-item label="脚本描述" prop="desc">
                    <el-input v-model="form.desc"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status" required>
                    <el-switch
                        v-model="form.status"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        active-text="正常"
                        inactive-text="下架"
                        :active-value="1"
                        :inactive-value="0"
                    ></el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveEdit">确 定</el-button>
                <el-button @click="closeEdit">取 消</el-button>
            </span>
        </el-dialog>

        <!-- 新增弹出框 -->
        <el-dialog title="新增用户" :visible.sync="addVisible" width="30%" @close="closeAdd" :close-on-click-modal="false">
            <el-form ref="addFrom" :model="addFrom" :rules="rules" label-width="80px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model.trim="addFrom.name"></el-input>
                </el-form-item>
                <el-form-item label="版本号" prop="version">
                    <el-input v-model="addFrom.version"></el-input>
                </el-form-item>
                <el-form-item label="APP类别" prop="android_app_id">
                    <el-select v-model="addFrom.android_app_id" placeholder="请选择" class="handle-select mr10">
                        <el-option v-for="(item, index) in appList" :key="index" :label="item.app_pkg_name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="渠道" prop="channel">
                    <el-input type="number" v-model="addFrom.channel"></el-input>
                </el-form-item>
                <el-form-item label="脚本地址" prop="url">
                    <el-input v-model="addFrom.url"></el-input>
                </el-form-item>
                <el-form-item label="脚本描述" prop="desc">
                    <el-input v-model="addFrom.desc"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status" required>
                    <el-switch
                        v-model="addFrom.status"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        active-text="正常"
                        inactive-text="下架"
                        :active-value="1"
                        :inactive-value="0"
                    ></el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveAdd">确 定</el-button>
                <el-button @click="closeAdd">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { baseURL } from './../../api/url';
import { getAppOtaList, getTerraceList, addAppOtaList, editAppOtaList, pushAppOtaList } from './../../api/home';

export default {
    name: 'basetable',
    data() {
        return {
            loading: true,
            query: {
                email: '',
                name: '',
                page: 1,
                size: 9
            },
            exQuery: {
                size: 300,
                page: 1
            },
            appList: [],
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            addVisible: false,
            addFrom: {
                status: 1,
                mobile: '',
                email: '',
                name: '',
                channel: '',
                android_app_id: ''
            },
            pwdVisible: false,
            pwdform: {
                id: '',
                pwd: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 20, message: '名称在20字以内', trigger: 'blur' }
                ],
                channel: [{ required: true, message: '请输入渠道', trigger: 'blur' }],
                url: [
                    { required: true, message: '请输入脚本地址', trigger: 'blur' },
                    { min: 1, max: 100, message: '脚本地址在100字以内', trigger: 'blur' }
                ],
                desc: [
                    { required: true, message: '请输入脚本描述', trigger: 'blur' },
                    { min: 1, max: 50, message: '脚本描述在50字以内', trigger: 'blur' }
                ],
                version: [
                    { required: true, message: '请输入版本号', trigger: 'blur' },
                    { min: 1, max: 10, message: '版本号在10字以内', trigger: 'blur' }
                ],
                android_app_id: [{ required: true, message: '不能为空', trigger: 'change' }]
            },
            idx: -1,
            id: -1
        };
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            // 通过 `vm` 访问组件实例
            vm.query.page = 1;
            vm.getData();
        });
    },
    methods: {
        goBack() {
            this.$router.go(-1); //返回上一层
        },
        // 日期格式化
        dateFormatter(row, column) {
            let datetime = row.created_time;
            if (datetime) {
                datetime = new Date(datetime * 1000);
                let y = datetime.getFullYear() + '-';
                let mon = datetime.getMonth() + 1 + '-';
                let d = datetime.getDate();
                return y + mon + d;
            }
            return '';
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            getTerraceList(this.exQuery).then(res => {
                let data = res.data;
                if (data.code == 0) {
                    this.appList = data.data;
                } else if (data.code == 4200) {
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(res.msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
            getAppOtaList(this.query).then(res => {
                let data = res.data;
                if (data.code == 0) {
                    let arr = data.data.data;
                    for(let i=0; i < arr.length;i++){
                        this.appList.filter(item => {
                            if(item.id == arr[i].android_app_id){
                                arr[i]['appName'] = item.app_pkg_name
                                if(i == arr.length -1 ){
                                    this.tableData = arr
                                }
                            }
                        })
                    }
                    this.pageTotal = data.data.total;
                } else if (data.code == 4200) {
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(res.msg, '提示', {
                        confirmButtonText: '确定'
                    });
                }
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },
        // 新增操作
        handleAdd() {
            this.addVisible = true;
        },
        // 保存新增
        saveAdd() {
            console.log(this.addFrom);
            this.$refs['addFrom'].validate(valid => {
                if (valid) {
                    addAppOtaList(this.addFrom).then(res => {
                        let data = res.data;
                        console.log(data);
                        if (data.code == 0) {
                            this.getData();
                            this.addVisible = false;
                            this.$message.success('添加成功');
                        } else if (data.code == 4200) {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    this.$router.push({ path: '/login' });
                                }
                            });
                        } else {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        //取消添加
        closeAdd() {
            this.addVisible = false;
            this.$refs['addFrom'].resetFields();
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = row;
            this.editVisible = true;
        },
        //推送操作
        handlePush(index, row) {
            this.$confirm('是否确定推送该版本?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    pushAppOtaList(row).then(res => {
                        let data = res.data;
                        if (data.code == 0) {
                            this.$message.success(data.msg);
                        } else if (data.code == 4200) {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    this.$router.push({ path: '/login' });
                                }
                            });
                        } else {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    });
                })
                .catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
        },
        //取消修改
        closeEdit() {
            this.editVisible = false;
            this.$refs['form'].resetFields();
        },
        // 保存编辑
        saveEdit() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    let form = {
                        id: this.form.id,
                        name: this.form.name,
                        url: this.form.url,
                        desc: this.form.desc,
                        version: this.form.version,
                        status: this.form.status,
                        channel: this.form.channel,
                        created_time: this.form.created_time,
                        android_app_id: this.form.android_app_id
                    };
                    editAppOtaList(form).then(res => {
                        let data = res.data;
                        if (data.code == 0) {
                            this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                            this.getData()
                            this.editVisible = false;
                        } else if (data.code == 4200) {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    this.$router.push({ path: '/login' });
                                }
                            });
                        } else {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    });
                } else {
                    this.$message('填写完整信息');
                    return false;
                }
            });
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
