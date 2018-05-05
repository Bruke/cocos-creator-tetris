

/**
 * 俄罗斯方块中各种下落的形状元素统称Tetrimino
 */

cc.Class({
    extends: cc.Component,

    properties: {
        stepSound: cc.AudioClip,  // 行进音效
        landSound: cc.AudioClip,  // 落地音效

        // 落地后被锁定
        locked: {
            get () {
                return this._isLocked;
            },
            set (value) {
                this._isLocked = !!value;
            }
        },

        // 加速下落
        speedUp: {
            get () {
                return this._speedUp;
            },
            set (value) {
                this._speedUp = !!value;
            }
        },

        // 是否出于按下状态
        isTouchingDown: {
            get () {
                return this._isTouchingDown;
            },
            set (value) {
                this._isTouchingDown = !!value;
            }
        },

        // 是否是炸弹类型
        isBomb: {
            get () {
                return this._isBomb;
            },
            set (value) {
                this._isBomb = !!value;
            }
        },

        _isTouchingDown: false, // 当前是否出于按下状态
        _isLocked: false, // 形状元素落地后锁定不能再移动
        _speedUp: false,  // 按下向下键时加速下落

        _isInitedWithTetrimino: false, // 是否从其他图形元素初始化

        _isBomb: false, // 是否是炸弹类型

        // 构成形状的小元素块
        brickPrefab: cc.Prefab,

        // 炸弹元素块
        bombBrickPrefab: cc.Prefab,
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

        if ( !this._isInitedWithTetrimino ) {
            // 随机选择一个图形模版
            this.bricksTpl = tm.utils.randomArrayItems(tm.TetriminoDict)[0];

            // Test Bomb
            //this.bricksTpl = tm.TetriminoDict[0];

            // 随机当前模版旋转位置
            this._curRotateIdx = tm.utils.getRandomInt(this.bricksTpl.length);
        }

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

        // 先刷新一下, 立即显示
        this.updateBricks();
    },

    start () {
    },

    getBricksTemplate () {
        return this.bricksTpl;
    },

    getBricksData () {
        return this._curBricksData;
    },

    getCurrentRotateIndex () {
        return this._curRotateIdx;
    },

    /**
     * 通过其他形状对象初始化
     * @param tetri
     */
    initWithTetrimino (tetri) {
        let bricksTpl = tetri.getBricksTemplate();
        let curRotateIdx = tetri.getCurrentRotateIndex();

        this.bricksTpl = bricksTpl;
        this._curRotateIdx = curRotateIdx;

        this.updateBricks();

        this._isInitedWithTetrimino = true;
    },

    /**
     * 设置游戏网格坐标
     * @param pos 形状元素左下角在网格中的位置坐标
     */
    setGridPos (pos) {
        if (pos === void 0 || pos.x === void 0 || pos.y === void 0) {
            return;
        }

        this._gridPosition.x = pos.x;
        this._gridPosition.y = pos.y;

        let x = this._gridPosition.x * tm.brick_width;
        let y = this._gridPosition.y * tm.brick_height;

        this.node.setPosition(cc.p(x, y));
    },

    getGridPos () {
        return this._gridPosition;
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
     * @param bricksData
     * @returns {boolean}
     */
    isValidGridPos (gridPos, bricksData) {
        //
        if (bricksData === void 0) {
            bricksData = this._curBricksData;
        }

        let row = tm.brick_cell_num;

        while (row--) {
            for (let col = 0; col < tm.brick_cell_num; col++) {
                if (!bricksData[row][col]) {
                    continue;
                }

                let cellGridPos = cc.p(gridPos.x + col, gridPos.y + tm.brick_cell_num - row - 1);
                let outOfBounds = ( cellGridPos.y < 0 || cellGridPos.x < 0 ||
                                    cellGridPos.x >= tm.grid_width || cellGridPos.y >= tm.grid_height );

                // 是否出了网格边界
                if (outOfBounds) {
                    return false;
                }

                // 该位置网格上是否有其他元素
                let gridBricksMap = tm.gameGridInstance.getGridBricksMap();
                let isCollideWithOtherBrick = gridBricksMap[cellGridPos.y][cellGridPos.x];

                if (isCollideWithOtherBrick) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * 旋转元素
     */
    rotateOnce () {
        // 旋转后的索引和模板数据
        let rotateIndex = (this._curRotateIdx + 1) % this.bricksTpl.length;
        let rotatedBricksMap = this.bricksTpl[rotateIndex];

        let rotatedPaddings = tm.getTetriPaddings(rotatedBricksMap);
        let canRotate = false;

        if (this.isValidGridPos(this._gridPosition, rotatedBricksMap)) {
            // 周围无其他障碍物和边界, 可以直接旋转
            canRotate = true;

        } else {
            // 边界检测
            var leftLedge  = -(this._gridPosition.x + rotatedPaddings.left);
            var rightLedge = (this._gridPosition.x + tm.brick_cell_num - rotatedPaddings.right) - tm.grid_width;
            var correctToRightPos = cc.p(this._gridPosition.x + leftLedge, this._gridPosition.y);
            var correctToLeftPos  = cc.p(this._gridPosition.x - rightLedge, this._gridPosition.y);

            if (leftLedge > 0 && this.isValidGridPos(correctToRightPos, rotatedBricksMap)) {
                this.setGridPos(correctToRightPos);
                canRotate = true;

            } else if (rightLedge > 0 && this.isValidGridPos(correctToLeftPos, rotatedBricksMap)) {
                this.setGridPos(correctToLeftPos);
                canRotate = true;
            }
        }

        // 确定旋转
        if (canRotate) {
            this._curRotateIdx = rotateIndex;
        }
    },

    /**
     * 右移一格
     */
    moveRightOnce: function () {
        let newPos = cc.pAdd(this._gridPosition, cc.p(1, 0));

        if (this.isValidGridPos(newPos)) {
            this.setGridPos(newPos);
        }
    },

    /**
     * 左移一格
     */
    moveLeftOnce: function () {
        let newPos = cc.pSub(this._gridPosition, cc.p(1, 0));

        if (this.isValidGridPos(newPos)) {
            this.setGridPos(newPos);
        }
    },

    /**
     * 下落一格
     */
    moveDownOnce: function () {
        if (this.canMoveDown()) {
            let newPos = cc.pSub(this._gridPosition, cc.p(0, 1));
            this.setGridPos(newPos);
        }
    },

    /**
     * 是否可以继续下落
     * @returns {*|boolean}
     */
    canMoveDown: function () {
        let newPos = cc.pSub(this._gridPosition, cc.p(0, 1));
        return this.isValidGridPos(newPos);
    },

    /**
     * 激活加速
     */
    startSpeedUp: function () {
        this._speedUp = true;
    },

    /**
     * 取消加速
     */
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

    playStepSound () {
        //cc.audioEngine.playEffect(this.stepSound, false);
    },

    playLandSound () {
        cc.audioEngine.playEffect(this.landSound, false);
    },

    /**
     * 刷新形状块元素
     */
    updateBricks: function() {
        //
        this.node.removeAllChildren();

        this._curBricksData = this.bricksTpl[this._curRotateIdx];

        let isBomb = tm.isBombTetrimino(this._curBricksData);
        let row = tm.brick_cell_num;
        let tarPrefab = isBomb ? this.bombBrickPrefab : this.brickPrefab;

        if (isBomb) {
            this._isBomb = true;
            this._curBricksData = tm.convertBombToNormal(this._curBricksData);
        }

        while (row--) {
            for (let col = 0; col < tm.brick_cell_num; col++) {
                if (!this._curBricksData[row][col]) {
                    continue;
                }

                let brick = cc.instantiate(tarPrefab);
                let x = (col + 0.5) * tm.brick_width;
                let y = (tm.brick_cell_num - row - 0.5) * tm.brick_height;
                brick.setPosition(cc.p(x, y));
                this.node.addChild(brick);
            }
        }
    },


    /**
     * 刷新元素移动方向
     * @param dt
     */
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

        this.playStepSound();
    },

    /**
     * 处理元素正常下落
     * @param dt
     */
    updateMoveDown (dt) {
        this._fallElapsedTime += dt;

        if (this._fallElapsedTime >= this._fallWaitTime) {
            this._fallElapsedTime = 0;

            if (this.canMoveDown()) {
                this.moveDownOnce();
                this.playStepSound();  //

            } else {
                this._isLocked = true;
                tm.gameGridInstance.addLockedTetrimino(this);

                this.playLandSound();
            }
        }
    },

    /**
     * 加速下落处理
     * @param dt
     */
    updateSpeedUp (dt) {
        // 如果加速下落就再多下一格
        if (this._speedUp) {
            this.moveDownOnce();
        }
    },


    /**
     * 处理形状元素自动下落
     */
    update (dt) {
        //
        if (this._isLocked || tm.gameGridInstance.getGameState() !== tm.GameStatus.Running) {
            return;
        }

        // 刷新方向
        this.updateDirection(dt);

        // 正常下落
        this.updateMoveDown(dt);

        // 加速下落
        this.updateSpeedUp(dt);

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
