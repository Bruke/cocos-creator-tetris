
/**
 * 游戏网格对象
 * 游戏核心逻辑代码
 */

cc.Class({
    extends: cc.Component,

    properties: {
        brickCellPrefab: cc.Prefab,
        bombBrickPrefab: cc.Prefab,
        tetriminoPrefab: cc.Prefab,

        clearSound: cc.AudioClip,  // 消除音效

        fallTetriPanel: {
            default: null,
            type: cc.Node
        },
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._curTetrimino = null;

        this._gameState = tm.GameStatus.Ready;

        // 网格中Cell元素二纬数组
        this._gridBricksMap = [];

        // 网格Cell精灵数组
        this._brickSprites = [];

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
        cc.systemEvent.on('BrickExplode',      this.onEvtBrickExplode, this);
    },

    unRegisterCustomEvent () {
        cc.systemEvent.off('ChangeDirection',   this.onEvtChangeDirection, this);
        cc.systemEvent.off('CancelDirection',   this.onEvtCancelDirection, this);
        cc.systemEvent.off('BrickExplode',      this.onEvtBrickExplode, this);
    },


    // ------------------------------------- 键盘事件处理 ------------------------------------------ //
    onKeyDown: function (event) {
        //
        if (this._gameState !== tm.GameStatus.Running) {
            return;
        }

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
        //
        if (this._gameState !== tm.GameStatus.Running) {
            return;
        }

        switch(event.keyCode) {
            default:
                // 其他键统一处理为取消移动方向
                this.cancelChangeDirectionCommand();
                break;
        }
    },

    // ---------------------------------- 自定义消息事件处理 ----------------------------------------- //
    onEvtChangeDirection (event) {
        //
        let direction = event.detail.direction;
        this.sendChangeDirectionCommand(direction);
    },

    onEvtCancelDirection (event) {
        this.cancelChangeDirectionCommand();
    },

    onEvtBrickExplode (event) {
        let brickIndex = event.detail.brickIndex;
        let brickSprites = this._brickSprites;

        for (let i = 0; i < brickSprites.length; i++) {
            let brickSpr = brickSprites[i];
            let brickComp = brickSpr.getComponent('BrickCell');

            if (brickComp.getGridIndex() === brickIndex) {
                // 找到爆炸点, 处理爆炸逻辑
                this._brickCellExploded(brickComp);
                break;
            }
        }
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

    /**
     * 获得地图网格数据
     * @returns {Array|*}
     */
    getGridBricksMap () {
        return this._gridBricksMap;
    },

    /**
     * 设置游戏状态
     * @param state
     */
    setGameState (state) {
        this._gameState = state;
    },

    /**
     * 获取游戏状态
     * @returns {*}
     */
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

        //this.node.addChild(newTetrimino);
        this.fallTetriPanel.addChild(newTetrimino);

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

                //
                if (tetrimino.isBomb) {
                    //如果是炸弹就标记为－1
                    this._gridBricksMap[gridPos.y][gridPos.x] = -1;

                } else {
                    // 正常格子元素标记为1
                    this._gridBricksMap[gridPos.y][gridPos.x] = 1;
                }
            }
        }

        // added by bxh 20180505
        // tetrimino作为this.fallTetriPanel的子节点, 要主动删除
        tetrimino.node.removeFromParent();
        // end

        //
        this._updateGridBricks();

        // 检查游戏是否结束
        let gameOver = !this.isRowEmpty(this._gridBricksMap[tm.grid_height - 2]);  // 上方元素出生位置
        if (gameOver) {
            // 游戏结束
            this._gameState = tm.GameStatus.GameOver;

            tm.gameSceneInstance.gameOver();

        } else {
            //
            this.updateAndCreateNextTetrimino();
        }
    },

    updateAndCreateNextTetrimino () {
        // 创建下一个下落形状元素
        this.createNextTetrimino();

        // 继续生成下一个预览元素
        tm.gameSceneInstance.initNextTetrimino();
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
     * 网格cell爆炸消除逻辑
     * 消除炸弹及其周围伤害范围内的格子元素
     * @param brickComp
     * @private
     */
    _brickCellExploded (brickComp) {
        let gridIndex = brickComp.getGridIndex();
        let effectRadius = brickComp.effectRadius;

        //  获得以 (row,col) 为中心, effectRadius * effectRadius 范围内的所有合法网格坐标
        let subGridIndexArr = this._getSubGrid(gridIndex, effectRadius);

        // 消除网格对应位置的数据
        for (let i = 0; i < subGridIndexArr.length; i++) {
            let index = subGridIndexArr[i];
            let row = Math.floor(index / tm.grid_width);
            let col = index % tm.grid_width;

            this._gridBricksMap[row][col] = 0;
        }

        // 刷新绘制一下网格
        this._updateGridBricks();

        // 生成下一个形状元素
        //this.updateAndCreateNextTetrimino();
    },

    /**
     * 获得以指定索引位置为中心, 指定范围半径的子网格索引
     * @param gridIndex
     * @param radius  须为奇数
     * @returns {Array}
     * @private
     */
    _getSubGrid (gridIndex, radius) {
        let result = [];

        // 先把自己放进去
        //result.push(gridIndex);

        //
        let row = Math.floor(gridIndex / tm.grid_width);
        let col = gridIndex % tm.grid_width;

        // 找到该范围起始点、终点网格坐标
        let span = Math.floor((radius - 1) / 2);
        let left = col - span;
        let bottom = row - span;
        let right = col + span;
        let top = row + span;

        // 边界溢出处理
        left = Math.max(left, 0);
        bottom = Math.max(bottom, 0);
        right = Math.min(right, tm.grid_width - 1);
        top = Math.min(top, tm.grid_height - 1);

        // 遍历
        for (let i = bottom ; i <= top; i++) {
            for (let j = left; j <= right; j++) {
                let index = i * tm.grid_width + j;
                result.push(index);
            }
        }

        return result;
    },

    playClearSound () {
        cc.audioEngine.playEffect(this.clearSound, false);
    },

    /**
     * 删除已经填满的行
     * @private
     */
    _removeAllCompletedLines () {
        let clearCount = 0;

        // 删除填满的行
        this._gridBricksMap = this._gridBricksMap.filter(function (row) {
            if (!this.isRowCompleted(row)) {
                return true;
            }
            clearCount++;
            return false;
        }, this);

        //
        if (clearCount) {
            // 播放消除音效
            this.playClearSound();

            // 刷新得分
            let msg = new cc.Event.EventCustom('ClearLines', true);
            msg.setUserData({'clearCount': clearCount});
            cc.systemEvent.dispatchEvent(msg);
        }

        // 重新生成该行网格数据
        while (clearCount--) {
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

        /*
        let brickSprites = this._brickSprites;
        for (let i = 0; i < brickSprites.length; i++) {
            brickSprites[i].removeAllChildren();
            brickSprites[i] = null;
        }
        brickSprites.length = 0;
        */
        this._brickSprites.length = 0;


        // 重新创建格子元素
        for (let i = 0; i < tm.grid_height; i++) {
            for (let j = 0; j < tm.grid_width; j++) {
                //
                let brickIndex = i * tm.grid_width + j;

                if (this._gridBricksMap[i][j] === 0) {
                    continue;
                }

                // -1则表示该格子元素为炸弹
                let isBomb = (this._gridBricksMap[i][j] === -1);
                let tarPrefab = isBomb ? this.bombBrickPrefab : this.brickCellPrefab;
                let componentName = isBomb ? 'BombBrick' : 'BrickCell';

                let brickCell = cc.instantiate(tarPrefab);
                let brickComp = brickCell.getComponent(componentName);

                // 设置网格位置索引
                brickComp.setGridIndex(brickIndex);

                let x = (j + 0.5) * tm.brick_width;
                let y = (i + 0.5) * tm.brick_height;

                brickCell.setPosition(cc.p(x, y));
                this.node.addChild(brickCell);

                // 炸弹元素特殊处理
                if (isBomb) {
                    // 触发爆炸效果
                    brickComp.doExplode();

                    // ZOrder调至最高, 确保爆炸特效不被其他格子元素遮挡
                    brickCell.setLocalZOrder(9);
                }

                //
                this._brickSprites.push(brickCell);
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
            //if (!row[ci]) {
            if (row[ci] === 0 || row[ci] === -1) {  // 网格为空或为炸弹时都不能消除
                return false;
            }
        }
        return true;
    },

    /**
     * 检查指定行是否空行
     * @param row
     * @returns {boolean}
     */
    isRowEmpty (row) {
        let i = row.length;
        while (i--) {
            if (row[i]) {
                return false;
            }
        }
        return true;
    },

    /**
     * 检查指定列是否空列
     * @param bricksMap
     * @param col
     * @returns {boolean}
     */
    isColEmpty (bricksMap, col) {
        let i = bricksMap.length;
        while (i--) {
            if (bricksMap[i][col]) {
                return false;
            }
        }
        return true;
    },

    /**
     * 创建一行网格
     * @param width
     * @param needCreateBricks
     * @returns {Array}
     */
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

