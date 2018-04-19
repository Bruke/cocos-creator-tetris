

//window.tm = window.tm || {}

cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Node
        },
        // defaults, set visually when attaching this script to the Canvas
        //text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        //this.label.string = this.text;
        this.setTouchControl();

        // 关闭调试信息
        cc.director.setDisplayStats(false);

        // Test Code
        let rnd = tm.utils.getRandomInt(10);
        let dict = tm.TetriminoDict;
    },
    

    setTouchControl: function () {
        this.background.on(cc.Node.EventType.TOUCH_START, function (event) {
        }, this);

        this.background.on(cc.Node.EventType.TOUCH_END, function (event) {
            // 切换场景
            cc.director.loadScene("gamescene", function () {
            });
        }, this);
    },

    // called every frame
    update: function (dt) {

    },
});
