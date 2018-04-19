

// 单个块元素宽高
const brick_width  = 30;
const brick_height = 30;


cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._curTetrimino = null;

        // 网格范围为 10 * 20
        this._gridSize = cc.size(10, 20);

        // 设置网格节点宽高
        this.node.setContentSize(brick_width * this._gridSize.width, brick_height * this._gridSize.height);
    },

    start () {

    },

    update (dt) {
        if (!this._curTetrimino) {
            return;
        }

        this._curTetrimino.update(dt);

        if (this._curTetrimino.isFrozen) {
            this._curTetrimino = null;
        }
    },

    //

});
