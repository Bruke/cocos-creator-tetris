

/**
 * 俄罗斯方块中各种下落的形状元素统称Tetrimino
 */

// 单个块元素宽高
const brick_width  = 30;
const brick_height = 30;

const brick_cell_num = 4;

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

        //
        //this.updateBricks();
    },

    start () {
    },

    updateBricks: function() {
        //
        this.node.removeAllChildren();

        this.bricksMap = this.bricksPlan[this.rotationInd];
        var row = brick_cell_num;

        while (row--) {
            for (let col = 0; col < brick_cell_num; col++) {
                if (!this.bricksMap[row][col]) continue;
                let brick = cc.instantiate(this.brickPrefab);
                brick.setPosition(
                    col * brick_width * (1 + 0.5),
                    (brick_cell_num - row - 1) * brick_height
                );
                this.node.addChild(brick);
            }
        }
    },

    /**
     * 处理形状元素自动下落
     */
    update (dt) {

    },
});
