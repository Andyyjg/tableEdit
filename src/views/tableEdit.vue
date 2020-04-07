<template>
    <div style="width: 100%;height: 100vh;background: #FFffff;padding-top: 50px;overflow: auto;"
         onselectstart="return false;" @click.stop="resteData">
        <div style="text-align: center;margin-bottom: 50px;">
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="combineunit" :disabled="disabledCombine">合并单元格
            </el-button>
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="dealUnit('top')">
                上方插入一行
            </el-button>
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="dealUnit('bottom')">
                下方插入一行
            </el-button>
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="dealUnit('left')">
                左侧增加{{row}}列
            </el-button>
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="dealUnit('right')">
                右侧增加{{row}}列
            </el-button>
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="dealUnit('row')"
                       :disabled="rowMin!=rowMax || colMax==0">删除所在行
            </el-button>
            <el-button type="primary" size="mini" class="operate" style="color:#fff" @click.stop="dealUnit('col')"
                       :disabled="colMin!=colMax || rowMax==0">删除所在列
            </el-button>
        </div>
        <table @click.stop="stopFather" style="word-wrap: break-word; word-break: break-all;">
            <tr v-for="(item,key) of rowData" :key="key" >
                <td v-for="(item1,key1) of item"
                    v-if="item1.show"
                    :data_id="key+','+key1"
                    :rowspan="item1.rowSpan"
                    style="text-align: center;vertical-align: middle;"
                    :style="{
                        height:item1.height+'px',
                        width:item1.width+'px'

                    }"
                    :colspan="item1.colSpan"
                    @mousedown.stop.prevent="start(key,key1,$event)"
                    @mousemove="dealMouseEnter($event)"
                    @mouseup.stop.prevent="end(key,key1,$event)"
                    :class="((key>=rowMin && key<=rowMax) && (key1>=colMin && key1<=colMax) && !(rowMin==rowMax && colMin==colMax))?'selected':''">
                    <input type="text" class="input" v-model="item1.value"
                           @mousedown.stop.prevent="start(key,key1,$event)"
                           @mousemove="move(key,key1,$event)"

                           :data_id="key+','+key1"
                           @mouseup.stop.prevent="end(key,key1)"
                           :ref="key+','+key1"
                           @click="focusInput(key+','+key1)"
                    >

                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    export default {
        name: "tableTest",
        data() {
            return {
                rowData: {},
                row: 3,
                col: 6,
                rowMin: 1000,
                colMin: 1000,
                rowMax: 0,
                colMax: 0,
                disabledCombine:false,
                rowSpan:1,
                colSpan:1,
                hasActive:false,
                tdItem:{rowSpan: 1, colSpan: 1, show: true, value: '内容', width:100,height: 80},
                canResizeCol:false,
                rowIndex:0,
                colIndex:0
            }
        },
        methods: {
            deedClone(obj){
                return JSON.parse(JSON.stringify(obj))
            },
            dealMouseEnter(e){
                // console.log(e.target);
                if(e.offsetX<=8 || e.target.offsetWidth-e.offsetX<=8)
                {
                    console.log(e.target.getAttribute('data_id'));
                    e.target.style.cursor='col-resize';

                }else{
                    e.target.style.cursor='text';
                    this.canResizeCol=false
                }

            },
            dealUnit(code) {
                this.resteData()
                var modelData = this.deedClone(this.tdItem)
                if (code == 'top') {
                    var tmp = []
                    this.row += 1
                    for (var j = 0; j < this.col; j++) {
                        tmp.unshift(this.deedClone(modelData))
                    }
                    this.rowData.unshift(tmp)
                } else if (code == 'bottom') {
                    var tmp = []
                    this.row += 1
                    for (var j = 0; j < this.col; j++) {
                        tmp.push(this.deedClone(modelData))
                    }
                    this.rowData.push(tmp)
                } else if (code == 'left') {
                    this.col += 1
                    this.rowData.forEach((item, key) => {

                        item.unshift(this.deedClone(modelData))

                    })
                } else if (code == 'right') {
                    this.col += 1
                    this.rowData.forEach((item, key) => {
                        item.push(this.deedClone(modelData))
                    })
                } else if (code == 'row') {
                    this.row -= 1
                    this.rowData.splice(this.rowMin, 1)
                } else if (code == 'col') {
                    this.col -= 1
                    this.rowData.forEach((item, key) => {
                        item.forEach((item1, key1) => {
                            item.splice(this.colMin, 1)
                        })
                    })
                }
            },
            sortData(){
                var obj=[]
                this.rowData.forEach((item,key)=>{
                    if(!obj[key]){
                        obj[key]=[]
                    }
                    item.forEach((item1, key1) => {
                        if (key >= this.rowMin && key <= this.rowMax) {
                            item1.row=key;
                            item1.col=key1
                            if(item1.show){
                                if (key == this.rowMin) {
                                    if (key1 >=this.colMin && key1 <= this.colMax) {

                                        obj[key].push(this.deedClone(item1))
                                    }
                                } else {
                                    if (key1 >= this.colMin && key1 <= this.colMax) {
                                        obj[key].push(this.deedClone(item1))
                                    }
                                }
                            }

                        }


                    })
                })
                var shouldAdd=true
                for(var i=0;i<obj.length;shouldAdd?i++:i){
                    if(!obj[i][0]){
                        obj.splice(i,1)
                        shouldAdd=false
                    }else{
                        shouldAdd=true
                    }
                }
                var h=0,w=0,squre=0
                console.log(obj);
                obj[0].forEach(item=>{
                    w+=item.colSpan
                })
                obj.forEach(item=>{

                    h+=item[0].rowSpan
                })
                obj.forEach(item=>{
                    item.forEach(item1=>{
                        squre+=(item1.rowSpan*item1.colSpan)
                    })
                })

                if(squre!=w*h){
                    this.disabledCombine=true
                }else{
                    this.disabledCombine=false
                }
                this.colSpan=w
                this.rowSpan=h
                console.log(squre,w,h)
            },
            combineunit() {
                console.log(this.rowMin, this.colMin, this.rowMax, this.colMax)
                var rowSpan = 1, colSpan = 1
                if (!(this.rowMin == this.rowMax && this.colMax == this.colMin)) {
                    this.sortData()
                    var son = this.rowData[this.rowMin][this.colMin]
                    son.rowSpan=this.rowSpan
                    son.colSpan=this.colSpan
                    son.width=son.width+(this.colMax - this.colMin)
                    son.height=son.height+(this.rowMax - this.rowMin)
                    this.rowData.forEach((item, key) => {
                        item.forEach((item1, key1) => {
                            if (key >= this.rowMin && key <= this.rowMax) {
                                if (key == this.rowMin) {
                                    if (key1 > this.colMin && key1 <= this.colMax) {
                                        item1.show = false
                                    }
                                } else {
                                    if (key1 >= this.colMin && key1 <= this.colMax) {
                                        item1.show = false
                                    }
                                }
                            }


                        })
                    })
                }
                console.log(this.rowData);

            },
            focusInput(code) {
                this.$refs[code][0].focus()
            },
            stopFather() {
            },
            move(row,col,e) {
                if(this.canResizeCol)
                {
                    if(e.offsetX<=9){
                        this.rowData.forEach((item,key)=>{
                            item.forEach((item1,key1)=>{
                                if(key1==this.colIndex){
                                    item1.width+=e.offsetX
                                }
                            })
                        })
                    }else{
                        this.rowData.forEach((item,key)=>{
                            item.forEach((item1,key1)=>{
                                if(key1==this.colIndex){
                                    item1.width=e.offsetX
                                }
                            })
                        })
                    }


                }else{

                }
            },
            start(row, col,e) {

                if(e.offsetX<=8 || e.target.offsetWidth-e.offsetX<=8)
                {
                    this.rowIndex=row
                    this.colIndex=col
                    this.canResizeCol=true

                }else{
                    this.rowMax = 0
                    this.colMax = 0
                    this.rowMin = row
                    this.colMin = col
                }

            },
            end(row, col,e) {
                if(this.canResizeCol)
                {
                    this.canResizeCol=false
                }else{
                    if (row < this.rowMin) {
                        this.rowMax = this.rowMin
                        this.rowMin = row
                    } else {
                        this.rowMax = row
                    }
                    if (col < this.colMin) {
                        this.colMax = this.colMin
                        this.colMin = col
                    } else {
                        this.colMax = col
                    }
                    this.sortData()
                }


            },

            resteData() {
                this.rowMax = 0
                this.colMax = 0
                this.rowMin = 1000
                this.colMin = 1000
            },

        },
        created() {
            var arr = [], tmp = []
            for (var i = 0; i < this.row; i++) {
                tmp = []
                for (var j = 0; j < this.col; j++) {
                    tmp.push(this.deedClone(this.tdItem))
                }
                arr.push(tmp)
            }
            console.log(arr);
            this.rowData = arr
        },
        mounted() {
            // this.$globalClick(this.resteData)
        }
    }
</script>

<style scoped lang="scss">
    span {
        color: #fff
    }

    table {
        border: 1px solid #4B89FF;

        tr {
            td {
                border: 1px solid #eee;
                /*cursor: text;*/
                input.input {
                    text-align: inherit;
                    vertical-align: inherit;
                    border: none;
                    outline: none;
                    width: 100%;
                    height: 100%;
                    /*min-height: 80px;*/
                    background: transparent;
                }
            }


            td.selected {
                background: #E6EFFF;

            }
        }
    }
</style>
<style lang="scss">
    .el-button.operate.el-button--primary {
        span {
            color: #fff
        }
    }
</style>