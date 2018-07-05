<template>
  <div>
    <img :src="qrcodeurl">
  </div>
</template>

<script>
const Padchat = require("padchat-sdk");
const qrcode = require("qrcode-terminal");
const qrcodehtml = require('qrcode');
export default {
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
      qrcodeurl:"",
    };
  },
  created() {
    this.Init();
  },
  methods: {
    Init() {
      this.wxobj = new Padchat(this.url);
      console.log(this.wxobj);
      this.wxobj.on("open", async () => {
        let ret;
        ret = await this.wxobj.init();
        if (!ret.success) {
          console.error("初始化失败! ret:", ret);
          return;
        }
        console.log("初始化成功! ret:", ret);

        ret = await this.wxobj.login();
        if (!ret.success) {
          console.error("请求登录失败! ret:", ret);
          return;
        }
        console.log("请求登录成功! ret:", ret);
      });
      this.wxobj.on("qrcode", data => {
        if (data.url) {
          console.log("登陆二维码url: %s ,请扫码登陆：", data.url);
          // qrcode.generate(data.url);
          qrcodehtml.toDataURL(data.url).then(url=>{
            this.qrcodeurl =url;
          })
          return;
        } else if (data.qrCode) {
          console.log("登陆二维码图片数据，请输出到文件扫码。");
          return;
        }
        console.error("没有发现二维码数据!");
      });
    }
  }
};
</script>

<style scoped>
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  margin-bottom: 6px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
