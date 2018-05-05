

cc.Class({
    extends: cc.Component,

    properties: {
        explodeSound: cc.AudioClip,  // 爆炸音效
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let explodeComp = this.getComponent(cc.Animation);
        explodeComp.on('stop', this.onExplodeFinish, this);

        //
        this._explodeCallfunc = null;
    },

    start () {
    },

    // update (dt) {},

    setExplodeCallback (callback) {
        this._explodeCallfunc = callback;
    },

    doExplode () {
        let explodeComp = this.getComponent(cc.Animation);
        explodeComp.play('explode');

        cc.audioEngine.playEffect(this.explodeSound, false);
    },

    onExplodeEffect () {
        cc.log('explodeEffect');

        //
        //if (this._explodeCallfunc) {
        //    this._explodeCallfunc();
        //}
    },

    onExplodeFinish () {
        //var state = event.detail;    // state instanceof cc.AnimationState
        //var type = event.type;       // type === 'play';
        cc.log('onExplodeFinish');

        if (this.node) {
            this.node.removeFromParent();
        }

        //
        if (this._explodeCallfunc) {
            this._explodeCallfunc();
        }
    },
});
