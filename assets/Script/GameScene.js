

cc.Class({
    extends: cc.Component,

    properties: {
        //
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

        nodeNext: {
            default: null,
            type: cc.Node
        },

        rotateBtn: {
            default: null,
            type: cc.Node
        },

        speedBtn: {
            default: null,
            type: cc.Node
        },

        leftBtn: {
            default: null,
            type: cc.Node
        },

        rightBtn: {
            default: null,
            type: cc.Node
        },

        tetriminoPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this._elapsedTime  = 0;
        this._clearLineNum = 0;  // 当前消除行数
        this._level = 1; // 当前关卡
        this._hiScore = 0;

        this.initEnv();
        this.registerKeyEvent();
        this.registerTouchEvent();
        this.registerCustomEvent();

        this.updateGameScore();

        //
        tm.gameSceneInstance = this;
    },

    initEnv () {
        // 读取本地记录最高历史得分
        let hiScore = cc.sys.localStorage.getItem('hiScore');
        if (hiScore !== null) {
            this._hiScore = parseInt(hiScore);
        }
    },

    onDestroy () {
        this.unRegisterKeyEvent();
        this.unRegisterTouchEvent();
        this.unRegisterCustomEvent();
    },

    start () {
        this.initNextTetrimino();
    },

    registerKeyEvent () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    unRegisterKeyEvent () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    registerTouchEvent () {
        this.rotateBtn.on(cc.Node.EventType.TOUCH_START, this.onBtnTouchBegan, this);
        this.speedBtn.on(cc.Node.EventType.TOUCH_START,  this.onBtnTouchBegan, this);
        this.leftBtn.on(cc.Node.EventType.TOUCH_START,   this.onBtnTouchBegan, this);
        this.rightBtn.on(cc.Node.EventType.TOUCH_START,  this.onBtnTouchBegan, this);

        this.rotateBtn.on(cc.Node.EventType.TOUCH_END, this.onBtnTouchEnd, this);
        this.speedBtn.on(cc.Node.EventType.TOUCH_END,  this.onBtnTouchEnd, this);
        this.leftBtn.on(cc.Node.EventType.TOUCH_END,   this.onBtnTouchEnd, this);
        this.rightBtn.on(cc.Node.EventType.TOUCH_END,  this.onBtnTouchEnd, this);
    },

    unRegisterTouchEvent () {
    },

    registerCustomEvent () {
        cc.systemEvent.on('ClearLines',   this.onEvtClearLines, this);
    },

    unRegisterCustomEvent () {
        cc.systemEvent.off('ClearLines',  this.onEvtClearLines, this);
    },

    initNextTetrimino () {
        if (this._nextTetrimino) {
            this._nextTetrimino.destroy();
            this._nextTetrimino.removeFromParent();
            this._nextTetrimino = null;
        }

        let tetrimino = cc.instantiate(this.tetriminoPrefab);
        let tetriComp = tetrimino.getComponent("Tetrimino");
        tetriComp.locked = true;

        this.nodeNext.addChild(tetrimino);
        this._nextTetrimino = tetrimino;

        return tetriComp;
    },

    getNextTetrimino () {
        return this._nextTetrimino;
    },

    update (dt) {
        //this.debugChangeTetrimino(dt);
    },

    /**
     * 测试代码, 变换形状元素
     */
    debugChangeTetrimino (dt) {
        //
        this._elapsedTime += dt;

        if (this._elapsedTime >= 1) {
            //
            this.initNextTetrimino();

            this._elapsedTime = 0;
        }
    },

    /**
     * 刷新游戏得分信息
     */
    updateGameScore () {
        this.labelLevel.getComponent(cc.Label).string = this._level + '';
        this.labelLines.getComponent(cc.Label).string = this._clearLineNum + '';

        let curScore = this._clearLineNum * 100;
        this.labelCurScore.getComponent(cc.Label).string = curScore + '';  // 一行100分

        // 检查是否超过最高历史得分
        if (curScore > this._hiScore) {
            this._hiScore = curScore;

            // 保存到本地存储
            cc.sys.localStorage.setItem('hiScore', curScore);
        }

        this.labelHiScore.getComponent(cc.Label).string = this._hiScore + '';
    },

    // ------------------------------------- 键盘事件处理 ------------------------------------------ //
    onKeyDown: function (event) {
        switch(event.keyCode) {
            case cc.KEY.back:
                break;

            default:
                break;
        }
    },

    onKeyUp: function (event) {
        switch(event.keyCode) {
            case cc.KEY.back: // 安卓系统下的退出键
                //this._showExitPanel(true);
                break;

            default:
                break;
        }
    },

    // ---------------------------------- 自定义消息事件处理 ----------------------------------------- //
    onEvtClearLines (event) {
        let data = event.detail;
        let clearCount = data.clearCount;

        this._clearLineNum += clearCount;

        this.updateGameScore();
    },

    // ---------------------------------- 按钮触摸事件处理 ----------------------------------------- //
    onBtnTouchBegan (event) {
        let direction = tm.Direction.None;

        if (this.rotateBtn === event.target) {
            direction = tm.Direction.Rotate;

        } else if (this.speedBtn === event.target) {
            direction = tm.Direction.Down;

        } else if (this.leftBtn === event.target) {
            direction = tm.Direction.Left;

        } else if (this.rightBtn === event.target) {
            direction = tm.Direction.Right;
        }

        if (direction !== tm.Direction.None) {
            let msg = new cc.Event.EventCustom('ChangeDirection', true);
            msg.setUserData({'direction': direction});
            cc.systemEvent.dispatchEvent(msg);
        }
    },

    onBtnTouchEnd (event) {
        let msg = new cc.Event.EventCustom('CancelDirection', true);
        cc.systemEvent.dispatchEvent(msg);
    }

});
