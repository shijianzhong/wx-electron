<template>
  <el-container class="wxloginmain">
    <el-main>
      <div v-if="!isloginsuccess" class="wxlogincontainer">
        <h2>欢迎使用平民版微信，满足你不一样的癖好</h2>
        <h4>{{messageInfo}}</h4>
        <img :src="qrcodeurl">

        <div class="myqrcode">
          <div>如果你愿意，请赏点银子或是关注一下</div>
          <div class="myqrcode-left">
            <img id="mon" src="~@/assets/m.jpg" alt="赞赏码">
          </div>

          <div class="myqrcode-right">
            <img id="xcx" src="~@/assets/xcx.jpg" alt="小程序码">
          </div>

        </div>
      </div>
      <wxmain-page :wxobj="wxobj" :meinfo="meinfo" :persons="persons" :receinfo="receinfo" v-else></wxmain-page>
    </el-main>
    <el-footer>
      <home-footer></home-footer>
    </el-footer>
  </el-container>
</template>

<script>
const Padchat = require("padchat-sdk");
const qrcode = require("qrcode-terminal");
const qrcodehtml = require("qrcode");
import homeFooter from "../components/homeFooter.vue";
import wxmainPage from "../components/wxmainPage.vue";
import { constants } from "http2";
export default {
  components: {
    homeFooter,
    wxmainPage
  },
  data() {
    return {
      electron: process.versions["atom-shell"],
      name: this.$route.name,
      node: process.versions.node,
      path: this.$route.path,
      platform: require("os").platform(),
      vue: require("vue/package.json").version,
      url: "ws://52.80.34.207:7777",
      wxobj: {},
      qrcodeurl: "",
      messageInfo: "",
      isloginsuccess: false,
      persons: [],
      meinfo:{},
      receinfo:{}
    };
  },
  created() {
    this.Init();
  },
  methods: {
    Init() {
      this.wxobj = new Padchat(this.url);
      this.wxobj.on("logout", ({ msg }) => {
        this.isloginsuccess = false;
      });
      this.wxobj.on("over", ({ msg }) => {
        this.isloginsuccess = false;
      });
      this.wxobj.on("open", async () => {
        let ret;
        ret = await this.wxobj.init();
        if (!ret.success) {
          this.messageInfo = "初始化失败";
          console.error("初始化失败! ret:", ret);
          return;
        }
        this.messageInfo = "初始化成功";
        console.log("初始化成功! ret:", ret);

        ret = await this.wxobj.login();
        if (!ret.success) {
          this.messageInfo = "请求登录";
          console.error("请求登录! ret:", ret);
          return;
        }
        this.messageInfo = "请求登录";
        console.log("请求登录! ret:", ret);
      });
      this.wxobj.on("qrcode", data => {
        if (data.url) {
          this.messageInfo = "请扫码登陆";
          console.log("登陆二维码url: %s ,请扫码登陆：", data.url);
          // qrcode.generate(data.url);
          qrcodehtml.toDataURL(data.url).then(url => {
            this.qrcodeurl = url;
          });
          return;
        } else if (data.qrCode) {
          console.log("登陆二维码图片数据，请输出到文件扫码。");
          return;
        }
        this.messageInfo = "没有发现二维码数据";
        console.error("没有发现二维码数据!");
      });
      this.wxobj.on("scan", data => {
        switch (data.status) {
          case 0:
            this.messageInfo = "等待扫码";
            console.log("等待扫码...", data);
            break;
          case 1:
            this.messageInfo = "已扫码，请在手机端确认登陆";
            console.log("已扫码，请在手机端确认登陆...", data);
            break;
          case 2:
            switch (data.subStatus) {
              case 0:
                this.meinfo = data;
                this.messageInfo = "扫码成功！登陆成功！";
                console.log("扫码成功！登陆成功！", data);
                break;
              case 1:
                this.messageInfo = "扫码成功！登陆失败！";
                console.log("扫码成功！登陆失败！", data);
                break;
              default:
                this.messageInfo = "扫码成功！未知状态码！";
                console.log("扫码成功！未知状态码！", data);
                break;
            }
            break;
          case 3:
            this.messageInfo = "二维码已过期";
            console.log("二维码已过期", data);
            break;
          case 4:
            this.messageInfo = "手机端已取消登陆！";
            console.log("手机端已取消登陆！", data);
            break;
          default:
            break;
        }
      });
      this.wxobj.on("login", async () => {
        this.messageInfo = "登陆成功";
        this.isloginsuccess = true;
        await this.wxobj.getMyInfo();
     
        // 主动同步通讯录
        await this.wxobj.syncContact();
      });
      this.wxobj.on("loaded", () => {
        this.messageInfo = "载入通讯录完成";
        console.log("载入通讯录完成!");
      });
      this.wxobj.on("push", async (data) => {
        if (data.mType === 2) {
          data["checked"]=false;
          this.$set(this.persons,this.persons.length,data);
          console.log("接收到联系人/群: %s", data.nickName);
          console.log(data);
          return;
        }
        else if(data.mType ===1){
          this.receinfo =data;
        }else if(data.mType ===49){
          if (data.content.indexOf('<![CDATA[微信红包]]>') > 0) {
          await this.wxobj.queryRedPacket(data)
            .then(ret => {
              console.log('未领取红包信息：')
            })
            .catch(e => {
              console.log('未领取，查询红包异常')
            }) 
          await this.wxobj.receiveRedPacket(data)
            .then(async ret => {
              await this.wxobj.openRedPacket(data, ret.data.key)
                .then(ret2 => {
                })
                .catch(e => {
                  console.log(打开红包异常)
                })
              await this.wxobj.queryRedPacket(data)
                .then(ret => {
                })
                .catch(e => {
                })
            })
            .catch(e => {
            })
        } else if (data.content.indexOf('<![CDATA[微信转账]]>') > 0) {
          await this.wxobj.queryTransfer(data)
            .then(ret => {
            })
            .catch(e => {
            })
          await this.wxobj.acceptTransfer(data)
            .then(ret => {
            })
            .catch(e => {
            })
          await this.wxobj.queryTransfer(data)
            .then(ret => {
            })
            .catch(e => {
            })
        } else {
        }
        }
        
      });
    }
  }
};
</script>

<style scoped>
.myqrcode {
  margin-top: 10px;
  border-top-width: 1px;
  border-top-style: dashed;
  border-top-color: aqua;
}
.myqrcode-left {
  float: left;
}
.myqrcode-right {
  float: right;
}
#mon,
#xcx {
  width: 250px;
}

h2 {
  text-align: center;
}
.wxloginmain {
  height: 100%;
}
.wxlogincontainer {
  width: 600px;
  height: 300px;
  margin: 20px auto;
  text-align: center;
}
</style>
