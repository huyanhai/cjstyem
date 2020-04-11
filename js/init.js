/*
 * @Author: huyanhai
 * @since: 2020-03-27 22:24:20
 * @LastAuthor: huyanhai
 * @lastTime: 2020-04-10 10:12:20
 * @FilePath: /cjstyem/js/init.js
 * @Description:
 */
new Vue({
  el: "#app",
  data: function () {
    return {
      active: 1,
      times: [],
      keyWords: "",
      dialogtimes: [],
      dialogKeyWords: "",
      multipleSelection: [],
      isDraw: false,
      activeName: "first",
      url: "http://www.zgdrkj.cn:8081/CjManager/",
      wsUrl: "ws://47.113.83.244/liangjiang/product",
      chartDom: {
        line1: {},
        line2: {},
        line3: {},
      },
      lineOneData: [],
      lineTwoData: [],
      lineThreeData: [],
      isLoad: false,
      // 生产监控页面数据集合
      shengchanData: {
        guliaoTemp: "",
        outTemp: "",
        weiqiTemp: "",
        productName: "",
        curNum: "",
        productTotal: "",
        ileData: [],
        productList: [],
      },
      // 生产调度页面数据集合
      diaoduData: {
        task_count: "",
        plan_count: "",
        ship_count: "",
        start_count: "",
        dispatchList: [],
      },
      dialogTableVisible: false, // 弹窗
      dialogTableVisible1: false,
      gridData: [],
      audioOne: "",
      audioTwo: "",
      dispatchData: {},
      cars: [], // 车队数据
      fahuoData: [],
    };
  },
  mounted() {
    this.getddTopData();
    this.updateCar();
    this.audioOne = document.querySelector("#audioOne");
    this.audioTwo = document.querySelector("#audioTwo");
  },
  methods: {
    showDispatch(id) {
      const url = this.url + "dispatch/getJipeiModel";
      let form = new FormData();
      form.append("rwbh", id);
      axios.post(url, form).then((res) => {
        if (res.data.code === 0) {
          this.dialogTableVisible1 = true;
          this.dispatchData = res.data.data;
        }
      });
    },
    changeMode(index) {
      this.active = index;
      let _this = this;
      if (!this.isDraw) {
        _this.$nextTick(function () {
          _this.initWebSocket();
        });
      }
    },
    drawLine(data, el, color, type) {
      // Step 1: 创建 Chart 对象
      const colors = {
        blue: {
          area: "l(90) 0:rgba(248, 252, 255, 1) 1:rgba(239, 247, 255, 1)",
          line: "rgba(80, 167, 255, 1)",
        },
        red: {
          area: "l(90) 0:rgba(255, 91, 92, 0.27) 1:rgba(239, 247, 255, 1)",
          line: "rgba(255, 91, 92, 1)",
        },
        yellow: {
          area: "l(90) 0:rgba(252, 188, 54, 0.26) 1:rgba(239, 247, 255, 1)",
          line: "rgba(253, 183, 37, 1)",
        },
      };

      this.chartDom[el] = new G2.Chart({
        container: el, // 指定图表容器 ID
        autoFit: true,
        height: 210,
        pixelRatio: window.devicePixelRatio,
      });
      // Step 2: 载入数据源
      this.chartDom[el].data(data);

      // chart.scale('value', {
      //     ticks: [0, 200, 400],
      // });

      // Step 3：创建图形语法，绘制柱状图
      this.chartDom[el].area().position(type).shape("smooth").color(colors[color]["area"]);
      this.chartDom[el].line().position(type).color(colors[color]["line"]).shape("smooth");

      // Step 4: 渲染图表
      this.chartDom[el].render();
      this.isDraw = true;
    },
    handleClick() {},
    // 获取生产监控数据
    // websocket
    initWebSocket() {
      let _this = this;
      // 初始化weosocket
      this.websock = new WebSocket(_this.wsUrl);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen() {
      // 连接建立之后执行send方法发送数据
      console.log("链接成功");
    },
    websocketonerror() {
      // 连接建立失败重连
      // this.initWebSocket();
    },
    websocketonmessage(e) {
      // 数据接收
      const redata = JSON.parse(e.data);
      let _this = this;
      let v4 = false;
      let v5 = false;
      if (Object.keys(redata).length === 0) return false;
      this.shengchanData["guliaoTemp"] = redata["guliaoTemp"];
      this.shengchanData["outTemp"] = redata["outTemp"];
      this.shengchanData["weiqiTemp"] = redata["weiqiTemp"];
      this.shengchanData["productName"] = redata["productName"];
      this.shengchanData["productTotal"] = redata["productTotal"];
      this.shengchanData["curNum"] = redata["curNum"];
      this.shengchanData["ysb"] = (redata["lastItemPB"] || {})["ysb"];
      if (redata["lastItemPB"]) {
        this.shengchanData["ileData"] = [];
        this.shengchanData["ileData"].push(redata["lastItemPB"]);
      }
      if (redata["productList"]) {
        if (!this.isLoad) {
          this.shengchanData["productList"] = redata["productList"];
        } else {
          for (let item of redata["productList"]) {
            this.shengchanData["productList"].unshift(item);
          }
        }
        if (this.shengchanData["productList"].length > 10) {
          this.shengchanData["productList"] = this.shengchanData["productList"].slice(0, 10);
        }
      }
      this.isLoad = true;
      // 油石比数据图
      if (redata.rate) {
        this.lineOneData = [];
        for (let item of redata["productList"]) {
          _this.lineOneData.push({
            time: item["date"] + " " + item["dateTime"],
            value: item["ysb"],
          });
        }
        if (JSON.stringify(_this.chartDom["line1"]) !== "{}") {
          _this.chartDom["line1"].changeData(this.lineOneData);
          _this.chartDom["line1"].render();
        } else {
          _this.drawLine(this.lineOneData, "line1", "blue", "time*value");
        }
      }

      // 温度数据图
      if (redata.outTList) {
        this.lineTwoData = [];
        for (let item of redata["outTList"]) {
          _this.lineTwoData.push({
            time: item["outDate"],
            value: item["out"],
          });
        }
        if (JSON.stringify(_this.chartDom["line2"]) !== "{}") {
          _this.chartDom["line2"].changeData(this.lineTwoData);
          _this.chartDom["line2"].render();
        } else {
          _this.drawLine(this.lineTwoData, "line2", "red", "time*value");
        }
      }

      // 仓1配比数据图
      if (redata.productList && redata.lastItemPB) {
        this.lineThreeData = [];
        for (let item of redata["productList"]) {
          _this.lineThreeData.push({
            time: item["date"] + " " + item["dateTime"],
            value: redata["lastItemPB"]["one"] / item["one"],
          });
        }
        if (JSON.stringify(_this.chartDom["line3"]) !== "{}") {
          _this.chartDom["line3"].changeData(this.lineThreeData);
          _this.chartDom["line3"].render();
        } else {
          _this.drawLine(this.lineThreeData, "line3", "yellow", "time*value");
        }
      }

      // 声音
      if (redata.lastItemPB) {
        if (redata.change) {
          let fir = redata.lastItemPB.one / redata.change.one;
          if (fir > 1.05 || fir < 0.95) {
            v4 = true;
          }
          fir = redata.lastItemPB.ysb / redata.change.ysb;
          if (fir > 1.03 || fir < 0.97) {
            v5 = true;
          }
        }
      }

      if (redata.change) {
        if (v4 && v5) {
          _this.audioOne.play();
          v4 = false;
          _this.audioOne.onended = function () {
            audioTwo.play();
            v5 = false;
          };
        } else if (v4) {
          _this.audioOne.onended = function () {
            _this.audioOne.play();
            v4 = false;
          };
        } else if (v5) {
          _this.audioTwo.play();
          v5 = false;
        }
      }
    },
    websocketsend(Data) {
      // 数据发送
      this.websock.send(Data);
    },
    websocketclose(e) {
      // 关闭
      console.log("断开连接", e);
    },
    // 获取生产调度顶部数据
    getddTopData(data) {
      const loading = this.$loading();
      const url = this.url + "dispatch/getTaskDispatchList";
      axios
        .post(url, data)
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            this.diaoduData["task_count"] = data.data["dispatchCount"]["task_count"].toString();
            this.diaoduData["plan_count"] = data.data["dispatchCount"]["plan_count"].toString();
            this.diaoduData["ship_count"] = data.data["dispatchCount"]["ship_count"].toString();
            this.diaoduData["start_count"] = data.data["dispatchCount"]["start_count"].toString();
            this.diaoduData["dispatchList"] = data.data["dispatchList"];
            this.fahuoData = data.data["dispatchList"][0]["deliveryDetailsList"];
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
    // 获取特供任务单列表
    getPendingTaskList(data) {
      const loading = this.$loading();
      const url = this.url + "dispatch/getPendingTaskList";
      axios
        .get(url, {
          params: data,
        })
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            this.gridData = data.list;
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
    // 搜索数据
    searchData() {
      let data = {
        start_time: this.times[0],
        end_time: this.times[1],
        keywords: this.keyWords,
      };
      this.getddTopData(data);
    },
    // 弹窗搜索
    searchDialogData() {
      let data = {
        start_time: this.dialogtimes[0],
        end_time: this.dialogtimes[1],
        keywords: this.dialogKeyWords,
        currentIndex: 1,
        pageSize: 10,
      };
      this.getPendingTaskList(data);
    },
    // 全选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 展示弹窗
    showDialog() {
      this.getPendingTaskList({
        currentIndex: 1,
        pageSize: 10,
      });
      this.dialogTableVisible = true;
    },
    dialogClose() {
      this.dialogtimes = [];
      this.dialogKeyWords = "";
    },
    dialogCloseF() {},
    // 转正单
    zzTask() {
      if (this.multipleSelection.length < 1) return false;
      let tasks = "";
      for (let item of this.multipleSelection) {
        tasks += item.task_id + ",";
      }
      this.updateTaskStatus({
        taskIds: tasks.substring(0, tasks.length - 1),
        state: 1,
      });
    },
    // 转正单Api
    updateTaskStatus(data) {
      let _this = this;
      const loading = this.$loading();
      const url = this.url + "/dispatch/updateTaskStatus";
      axios
        .post(url, data)
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            _this.getddTopData();
            _this.getPendingTaskList({
              currentIndex: 1,
              pageSize: 10,
            });
          } else {
            _this.$notify({
              title: "提示",
              message: data.msg,
            });
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
    // 车辆数据
    updateCar(data) {
      let _this = this;
      const loading = this.$loading();
      const url = this.url + "dispatch/GetAllQueue";
      axios
        .get(url, {
          currentIndex: 1,
          pageSize: 10,
        })
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            this.cars = data.list;
          } else {
            _this.$notify({
              title: "提示",
              message: data.msg,
            });
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
    // 升位
    handleUp(row) {
      let _this = this;
      const loading = this.$loading();
      const url = this.url + "dispatch/ChangeQueue";
      let form = new FormData();
      form.append("id", row.id);
      form.append("type", 1);
      form.append("orderId", row.orderId);
      axios
        .post(url, form)
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            _this.updateCar();
          } else {
            _this.$notify({
              title: "提示",
              message: data.msg,
            });
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
    handleDown(row) {
      let _this = this;
      const loading = this.$loading();
      const url = this.url + "dispatch/ChangeQueue";
      let form = new FormData();
      form.append("id", row.id);
      form.append("type", 2);
      form.append("orderId", row.orderId);
      axios
        .post(url, form)
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            _this.updateCar();
          } else {
            _this.$notify({
              title: "提示",
              message: data.msg,
            });
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
    handleEdit(row) {
      let _this = this;
      const loading = this.$loading();
      const url = this.url + "dispatch/CharFinish";
      let form = new FormData();
      form.append("id", row.id);
      axios
        .post(url, form)
        .then((res) => {
          loading.close();
          let data = res.data;
          if (data.code === 0) {
            _this.updateCar();
          } else {
            _this.$notify({
              title: "提示",
              message: data.msg,
            });
          }
        })
        .catch((err) => {
          loading.close();
        });
    },
  },
});
