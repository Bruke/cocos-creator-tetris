
let BrickCell = require("BrickCell");

cc.Class({
    extends: BrickCell,

    properties: {
        // 爆炸特效
        explodePrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // Test Explode
        let explode = cc.instantiate(this.explodePrefab);
        this.node.addChild(explode);

        let self = this;
        let explodeComp = explode.getComponent('Explode');
        explodeComp.setExplodeCallback(function () {
            self.onBrickExplode();
        });

        explodeComp.doExplode();
    },

    // update (dt) {},

    onBrickExplode () {
        // 发送系统消息
        let event = new cc.Event.EventCustom('BrickExplode', true);
        event.setUserData({'brickIndex': this._gridIndex});
        cc.systemEvent.dispatchEvent(event);
    },
});
