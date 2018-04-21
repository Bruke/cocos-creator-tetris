

cc.Class({
    extends: cc.Component,

    properties: {
        labelHiScore: {
            default: null,
            type: cc.Node
        },

        labelCurScore: {
            default: null,
            type: cc.Node
        },

        labelLevel: {
            default: null,
            type: cc.Node
        },

        labelLines: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.registerKeyEvent();
        this.registerCustomEvent();
    },

    onDestroy () {
        this.unRegisterKeyEvent();
        this.unRegisterCustomEvent();
    },

    start () {

    },

    // update (dt) {},

    registerKeyEvent () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    unRegisterKeyEvent () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    registerCustomEvent () {
        cc.systemEvent.on('AddScore',   this.onEvtAddScore, this);
    },

    unRegisterCustomEvent () {
        cc.systemEvent.off('AddScore',  this.onEvtAddScore, this);
    },

    // ------------------------------------- 键盘事件处理 ------------------------------------------ //
    onKeyDown: function (event) {
        switch(event.keyCode) {
            case cc.KEY.back:
                cc.log('Press back key');
                break;

            default:
                break;
        }
    },

    onKeyUp: function (event) {
        switch(event.keyCode) {
            case cc.KEY.back: // 安卓系统下的退出键
                cc.log('release back key');
                //this._showExitPanel(true);
                break;

            default:
                break;
        }
    },

    // ---------------------------------- 自定义消息事件处理 ----------------------------------------- //
    onEvtAddScore (event) {
        if (this._gameState === GameStatus.Running) {
            let data = event.detail;
            //this._curScore += data.score;
            //this.updateGameScore();
        }
    }

});
