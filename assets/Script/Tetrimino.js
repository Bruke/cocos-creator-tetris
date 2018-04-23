

/**
 * 俄罗斯方块中各种下落的形状元素统称Tetrimino
 */

cc.Class({
    extends: cc.Component,

    properties: {

        // 构成形状的小元素块
        brickPrefab: cc.Prefab,

        // 构成每一种形状的小元素块对象集合
        // 所有形状元素都是有四个小元素块构成的
        bricks: {
            default: [],
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:
    
    onLoad () {
        //
        this._fallWaitTime = 0.5;  // 元素块下落、停顿间隔时间
        this._elapsedTime = this._fallWaitTime; // 累积时间

        // 随机选择一个图形模版
        this.bricksTpl  = tm.utils.randomArrayItems(tm.TetriminoDict)[0];

        // 随机当前模版旋转位置
        this._curRotateIdx = tm.utils.getRandomInt(this.bricksTpl.length);

        // 当前图形显示数据
        this._curBricksData = [];

        // 玩家当前指定方向
        this._direction = tm.Direction.None;

        // 是否被锁定
        this._isLocked  = false;

        // 是否向下加速
        this._speedUp   = false;

        // 图形元素在10x20游戏网格中的矩阵坐标 x[0~10] y[0~20]
        this._gridPosition = cc.p(0, 0);

        //
        this.node.setContentSize(tm.brick_width * tm.brick_cell_num, tm.brick_height * tm.brick_cell_num);
    },

    start () {
    },

    /**
     * 设置游戏网格坐标
     * @param pos
     */
    setGridPos: function (pos) {

    },

    /**
     * 检查是否为有效的网格坐标
     * @param pos
     * @returns {boolean}
     */
    isValidGridPos (pos) {
        return true;
    },

    rotateOnce () {
        this._curRotateIdx++;
        this._curRotateIdx = this._curRotateIdx % this.bricksTpl.length;
    },

    moveRightOnce: function () {
        var newPos = cc.pAdd(this._gridPosition, cc.p(1, 0));

        if (this.isValidGridPos(newPos)) {
            this.setGridPos(newPos);
        }
    },

    moveLeftOnce: function () {
        var newPos = cc.pSub(this._gridPosition, cc.p(1, 0));

        if (this.isValidGridPos(newPos)) {
            this.setGridPos(newPos);
        }
    },

    moveDownOnce: function () {
        if (this.canMoveDown()) {
            var newPos = cc.pSub(this._gridPosition, cc.p(0, 1));
            this.setGridPos(newPos);
        }
    },

    canMoveDown: function () {
        var newPos = cc.pSub(this._gridPosition, cc.p(0, 1));
        return this.isValidGridPos(newPos);
    },

    startSpeedUp: function () {
        this._speedUp = true;
    },

    stopSpeedUp: function () {
        this._speedUp = false;
    },

    /**
     * 改变运动方向或旋转状态
     */
    changeDirection (dir) {
        this._direction = dir;
    },

    /**
     * 取消运动或旋转状态
     */
    cancelDirection () {
        this._direction = tm.Direction.None;
    },

    /**
     * 刷新形状块元素
     */
    updateBricks: function() {
        //
        this.node.removeAllChildren();

        this._curBricksData = this.bricksTpl[this._curRotateIdx];

        var row = tm.brick_cell_num;

        while (row--) {
            for (let col = 0; col < tm.brick_cell_num; col++) {
                if (!this._curBricksData[row][col]) continue;
                let brick = cc.instantiate(this.brickPrefab);
                brick.setPosition(
                    //col * tm.brick_width + tm.brick_width * 0.5,
                    //(tm.brick_cell_num - row - 1) * tm.brick_height
                    (col + 0.5) * tm.brick_width,
                    (tm.brick_cell_num - row - 0.5) * tm.brick_height
                );
                this.node.addChild(brick);
            }
        }
    },

    /**
     * 处理形状元素自动下落
     */
    update (dt) {
        //
        //this.debugChangeTetrimino(dt);

        switch (this._direction) {
            case tm.Direction.Left:
                this.moveLeftOnce();
                break;

            case tm.Direction.Right:
                this.moveRightOnce();
                break;

            case tm.Direction.Down:
                this.startSpeedUp();
                break;

            case tm.Direction.Rotate:
                this.rotateOnce();
                break;
        }

        // 如果当前出于下落加速状态, 则取消加速
        if (this._direction === tm.Direction.Down) {
            this.stopSpeedUp();
        }

        this._direction = tm.Direction.None;

        // 刷新元素
        this.updateBricks();
    },

    /**
     * 测试代码, 变换形状元素
     */
    debugChangeTetrimino (dt) {
        //
        this._elapsedTime += dt;

        if (this._elapsedTime >= this._fallWaitTime) {
            this.bricksTpl  = tm.utils.randomArrayItems(tm.TetriminoDict)[0];
            this._curRotateIdx = tm.utils.getRandomInt(this.bricksTpl.length);
            this._elapsedTime = 0;
        }
    },
});
