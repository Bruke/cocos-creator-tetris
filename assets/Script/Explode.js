

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
        this._explodeCallfunc = null;  // 爆炸生效回调函数
        this._finishCallfunc = null;   // 爆炸完毕回调函数
    },

    start () {
    },

    // update (dt) {},

    setExplodeCallback (callback) {
        this._explodeCallfunc = callback;
    },

    setExplodeFinishCallback (callback) {
        this._finishCallfunc = callback;
    },

    doExplode () {
        let explodeComp = this.getComponent(cc.Animation);
        explodeComp.play('explode');

        cc.audioEngine.playEffect(this.explodeSound, false);
    },

    onExplodeEffect () {
        //cc.log('explodeEffect');

        //
        if (this._explodeCallfunc) {
            this._explodeCallfunc();
        }
    },

    onExplodeFinish () {
        //var state = event.detail;    // state instanceof cc.AnimationState
        //var type = event.type;       // type === 'play';
        //cc.log('onExplodeFinish');

        //
        if (this._finishCallfunc) {
            this._finishCallfunc();
        }

        if (this.node) {
            this.node.removeFromParent();
        }
    },
});
