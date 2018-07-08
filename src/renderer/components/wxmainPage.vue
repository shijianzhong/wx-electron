<template>
    <div class="wxmaincontainer">
        <div class="meinfo">
            <div class="iconinfo">
                <img class="iconimg" :src="meinfo.headUrl" alt="">
                <p class="iconname">{{meinfo.nickName}}</p>
            </div>
        </div>
        <div class="personlist">
            <el-scrollbar class="person-elscrollbar">
                <div class="personcheckbox" @click="personcheck(item)" :class="{personcheckboxcolor:item.checked}" v-for="(item,index) in friends" :key="index">
                    <img class="psersonitemicon" :src="item.smallHead" alt="">
                    <span>{{item.nickName}}</span>
                </div>
            </el-scrollbar>
        </div>
        <div class="msg">
            <div class="msg-top">
                <p class="msg-top-info">【{{receinfo.fromUser}}】{{receinfo.description || receinfo.content}}</p>
            </div>
            <div class="sendmsg">
                <el-input type="textarea" :rows="5" placeholder="请输入内容" v-model="inputvalue" clearable>
                </el-input>
                <el-button @click="sendmessage" type="primary" round style="float:right; margin-top:10px;">发送消息</el-button>
            </div>
            <div class="othermsg">
                <el-input v-model="personkeywords" clearable placeholder="请输入查询好友关键字"></el-input>
                <el-button type="primary" @click="searchfriend" round>查询</el-button>
                <el-button type="primary" @click="ismoreselected=!ismoreselected" round>{{moreselectdesc}}</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: ["meinfo", "persons", "receinfo", "wxobj"],

  data() {
    return {
      checked: true,
      checkedItem: {},
      inputvalue: "",
      personkeywords: "",
      friends: [],
      ismoreselected: false,
      moreselectdesc: "多选"
    };
  },

  watch: {
    ismoreselected(val) {
      if (val) {
        this.moreselectdesc = "取消多选";
      } else {
        this.moreselectdesc = "多选";
      }
    },
    checkedItem: {
      handler(newval, oldval) {
        newval.checked = true;
        if (!this.ismoreselected) {
          oldval.checked = false;
        }
      }
    },
    persons: {
      handler(newval, oldval) {
        this.friends = this.persons;
      }
    }
  },
  mounted() {
    this.friends = this.persons;
  },
  methods: {
    searchfriend() {
      this.friends = this.persons.filter(item => {
        return item.nickName.indexOf(this.personkeywords) > -1;
      });
    },
    personcheck(item) {
      this.checkedItem = item;
    },
    sendmessage() {
      if (this.checkedItem && this.inputvalue != "") {
        if (this.ismoreselected) {
          this.friends.forEach(async (o) => {
            if (o.checked) {
              await this.wxobj.sendMsg(o.userName, this.inputvalue);
            }
          });
        } else {
          this.wxobj.sendMsg(this.checkedItem.userName, this.inputvalue);
        }
      }
    }
  }
};
</script>
<style>
.msg-top-info {
  font-size: 20px;
  width: 100%;
  /* height: 100%; */
}
.msg {
  width: 100%;
}
.msg-top {
  padding-top: 100px;
  width: 100%;
  height: 300px;

  box-sizing: border-box;
  overflow: auto;
}
.psersonitemicon {
  height: 30px;
}
.personcheckboxcolor {
  color: coral;
}
.el-scrollbar__wrap {
  overflow-x: hidden;
}
.person-elcheckboxgroup {
  height: 100%;
}
.person-elscrollbar {
  height: 100%;
  padding-top: 100px;
  box-sizing: border-box;
}
.personcheckbox {
  width: 100%;
  margin-left: 10px;
  cursor: pointer;
  height: 50px;
  line-height: 50px;
}
.iconimg {
  width: 100%;
  height: 100%;
  border-radius: 50px;
}
.iconname {
  text-align: center;
}
.wxmaincontainer {
  position: absolute;
  bottom: 60px;
  right: 0px;
  left: 0px;
  width: 100%;
  height: 100%;

  display: flex;
  display: -webkit-flex;
}
.iconinfo {
  margin-top: 150px;
  color: white;
  width: 100%;
  height: 100px;

  background-color: #27292d;
}
.meinfo {
  width: 120px;
  height: 100%;

  background-color: #27292d;
}
.personlist {
  width: 300px;
  height: 100%;
}
</style>
