
let BrickCell = require("BrickCell");

cc.Class({
    extends: BrickCell,

    properties: {
        // 爆炸特效
        explodePrefab: cc.Prefab,

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
        //
        let explode = this._explode = cc.instantiate(this.explodePrefab);
        this.node.addChild(explode);

        let self = this;
        let explodeComp = explode.getComponent('Explode');
        explodeComp.setExplodeCallback(function () {
            self.onBrickExplode();
        });

        // Test Explode
        //explodeComp.doExplode();
    },

    start () {
    },

    update (dt) {
        if (this._readyToBomb && this._explode) {
            let explodeComp = this._explode.getComponent('Explode');
            explodeComp.doExplode();
            //
            this._readyToBomb = false;
            this._explode = null;
        }
    },

    doExplode () {
        this._readyToBomb = true;
    },

    onBrickExplode () {
        // 发送系统消息
        let event = new cc.Event.EventCustom('BrickExplode', true);
        event.setUserData({'brickIndex': this._gridIndex});
        cc.systemEvent.dispatchEvent(event);
    },
});
