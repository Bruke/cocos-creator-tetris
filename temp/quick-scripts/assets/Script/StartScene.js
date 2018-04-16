(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/StartScene.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '280c3rsZJJKnZ9RqbALVwtK', 'StartScene', __filename);
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
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=StartScene.js.map
        