<template>
  <div style="width: 100%;height: 100vh;background: #FFffff">
    <!--		<h1>单元格合并？</h1>-->
    <el-button @click="merge" :disabled="canMerge" type="primary" size="mini" class="operate">合并</el-button>
    <el-button @click="dismerge"  :disabled="canDismerge" type="primary" size="mini" class="operate">拆分</el-button>
    <!-- <button @click="resize"  >改变宽高</button> -->
    <el-button @click="addColumn" type="primary" size="mini" class="operate">添加行</el-button>
    <el-button @click="addRow" type="primary" size="mini" class="operate">添加列</el-button>
    <span style="margin-left: 20px">颜色选择</span>
    <el-color-picker
            size="mini"
            v-model="color"
            show-alpha
            @change="chanegColor"
    >
    </el-color-picker>
    <div
            class="grid"
            style="grid-template-columns: 100px 100px 100px 100px 100px;
    			grid-template-rows: 100px 100px;"
            ref="grid"
    >
      <template v-for="(column,keyCol) in columns">
        <div
                v-for="(row,keyRow) in rows"
                :key="row + (column - 1) * rows"
                v-show="list[(row - 1) + (column-1) * rows].show"
                @mousedown="down((row - 1) + (column-1) * rows)"
                :class="{ select: select.length>1 && list[(row - 1) + (column-1) * rows].select,
                        noBorderRight:list[(row - 1) + (column-1) * rows].columnEnd-1<rows,
                        noBorderBottom: list[(row - 1) + (column-1) * rows].rowEnd-1<columns ,
                        singleSelect:select.length==1 && select[0].rowStart==column && select[0].columnStart==row
                        }"
                :style="{
            gridRow: `${list[(row - 1) + (column-1) * rows].rowStart} / ${list[(row - 1) + (column-1) * rows].rowEnd}`,
            gridColumn: `${list[(row - 1) + (column-1) * rows].columnStart} / ${list[(row - 1) + (column-1) * rows].columnEnd}`,
            width:'100%',
            height:'100%',
            background:list[(row - 1) + (column-1) * rows].background

          }"
        >

          <div
                  class="content"

                  @mouseup="up((row - 1) + (column-1) * rows)"
          >
            {{column+'-'+row}}

          </div>
          <div class="right-handle" @mousedown="moveDown($event, row, column, 'column')"></div>
          <div class="bottom-handle" @mousedown="moveDown($event, row, column, 'row')"></div>
        </div>


      </template>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      const rows = 5;
      const columns = 2;
      const list = new Array(rows * columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          list[i + j * rows] = {
            rowStart: j + 1,
            rowEnd: j + 2,
            columnStart: i + 1,
            columnEnd: i + 2,
            show: true,
            select: false,
            background:'#fff'

          };
        }
      } //初始化
      const widthList = new Array(rows).fill(100);
      const heightList = new Array(columns).fill(100);
      return {
        color:'rgba(255, 0, 0, 0.09)',
        rows, //列数
        columns, //行数
        list, //内容
        widthList, //每列宽
        heightList, //每行高
        select: [],//选中的列表
        selectedSingle: {col: -1, row: -1}
      };

    },
    computed: {

      canMerge() {
        if (this.select.length > 1) {
          console.log('2f');
          const [first] = this.select;//
          const last = this.select[this.select.length - 1];
          let count = 0;
          for (const iterator of this.select) {
            const row = iterator.rowEnd - iterator.rowStart;
            const column = iterator.columnEnd - iterator.columnStart;
            if (iterator.show) {
              console.log(row, column);
              if (column + row > 2) {
                count += column * row;
              } else {
                count++;
              }
            }
          }
          console.log('count', count);
          return !(count == this.select.length);
        }
        return true;
      },
      canDismerge(){
        let canDis=false
        if(this.select.length>1){
          this.select.forEach(item=>{
            if(item.rowEnd-item.rowStart>1 || item.columnEnd-item.columnStart>1){
              canDis=true
            }
          })
          return !canDis
        }else{
          return true
        }
      }
    },
    created() {
      this.startIndex = 0; //选中的起始位置
      this.mergeData = {}; //选中后需要合并的数据，
      console.log(this);
    },
    methods: {
      chanegColor(){
        if(this.select&& this.select.length>0){
          this.select.forEach(item=>{
            // this.list[].background=this.color
            this.list[(item.columnStart - 1) + (item.rowStart - 1) * this.rows].background=this.deedClone(this.color)



          })
          this.select=[]
        }
      },
      down(index) {
        this.startIndex = index;
        this.color=this.deedClone(this.list[index].background)

      },
      up(index) {
        //清除下之前选中的的数据
        for (const iterator of this.select) {
          iterator.select = false;
        }
        this.select = [];
        const {startIndex} = this;
        // if(index === startIndex){
        // 	console.log(index);
        // 	this.selectedSingle={
        // 		col:'',
        // 		row:'',
        // 	}
        // 	return;
        // }
        const start = this.list[startIndex];
        const end = this.list[index];
        const minRow = Math.min(start.rowStart, end.rowStart);
        const maxRow = Math.max(start.rowEnd, end.rowEnd);
        const minColumn = Math.min(start.columnStart, end.columnStart);
        const maxColumn = Math.max(start.columnEnd, end.columnEnd);
        // const minIndex = Math.min(startIndex, index);
        this.mergeData = {minRow, maxRow, minColumn, maxColumn}; // 拿到选中的位置数据
        // 给选中的加背景色
        for (let i = minRow - 1; i < maxRow - 1; i++) {
          for (let j = minColumn - 1; j < maxColumn - 1; j++) {
            const el = this.list[j + i * this.rows];
            el.select = true;
            this.select.push(el);
          }
        }
        console.log(this.select);

      },
      merge() {
        console.log('合并')
        // 除了第一个其他的都不显示了，用show 考虑拆分的情况，就是还原...
        const {select, mergeData} = this;
        for (const iterator of select) {
          iterator.select = false;
          iterator.show = false;
        }
        select[0].show = true;
        select[0].rowStart = mergeData.minRow;
        select[0].columnStart = mergeData.minColumn;
        select[0].rowEnd = mergeData.maxRow;
        select[0].columnEnd = mergeData.maxColumn;
      },
      dismerge() {
        const {select, mergeData} = this;
        for (const iterator of select) {
          iterator.select = false;
          iterator.show = true;
        }
      },
      moveDown(e, row, column, state) {// 有很多换名字的骚操作可以节约大量if重复代码
        const index = row - 1 + (column - 1) * this.rows;
        const startY = e[`client${state == "row" ? "Y" : "X"}`];
        const {[`${state}Start`]: start, [`${state}End`]: end} = this.list[
                index
                ];
        let mergeWidth = 0;
        for (let i = start - 1; i < end - 1; ++i) {
          mergeWidth += this[`${state == "row" ? "height" : "width"}List`][i];
        }

        const listener = event => {
          const offset = event[`client${state == "row" ? "Y" : "X"}`] - startY;
          let width = (mergeWidth + offset) / (end - start);
          if (width < 30) {
            width = 30;
          }
          for (let i = start - 1; i < end - 1; ++i) {
            //this.$set(this.widthList, i, width);//响应式不即时
            this[`${state == "row" ? "height" : "width"}List`][i] = width;
          }
          this.resize(state == "row" ? "height" : "width");
        };
        document.body.addEventListener("mousemove", listener);
        document.body.addEventListener("mouseup", () => {
          document.body.removeEventListener("mousemove", listener);
        });
      },
      resize(e) {
        //拖动改变宽高还没写，把获取的宽度替换下面的就可以了 高度的同样
        let str = "";
        for (const iterator of this[`${e}List`]) {
          str += `${iterator}px `;
        }
        this.$refs.grid.style[
                `gridTemplate${e == "width" ? "Columns" : "Rows"}`
                ] = str;
      },
      addColumn() {
        //添加行，比较简单
        const j = this.columns;
        this.columns++;
        for (let i = 0; i < this.rows; i++) {
          this.list.push({
            rowStart: j + 1,
            rowEnd: j + 2,
            columnStart: i + 1,
            columnEnd: i + 2,
            show: true,
            select: false,
            background:'#fff'
          });
        }
        this.heightList.push(100);
        this.resize("height");
      },
      addRow() {
        let s = 0;
        // const arr = [1,2,3,5,6,7,9,10,11];
        // for(let i = 1; i <= 3; ++i){//原理参考这个
        //   arr.splice(3*i + s, 0 , `${3*i+s+1}`);
        //   s++;
        // }
        // console.log(arr);
        const i = this.rows;
        this.rows++;
        for (let j = 1; j <= this.columns; j++) {
          console.log(j * i + s, j * i + s + 1);
          this.list.splice(j * i + s, 0, {
            rowStart: j,
            rowEnd: j + 1,
            columnStart: i + 1,
            columnEnd: i + 2,
            show: true,
            select: false,
            background:'#fff'
          });
          s++;
        }
        this.widthList.push(100);
        this.resize("width");
      },
      deedClone(obj) {
        return JSON.parse(JSON.stringify(obj))
      }
    },

  };
