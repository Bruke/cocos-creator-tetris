/**
 * 爆炸特效对象
 */
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

    /**
     * 设置爆炸回调函数
     * @param callback
     */
    setExplodeCallback (callback) {
        this._explodeCallfunc = callback;
    },

    /**
     * 设置爆炸结束回调函数
     * @param callback
     */
    setExplodeFinishCallback (callback) {
        this._finishCallfunc = callback;
    },

    /**
     * 触发爆炸
     */
    doExplode () {
        // 爆炸效果
        let explodeComp = this.getComponent(cc.Animation);
        explodeComp.play('explode');

        // 爆炸音效
        cc.audioEngine.playEffect(this.explodeSound, false);
    },

    /**
     * 爆炸生效
     */
    onExplodeEffect () {
        //cc.log('explodeEffect');

        // 调用回调函数
        if (this._explodeCallfunc) {
            this._explodeCallfunc();
        }
    },

    /**
     * 爆炸完成
     */
    onExplodeFinish () {
        //var state = event.detail;    // state instanceof cc.AnimationState
        //var type = event.type;       // type === 'play';
        //cc.log('onExplodeFinish');

        // 调用回调函数
        if (this._finishCallfunc) {
            this._finishCallfunc();
        }

        // 爆炸结束，删除自身
        if (this.node) {
            this.node.removeFromParent();
        }
    },
});
