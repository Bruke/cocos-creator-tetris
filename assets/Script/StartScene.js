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
