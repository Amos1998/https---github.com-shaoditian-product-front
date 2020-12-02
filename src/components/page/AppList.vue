<template>
    <div
        v-loading.lock="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
        style="width: 1200px; margin: 0 auto;"
    >
        <div class="crumbs">
            <el-page-header @back="goBack" content="账号列表"> </el-page-header>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-input v-model="query.name" placeholder="平台名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="account" label="账号" align="center"></el-table-column>
                <el-table-column prop="password" label="密码" align="center"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status == 1 ? 'success' : scope.row.status == 0 ? 'danger' : 'warning'">{{
                            scope.row.status == 1 ? '已激活' : scope.row.status == 0 ? '禁用' : scope.row.status == 2 ? '激活中' : ''
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column :formatter="dateFormatter" prop="created_time" label="产生时间" align="center"></el-table-column>
                <el-table-column label="操作" min-width="200" align="center">
                    <template slot-scope="scope">
                        <el-button type="danger " icon="el-icon-delete" @click="handleDelete(scope.$index, scope.row, 0)">删除</el-button>
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

        <!-- 更新弹出框 -->
        <el-dialog title="更新" :visible.sync="editVisible" width="30%" @close="closeEdit" :close-on-click-modal="false">
            <el-form ref="editform" :model="editform" label-width="70px">
                <el-form-item label="脚本说明">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="上传测试文件" prop="docType.crFile" ref="crFile">
                    <el-upload
                        ref="editCrfile"
                        :file-list="editform.docType.crFile"
                        :data="form"
                        :auto-upload="false"
                        :action="baseurl + 'operation/Script/edit'"
                        accept=".apk"
                        :on-remove="handleRemove"
                        multiple
                        :limit="limit"
                        :headers="headers"
                        :on-exceed="handleExceed"
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload"
                        :on-change="handleChange"
                    >
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">
                            将文件拖到此处，或
                            <em>点击上传</em>
                        </div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveEdit">确 定</el-button>
                <el-button @click="closeEdit">取 消</el-button>
            </span>
        </el-dialog>

        <!-- 新增弹出框 -->
        <el-dialog title="新增应用账号" :visible.sync="addVisible" width="30%" :close-on-click-modal="false" @close="closeAdd">
            <el-form ref="uploadform" :rules="rules" :model="uploadform" label-width="110px">
                <el-form-item label="上传应用文件" prop="docType.crFile" ref="crFile">
                    <el-upload
                        ref="doctypeCrfile"
                        :file-list="uploadform.docType.crFile"
                        :auto-upload="false"
                        :action="baseurl + 'platform/AppAccount/import'"
                        accept=".xlsx"
                        :on-remove="handleRemove"
                        multiple
                        :limit="limit"
                        :headers="headers"
                        :on-exceed="handleExceed"
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload"
                    >
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">
                            将文件拖到此处，或
                            <em>点击上传</em>
                        </div>
                        <div class="el-upload__tip" slot="tip" style="color:red;">
                            *导入应用程序账号密码 目前支持xlsx格式
                            <a href="account.xlsx" download="account.xlsx">下载模板</a>
                        </div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button size="mini" type="primary" @click="uploadConfirm">确 定</el-button>
                <el-button size="mini" @click="closeAdd">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { baseURL } from './../../api/url';
import { getAppList, delAppAccount } from './../../api/home';

