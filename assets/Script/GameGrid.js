
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

        this._gameState = tm.GameStatus.Ready;

        // 网格中地块Cell元素二纬数组
        this._gridBricksMap = [];

        // 设置网格节点宽高
        this.node.setContentSize(tm.brick_width * tm.grid_width, tm.brick_height * tm.grid_height);

        this.registerKeyEvent();
        this.registerCustomEvent();

        //
        tm.gameGridInstance = this;
    },

    onDestroy () {
        this.unRegisterKeyEvent();
        this.unRegisterCustomEvent();
    },

    start () {
        this.gameStart();
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


    // --------------------------------------------------------------------------------------------- //
    setGameLevel (level) {
        if (level === void 0) {
            level = 0;
        }

        this._level = level;
        this._gridBricksMap = this.createBricksMap(tm.grid_width, tm.grid_height, level);
        this._curTetrimino = null;
        this._updateGridBricks();
    },

    getGridBricksMap () {
        return this._gridBricksMap;
    },

    setGameState (state) {
        this._gameState = state;
    },

    getGameState () {
        return this._gameState;
    },

    /**
     * 开始游戏
     */
    gameStart () {
        //
        this.setGameLevel(1);
        this.setGameState(tm.GameStatus.Running);
        this.createNextTetrimino();
    },

    /**
     * 获取下一个要显示的形状元素
     */
    createNextTetrimino () {
        //
        let sceneNextTetri = tm.gameSceneInstance.getNextTetrimino();
        let newTetrimino = cc.instantiate(this.tetriminoPrefab);
        let newTetriComp  = newTetrimino.getComponent("Tetrimino");

        newTetriComp.initWithTetrimino(sceneNextTetri.getComponent("Tetrimino"));

        this.node.addChild(newTetrimino);
        this._curTetrimino = newTetriComp;

        // 定位到出生点
        this._curTetrimino.initToBornPosition();
    },

    /**
     * 将落地已被锁定到图形元素添加到网格中
     * @param tetrimino
     */
    addLockedTetrimino: function (tetrimino) {
        //
        let row = tm.brick_cell_num;
        while (row--) {
            for (let col = 0; col < tm.brick_cell_num; col++) {
                let bricksData = tetrimino.getBricksData();
                if (!bricksData[row][col]) {
                    continue;
                }

                let tetriGridPos = tetrimino.getGridPos();
                let gridPos = cc.p(tetriGridPos.x + col, tetriGridPos.y + (tm.brick_cell_num - row - 1));
                this._gridBricksMap[gridPos.y][gridPos.x] = 1;
            }
        }

        //
        this._updateGridBricks();

        // 检查游戏是否结束
        var gameOver = !this.isRowEmpty(this._gridBricksMap[tm.grid_height - 2]);  // 上方元素出生位置
        if (gameOver) {
            // 游戏结束
            this._gameState = tm.GameStatus.GameOver;

        } else {
            // 创建下一个下落形状元素
            this.createNextTetrimino();

            // 继续生成下一个预览元素
            tm.gameSceneInstance.initNextTetrimino();
        }
    },

    /**
     * 改变形状元素移动方向
     * @param direction
     */
    sendChangeDirectionCommand (direction) {
        if (this._curTetrimino) {
            this._curTetrimino.isTouchingDown = true;
            this._curTetrimino.changeDirection(direction);
        }
    },

    /**
     * 取消当前附加移动方向
     */
    cancelChangeDirectionCommand () {
        if (this._curTetrimino) {
            this._curTetrimino.isTouchingDown = false;
            this._curTetrimino.cancelDirection();
        }
    },

    /**
     * 删除已经填满的行
     * @private
     */
    _removeAllCompletedLines () {
        let removedCount = 0;

        // 删除填满的行
        this._gridBricksMap = this._gridBricksMap.filter(function (row) {
            if (!this.isRowCompleted(row)) {
                return true;
            }
            removedCount++;
            return false;
        }, this);

        //
        if (removedCount) {
            // 播放消除音效

            // 刷新得分
            //cc.game.state.addPointsForRowsCount(removedCount);
        }

        // 重新生成该行网格数据
        while (removedCount--) {
            this._gridBricksMap.push(this.createRow(tm.grid_width));
        }
    },

    /**
     * 重新生成全部网格块元素
     * @private
     */
    _rebuildAllGridBricks () {
        // 先删除全部元素
        this.node.removeAllChildren();

        // 重新创建格子元素
        for (let i = 0; i < tm.grid_height; i++) {
            for (let j = 0; j < tm.grid_width; j++) {
                if (!this._gridBricksMap[i][j]) {
                    continue;
                }

                let brickCell = cc.instantiate(this.brickCellPrefab);

                brickCell.setPosition(
                    //j * tm.brick_width + tm.brick_width * 0.5,
                    //i * tm.brick_height
                    (j + 0.5) * tm.brick_width,
                    (i + 0.5) * tm.brick_height
                );
                this.node.addChild(brickCell);
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
    isRowCompleted (row) {
        let ci = row.length;
        while (ci--) {
            if (!row[ci]) {
                return false;
            }
        }
        return true;
    },

    isRowEmpty (row) {
        let i = row.length;
        while (i--) {
            if (row[i]) {
                return false;
            }
        }
        return true;
    },

    isColEmpty (bricksMap, col) {
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

    /**
     * 游戏逻辑主循环
     * @param dt
     */
    update (dt) {
        if (this._gameState !== tm.GameStatus.Running) {
            return;
        }

        if (!this._curTetrimino) {
            return;
        }

        if (this._curTetrimino.locked) {
            this._curTetrimino = null;
        }
    },

});