</script>

<style lang="scss">
  .noBorderRight {
    border-right: none !important;
  }

  .noBorderBottom {
    border-bottom: none !important;
  }

  div.singleSelect {
    background: #eeeeee;
  }

  .grid {
    color: #666666;
    user-select: none;
    display: grid;
    /*border: 1px solid red;*/
    padding: {
      left: 8px;
      top: 8px;
    }

    > div {
      border: 1px solid #666;
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      border: {
        right-width: 1px;
        bottom-width: 1px;
      }
      padding: {
        bottom: 8px;
        right: 8px;
      }
    }

    .content {
      border: 1px solid;
      border-color: transparent;
      width: 100%;
      height: 100%;

      &.select {
        background-color: #f37b1d;
        position: relative;
      }
    }

    [class*="-handle"] {
      position: absolute;
      background-color: transparent;
    }

    .right-handle {
      right: 0px;
      height: 100%;
      width: 8px;
      cursor: col-resize;
    }

    .bottom-handle {
      bottom: 0px;
      width: 100%;
      height: 8px;
      cursor: row-resize;
    }
  }

  div.select {
    background: #E6EFFF!important;
  }

  div.selectSingle {
    background: #0CF2F5;
  }
</style>
<style lang="scss">
  .el-button.operate.el-button--primary {
    span {
      color: #fff
    }
  }
</style>
