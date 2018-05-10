

/**
 * 炸弹基本元素对象
 * 爆炸时可消除以自身位置为中心 3 x 3 范围的格子对象
 */

// 继承自基本网格对象
let BrickCell = require("BrickCell");

cc.Class({
    extends: BrickCell,

    properties: {
        // 爆炸特效
        explodePrefab: cc.Prefab,

        // get set 方法
        effectRadius : {
            get () {
                return this._effectRadius;
            },
            set (value) {
                this._effectRadius = value;
            }
        },

        // 爆炸范围半径
        _effectRadius: 3,

        // 触发爆炸标志
        _readyToBomb: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 爆炸特效对象
        let explode = this._explode = cc.instantiate(this.explodePrefab);
        this.node.addChild(explode);

        let self = this;
        let explodeComp = explode.getComponent('Explode');

        // 设置爆炸生效回调函数
        explodeComp.setExplodeCallback(function () {
            self.onBrickExplode();
        });

        // 设置爆炸完成回调函数
        explodeComp.setExplodeFinishCallback(function () {
            self.onBrickExplodeFinish();
        });
    },

    start () {
    },

    update (dt) {
        // 检查是否触发爆炸条件
        if (this._readyToBomb && this._explode) {
            let explodeComp = this._explode.getComponent('Explode');
            explodeComp.doExplode();
            //
            this._readyToBomb = false;
            this._explode = null;
        }
    },

    /**
     * 触发爆炸
     */
    doExplode () {
        this._readyToBomb = true;
    },

    onBrickExplode () {
    },

    onBrickExplodeFinish () {
        // 发送系统消息
        let event = new cc.Event.EventCustom('BrickExplode', true);
        event.setUserData({'brickIndex': this._gridIndex});
        cc.systemEvent.dispatchEvent(event);
    }
});

