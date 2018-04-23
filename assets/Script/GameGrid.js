
/**
 * 游戏网格对象
 * 游戏核心逻辑代码
 */

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
        this.node.setContentSize(tm.brick_width * this._gridSize.width, tm.brick_height * this._gridSize.height);

        this.registerKeyEvent();
        this.registerCustomEvent();

        // Test
        let tetrimino = cc.instantiate(this.tetriminoPrefab);
        this.node.addChild(tetrimino);

        this._curTetrimino = tetrimino.getComponent("Tetrimino");
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
        cc.systemEvent.on('ChangeDirection',   this.onEvtChangeDirection, this);
        cc.systemEvent.on('CancelDirection',   this.onEvtCancelDirection, this);
    },

    unRegisterCustomEvent () {
        cc.systemEvent.off('ChangeDirection',   this.onEvtChangeDirection, this);
        cc.systemEvent.off('CancelDirection',   this.onEvtCancelDirection, this);
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

            case cc.KEY.space:
                // 空格键  -- 旋转形状
                this.sendChangeDirectionCommand(tm.Direction.Rotate);
                break;
        }
    },

    onKeyUp: function (event) {
        switch(event.keyCode) {
            default:
                // 其他键统一处理为取消移动方向
                this.cancelChangeDirectionCommand();
                break;
        }
    },

    // ---------------------------------- 自定义消息事件处理 ----------------------------------------- //
    onEvtChangeDirection (event) {
        //this._curTetrimino.rotateOnce();
        let direction = event.detail.direction;
        this.sendChangeDirectionCommand(direction);
    },

    onEvtCancelDirection (event) {
        this.cancelChangeDirectionCommand();
    },


    /**
     * 改变形状元素移动方向
     * @param direction
     */
    sendChangeDirectionCommand (direction) {
        this._curTetrimino.changeDirection(direction);
    },

    /**
     * 取消当前附加移动方向
     */
    cancelChangeDirectionCommand () {
        this._curTetrimino.cancelDirection();
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
                    //j * tm.brick_width + tm.brick_width * 0.5,
                    //i * tm.brick_height
                    (j + 0.5) * tm.brick_width,
                    (i - 0.5) * tm.brick_height
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

    /**
     * 创建游戏格子地图
     * @param width
     * @param height
     * @param level
     * @returns {Array}
     */
    createBricksMap (width, height, level) {
        let bricksMap = [];

        for (let i = 0; i < height; i++) {
            let rowHasBricks = i < level;
            bricksMap.push(this.createRow(width, rowHasBricks));
        }
        return bricksMap;
    },

    /**
     * 检查指定行是否可以消除
     * @param row
     * @returns {boolean}
     */
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
