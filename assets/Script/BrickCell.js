
//
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

    setGridIndex (index) {
        this._gridIndex = index;
    },

    getGridIndex () {
        return this._gridIndex;
    },

    // update (dt) {},
});
