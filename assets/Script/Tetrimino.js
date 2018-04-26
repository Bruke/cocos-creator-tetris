

/**
 * 俄罗斯方块中各种下落的形状元素统称Tetrimino
 */

cc.Class({
    extends: cc.Component,

    properties: {

        locked: {
            get () {
                return this._isLocked;
            },
            set (value) {
                this._isLocked = !!value;
            }
        },

        speedUp: {
            get () {
                return this._speedUp;
            },
            set (value) {
                this._speedUp = !!value;
            }
        },

        isTouchingDown: {
            get () {
                return this._isTouchingDown;
            },
            set (value) {
                this._isTouchingDown = !!value;
            }
        },

        _isTouchingDown: false, // 当前是否出于按下状态
        _isLocked: false, // 形状元素落地后锁定不能再移动
        _speedUp: false,  // 按下向下键时加速下落

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
        this._fallElapsedTime = 0; // 下落累积时间

        // 当长按旋转键时, 连续两次变换间隔时间
        this._changeActionInterval = 0.1;

        // 旋转累积时间
        this._changeElapsedTime = -1;

        // 随机选择一个图形模版
        this.bricksTpl  = tm.utils.randomArrayItems(tm.TetriminoDict)[0];

        // 随机当前模版旋转位置
        this._curRotateIdx = tm.utils.getRandomInt(this.bricksTpl.length);

        // 当前图形显示数据
        this._curBricksData = [];

        // 玩家当前指定方向
        this._direction = tm.Direction.None;

        // 图形元素在10x20游戏网格中的矩阵坐标 x[0~10] y[0~20]
        this._gridPosition = cc.p(0, 0);

        // 图形在网格矩阵中的出生位置, 上方居中
        this._bornGridPos = cc.p(3, 16);  // 形状元素左下角在网格中的位置坐标

        //
        this.node.setContentSize(tm.brick_width * tm.brick_cell_num, tm.brick_height * tm.brick_cell_num);

        // debug
        //let action = cc.repeatForever(cc.rotateBy(3, 360));
        //this.node.runAction(action);
    },

    start () {
    },

    /**
     * 设置游戏网格坐标
     * @param pos 形状元素左下角在网格中的位置坐标
     */
    setGridPos: function (pos) {
        if (pos === void 0 || pos.x === void 0 || pos.y === void 0) {
            return;
        }

        this._gridPosition.x = pos.x;
        this._gridPosition.y = pos.y;

        let size = this.node.getContentSize();

        // 形状元素锚点为(0.5, 0.5), 要加上自身宽高的一半
        //let x = this._gridPosition.x * tm.brick_width + size.width / 2;
        //let y = this._gridPosition.y * tm.brick_height + size.height / 2;

        let x = this._gridPosition.x * tm.brick_width;
        let y = this._gridPosition.y * tm.brick_height;

        this.node.setPosition(cc.p(x, y));
    },

    /**
     * 初始化到出生点位置
     */
    initToBornPosition () {
        this.setGridPos(this._bornGridPos);
    },

    /**
     * 检查是否为有效的网格坐标
     * @param gridPos
     * @returns {boolean}
     */
    isValidGridPos (gridPos) {
        let bricksData = this._curBricksData;
        let row = tm.brick_cell_num;

        while (row--) {
            for (let col = 0; col < tm.brick_cell_num; col++) {
                if (!bricksData[row][col]) {
                    continue;
                }

                let cellGridPos = cc.p(gridPos.x + col, gridPos.y + tm.brick_cell_num - row - 1);

                let outOfBounds = (
                    cellGridPos.y < 0 || cellGridPos.x < 0 ||
                    cellGridPos.x >= tm.grid_width ||
                    cellGridPos.y >= tm.grid_height
                );

                // 是否出了网格边界
                if (outOfBounds) {
                    return false;
                }

                // 该位置网格上是否有其他元素
                /*
                let isCollideWithOtherBrick = this.grid.bricksMap[cellGridPos.y][cellGridPos.x];
                if (isCollideWithOtherBrick) {
                    return false;
                }
                */
            }
        }

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
        // 如果当前出于下落加速状态, 则取消加速
        if (!this._isTouchingDown && this._direction === tm.Direction.Down) {
            this.stopSpeedUp();
        }

        this._changeElapsedTime = -1;
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

    updateDirection (dt) {
        //
        if (!this._isTouchingDown) {
            return;
        }

        if (this._changeElapsedTime !== -1 && this._changeElapsedTime < this._changeActionInterval) {
            this._changeElapsedTime += dt;
            return;
        }

        this._changeElapsedTime = 0;

        //
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
    },


    /**
     * 处理形状元素自动下落
     */
    update (dt) {
        //

        // 刷新方向
        this.updateDirection(dt);

        if (this._speedUp) {
            this.moveDownOnce();
        }

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
