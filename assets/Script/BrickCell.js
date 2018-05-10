
/**
 * 基本网格元素对象
 * 用来组成Tetrimino形状元素以及用来填充全局网格格子空间
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _gridIndex: -1,  // 元素块在网格中的索引位置: 行数 x 每行元素数 + 列数
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        //this.node.runAction(cc.repeatForever(cc.rotateBy(3, 360)));
    },

    /**
     * 设置在场景网格中的位置索引
     * @param index
     */
    setGridIndex (index) {
        this._gridIndex = index;
    },

    /**
     * 获得所在场景网格中的位置索引
     * @returns {number|*}
     */
    getGridIndex () {
        return this._gridIndex;
    },

    // update (dt) {},
});
