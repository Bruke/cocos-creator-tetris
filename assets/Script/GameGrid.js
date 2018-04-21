

// 单个块元素宽高
const brick_width  = 30;
const brick_height = 30;


cc.Class({
    extends: cc.Component,

    properties: {
        brickCellPrefab: cc.Prefab,
        tetriminoPrefab: cc.Prefab,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._curTetrimino = null;

        this._gridMap = [];

        // 网格范围为 10 * 20
        this._gridSize = cc.size(10, 20);

        // 设置网格节点宽高
        this.node.setContentSize(brick_width * this._gridSize.width, brick_height * this._gridSize.height);

        this.registerKeyEvent();
        this.registerCustomEvent();

        // Test
        let tetrimino = cc.instantiate(this.tetriminoPrefab);
        this.node.addChild(tetrimino);
    },

    onDestroy () {
        this.unRegisterKeyEvent();
        this.unRegisterCustomEvent();
    },

    start () {

    },

    /**
     * 注册键盘事件
     */
    registerKeyEvent () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    /**
     * 取消注册键盘事件
     */
    unRegisterKeyEvent () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    registerCustomEvent () {
    },

    unRegisterCustomEvent () {
    },

    /**
     * 游戏逻辑主循环
     * @param dt
     */
    update (dt) {
        if (!this._curTetrimino) {
            return;
        }

        this._curTetrimino.update(dt);

        if (this._curTetrimino.isFrozen) {
            this._curTetrimino = null;
        }
    },


    // ------------------------------------- 键盘事件处理 ------------------------------------------ //
    onKeyDown: function (event) {
        switch(event.keyCode) {
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
            case cc.KEY.space:
                // 空格键  -- 旋转形状
                this.sendRotateCommand();
                break;

            default:
                // 其他键统一处理为取消移动方向
                this.cancelChangeDirectionCommand();
                break;
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

    /**
     * 删除已经填满的行
     * @private
     */
    _removeAllCompletedLines () {
        let removedCount = 0;

        // 删除填满的行
        this._gridMap = this._gridMap.filter(function (row) {
            if (!this.rowIsCompleted(row)) {
                return true;
            }
            removedCount++;
            return false;
        });

        //
        if (removedCount) {
            // 播放消除音效

            // 刷新得分
            //cc.game.state.addPointsForRowsCount(removedCount);
        }

        // 重新生成该行网格数据
        while (removedCount--) {
            this._gridMap.push(this.createRow(this._gridSize.width));
        }
    },

    /**
     * 重新生成全部网格块元素
     * @private
     */
    _rebuildAllGridBricks () {
        // 先删除全部元素
        this.removeAllChildren();

        // 重新创建格子元素
        let gridSize = this._gridSize;

        for (let i = 0; i < gridSize.height; i++) {
            for (let j = 0; j < gridSize.width; j++) {
                if (!this._gridMap[i][j]) {
                    continue;
                }

                let brickCell = cc.instantiate(this.brickCellPrefab);

                brickCell.setPosition(
                    j * brick_width * (1 + 0.5),
                    i * brick_height
                );
                this.addChild(brickCell);
            }
        }
    },

    /**
     * 刷新格子中所有的块元素
     * @private
     */
    _updateGridBricks () {
        //
        this._removeAllCompletedLines();
        this._rebuildAllGridBricks();
    },

    createBricksMap (width, height, level) {
        let bricksMap = [];

        for (let i = 0; i < height; i++) {
            let rowHasBricks = i < level;
            bricksMap.push(this.createRow(width, rowHasBricks));
        }
        return bricksMap;
    },

    rowIsCompleted (row) {
        let ci = row.length;

        while (ci--) {
            if (!row[ci]) {
                return false;
            }
        }
        return true;
    },

    rowIsEmpty (row) {
        let i = row.length;

        while (i--) {
            if (row[i]) {
                return false;
            }
        }
        return true;
    },

    colIsEmpty (bricksMap, col) {
        let i = bricksMap.length;
        while (i--) {
            if (bricksMap[i][col]) {
                return false;
            }
        }
        return true;
    },

    createRow (width, needCreateBricks) {
        let row = [];
        let i = width;

        while (i--) {
            let hasBrick = needCreateBricks ? Math.round(Math.random()) : 0;
            row.push(hasBrick);
        }
        return row;
    },

});
