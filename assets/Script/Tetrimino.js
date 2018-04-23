

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

        this._direction = tm.Direction.None;  // 玩家当前指定方向
        this._isLocked  = false;  // 是否被锁定
        this._speedUp   = false;  // 是否向下加速

        //
        this.node.setContentSize(tm.brick_width * tm.brick_cell_num, tm.brick_height * tm.brick_cell_num);

        this.updateBricks();
    },

    start () {
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

        // Test Code
        this._elapsedTime += dt;
        if (this._elapsedTime >= this._fallWaitTime) {
            this.bricksTpl  = tm.utils.randomArrayItems(tm.TetriminoDict)[0];
            this._curRotateIdx = tm.utils.getRandomInt(this.bricksTpl.length);
            this._elapsedTime = 0;
        }
        // End Test

        //
        this.updateBricks();
    },
});