export default {
    name: 'basetable',
    data() {
        return {
            loading: false,
            baseurl: '',
            query: {
                status: '',
                name: '',
                page: 1,
                size: 10
            },
            uploadform: {
                docType: {
                    crFile: []
                }
            },
            uploadType: 0, //0--增加 1--修改
            editType: 0, //0 --不存在上传文件，1--存在上传文件
            limit: 1,
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            oldForm: {},
            editform: {
                docType: {
                    crFile: []
                }
            },
            addVisible: false,
            rules: {
                name: [{ required: true, message: '脚本说明', trigger: 'blur' }]
            },
            fileList: [],
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
    computed: {
        headers() {
            return {
                token: localStorage.getItem('Token')
            };
        }
    },
    mounted() {
        this.baseurl = baseURL;
    },
    methods: {
        goBack() {
            this.$router.push({ path: '/featuresList' }); //返回首页
        },
        //限制上传文件个数
        handleExceed(files, fileList) {
            this.$message.warning(`最多上传 ${this.limit} 个文件`);
        },
        //移除上传文件
        handleRemove(file, fileList) {
            this.editType = 0;
            // console.log(file);
            for (var i = 0; i < this.fileList.length; i++) {
                if (this.fileList[i].uid == file.uid) {
                    this.fileList.splice(i, 1);
                    break;
                }
            }
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
        // 获取数据
        getData() {
            getAppList(this.query).then(res => {
                let data = res.data;
                // console.log(data);
                if (data.code == 0) {
                    this.tableData = data.data.data;
                    this.pageTotal = data.data.total;
                    setTimeout(() => {
                        this.loading = false;
                    }, 800);
                } else if (data.code == 4200) {
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(data.msg, '提示', {
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
        //规定上传文件的格式
        beforeUpload(file) {
            // console.log(file);
            var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1);
            const extension = testmsg === 'xlsx';
            if (!extension) {
                this.$message({
                    message: '上传文件只能是 xlsx格式!',
                    type: 'warning'
                });
            }
            return extension;
        },
        //添加文件列表时的变化
        handleChange(file, fileList) {
            this.editType = 1;
        },
        // 保存新增
        uploadConfirm(from) {
            this.$refs.doctypeCrfile.submit();
        },
        //取消添加
        closeAdd() {
            this.addVisible = false;
            this.uploadform = {
                docType: {
                    crFile: []
                }
            };
        },
        // 上传测试文件
        handleSuccess(res) {
            console.log(res);
            if (res.code == 0) {
                if (this.uploadType == 0) {
                    //上传新增的文件
                    this.$message.success('上传成功');
                    this.query = {
                        page: 1,
                        size: 10
                    };
                    this.uploadform = {
                        docType: {
                            crFile: []
                        }
                    };
                } else {
                    //上传更新的文件
                    this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                    this.editform.docType.crFile = [];
                }
                this.addVisible = false;
                this.getData();
            } else if (res.code == 4200) {
                this.$alert(res.msg, '提示', {
                    confirmButtonText: '确定',
                    callback: action => {
                        this.$router.push({ path: '/login' });
                    }
                });
            } else {
                this.$alert(res.msg, '提示', {
                    confirmButtonText: '确定'
                });
                this.getData();
            }
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = row;
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            // console.log(this.form);
            if (this.editType == 0) {
                console.log('不存在上传文件');
                editScriptList(this.form).then(res => {
                    let data = res.data;
                    if (data.code == 0) {
                        this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                        this.$set(this.tableData, this.idx, this.form);
                        this.editform.docType.crFile = [];
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
                console.log('存在上传文件');
                this.uploadType = 1;
                this.$refs.editCrfile.submit();
            }
            this.editVisible = false;
        },
        //取消编辑
        closeEdit() {
            this.getData();
            this.editVisible = false;
        },
        // 删除操作
        handleDelete(index, row) {
            console.log(row);
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    delAppAccount(row.id).then(res => {
                        let data = res.data;
                        if (data.code == 0) {
                            this.$message.success('删除成功');
                            this.getData();
                        } else if (data.code == 4200) {
                            this.$router.push({ path: '/login' });
                        } else {
                            this.$alert(data.msg, '提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    });
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    const length = this.multipleSelection.length;
                    let str = '';
                    this.delList = this.delList.concat(this.multipleSelection);
                    console.log(this.delList);
                    for (let i = 0; i < length; i++) {
                        str += this.multipleSelection[i].account + ' ';
                        this.deleteALL(this.delList[i]);
                        if (i == length - 1) {
                            this.$message.error(`删除了${str}`);
                            this.multipleSelection = [];
                        }
                    }
                })
                .catch(() => {});
        },
        deleteALL(row) {
            console.log(row);
            // 二次确认删除

            delAppAccount(row.id).then(res => {
                let data = res.data;
                if (data.code == 0) {
                    this.getData();
                } else if (data.code == 4200) {
                    this.$router.push({ path: '/login' });
                } else {
                    this.$alert(data.msg, '提示', {
                        confirmButtonText: '确定'
                    });
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