

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
        this._elapsedTime = 0;

        this.registerKeyEvent();
        this.registerTouchEvent();
        this.registerCustomEvent();
    },

    onDestroy () {
        this.unRegisterKeyEvent();
        this.unRegisterTouchEvent();
        this.unRegisterCustomEvent();
    },

    start () {
        this.initNextTetrimino();  // Test Code
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
        cc.systemEvent.on('AddScore',   this.onEvtAddScore, this);
    },

    unRegisterCustomEvent () {
        cc.systemEvent.off('AddScore',  this.onEvtAddScore, this);
    },

    initNextTetrimino () {
        if (this._nextTetrimino) {
            this._nextTetrimino.destroy();
            this._nextTetrimino.removeFromParent();
            this._nextTetrimino = null;
        }

        let tetrimino = cc.instantiate(this.tetriminoPrefab);
        this.nodeNext.addChild(tetrimino);
        //tetrimino.setPosition(223 + tet.width / 2, 70 + tet.height / 2);
        this._nextTetrimino = tetrimino;
    },

    update (dt) {
        this.debugChangeTetrimino(dt);
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
    },

    ///**
    // * 旋转
    // * @param event
    // */
    //onBtnRotate (event) {
    //    let msg = new cc.Event.EventCustom('RotateShape', true);
    //    cc.systemEvent.dispatchEvent(msg);
    //},

    ///**
    // * 直接到底(暂不支持)
    // * @param event
    // */
    //onBtnUp (event) {
    //    let msg = new cc.Event.EventCustom('DownBottom', true);
    //    cc.systemEvent.dispatchEvent(msg);
    //},

    ///**
    // * 加速下落
    // * @param event
    // */
    //onBtnDown (event) {
    //    let msg = new cc.Event.EventCustom('SpeedUp', true);
    //    cc.systemEvent.dispatchEvent(msg);
    //},

    ///**
    // * 左移
    // * @param event
    // */
    //onBtnLeft (event) {
    //    let msg = new cc.Event.EventCustom('Leftward', true);
    //    cc.systemEvent.dispatchEvent(msg);
    //},

    ///**
    // * 右移
    // * @param event
    // */
    //onBtnRight (event) {
    //    let msg = new cc.Event.EventCustom('Rightward', true);
    //    cc.systemEvent.dispatchEvent(msg);
    //},

});
