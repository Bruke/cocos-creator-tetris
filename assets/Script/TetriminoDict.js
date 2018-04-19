

window.tm = window.tm || {};

tm.Direction = cc.Enum({
    Up:      0,
    Down:    1,
    Left:    2,
    Right:   3
});



/**
 * 元素种类及各个变形信息定义
 * @type {}
 */
tm.TetriminoDict = [

        /**
         * 方块元素, 仅一种变化
         */
        [
            /**
             * oo
             * oo
             */
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        ],

        // T形元素, 共四种变化
        [
            /**
             *    o
             *   ooo
             */
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0]
            ],

            /**
             *    o
             *    oo
             *    o
             */
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 0, 0]
            ],

            /**
             *   ooo
             *    o
             */
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 0],
                [0, 1, 0, 0]
            ],

            /**
             *    o
             *   oo
             *    o
             */
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 1, 0]
            ]
        ],

        //I形元素, 共两种变化
        [
            /**
             *    o
             *    o
             *    o
             *    o
             */
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ],

            /**
             *    oooo
             */
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0]
            ]
        ],

        // L形元素, 共四种变化
        [
            /**
             *    o
             *    o
             *    oo
             */
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0]
            ],

            /**
             *   ooo
             *   o
             */
            [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 1, 0, 0],
                [0, 0, 0, 0]
            ],

            /**
             *   oo
             *    o
             *    o
             */
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0]
            ],

            /**
             *     o
             *   ooo
             */
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        ],

        // 反L形元素, 共四种变化
        [
            /**
             *    o
             *    o
             *   oo
             */
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 1, 1, 0]
            ],

            /**
             *   o
             *   ooo
             */
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 1],
                [0, 0, 0, 0]
            ],

            /**
             *    oo
             *    o
             *    o
             */
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ],

            /**
             *   ooo
             *     o
             */
            [
                [0, 0, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 0]
            ]
        ],


        // Z形元素, 共两种变化
        [
            /**
             *    o
             *   oo
             *   o
             */
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [0, 1, 1, 0],
                [0, 1, 0, 0]
            ],

            /**
             *   oo
             *    oo
             */
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 1, 1],
                [0, 0, 0, 0]
            ]
        ],

        // 反Z形元素, 共两种变化
        [
            /**
             *   o
             *   oo
             *    o
             */
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 1, 0]
            ],

            /**
             *    oo
             *   oo
             */
            [
                [0, 0, 0, 0],
                [0, 0, 1, 1],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        ]
    ];