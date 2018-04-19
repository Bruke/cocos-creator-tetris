

cc.Class({
    extends: cc.Component,

    properties: {
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
                //console.log('Press back key');
                break;

            /**
             *  同时支持w s a d字母键 和 up down left right 方向键
             */
            case cc.KEY.w:
            case cc.KEY.up:
                this.sendChangeDirectionCommand(tm.Direction.Up);
                break;

            case cc.KEY.s:
            case cc.KEY.down:
                this.sendChangeDirectionCommand(tm.Direction.Down);
                break;

            case cc.KEY.a:
            case cc.KEY.left:
                this.sendChangeDirectionCommand(tm.Direction.Left);
                break;

            case cc.KEY.f:
            case cc.KEY.right:
                this.sendChangeDirectionCommand(tm.Direction.Right);
                break;
        }
    },

    onKeyUp: function (event) {
        switch(event.keyCode) {
            case cc.KEY.back: // 安卓系统下的退出键
                //console.log('release back key');
                //this._showExitPanel(true);
                break;

            case cc.KEY.space:
                // 空格键  -- 旋转
                this.sendRotateCommand();
                break;

            default:
                // 其他键统一处理为取消移动方向
                this.cancelChangeDirectionCommand();
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
    },

    /**
     * 发送旋转形状元素命令
     */
    sendRotateCommand () {
        let event = new cc.Event.EventCustom('Rotate', true);
        //event.setUserData({'item': this._lastStandGround});
        cc.systemEvent.dispatchEvent(event);
    },

    /**
     * 改变形状元素移动方向
     * @param direction
     */
    sendChangeDirectionCommand (direction) {

    },

    /**
     * 取消当前附加移动方向
     */
    cancelChangeDirectionCommand () {

    },
});
