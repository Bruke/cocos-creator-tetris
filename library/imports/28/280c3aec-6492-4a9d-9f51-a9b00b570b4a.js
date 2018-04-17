"use strict";
cc._RF.push(module, '280c3rsZJJKnZ9RqbALVwtK', 'StartScene');
// Script/StartScene.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Node
        }
        // defaults, set visually when attaching this script to the Canvas
        //text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function onLoad() {
        //this.label.string = this.text;
        this.setTouchControl();

        // 关闭调试信息
        cc.director.setDisplayStats(false);
    },

    setTouchControl: function setTouchControl() {
        this.background.on(cc.Node.EventType.TOUCH_START, function (event) {}, this);

        this.background.on(cc.Node.EventType.TOUCH_END, function (event) {
            // 切换场景
            cc.director.loadScene("gamescene", function () {});
        }, this);
    },

    // called every frame
    update: function update(dt) {}
});

cc._RF.pop();