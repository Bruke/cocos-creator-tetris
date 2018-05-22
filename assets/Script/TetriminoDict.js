

window.tm = window.tm || {};

/**
 * 游戏状态
 * @type {{Ready: number, Running: number, Paused: number, GameOver: number}}
 */
tm.GameStatus = cc.Enum({
    Ready:      0,  // 准备就绪
    Running:    1,  // 游戏中
    Paused:     2,  // 暂停
    GameOver:   3   // 游戏结束
});

tm.Direction = cc.Enum({
    None:    9,
    Up:      0,
    Down:    1,
    Left:    2,
    Right:   3,
    Rotate:  4
});

// 网格矩阵的宽高数量
tm.grid_width = 10;
tm.grid_height = 22;

// 单个块元素宽高
tm.brick_width  = 47;
tm.brick_height = 47;

// 每个元素块包含4个基本块元素
tm.brick_cell_num = 4;

// 游戏场景实例对象
tm.gameSceneInstance = null;

// 游戏网格实例对象
tm.gameGridInstance = null;

/**
 * 元素种类及各个变形信息定义
 * @type []
 */
tm.TetriminoDict = [
    /**
     * 全部-1暂定为炸弹块
     */
    [
        [
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1]
        ]
    ],

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
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0]
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


/**
 * 检查是否炸弹元素, 全部为-1即为炸弹
 * @param bricksMap
 * @returns {boolean}
 */
tm.isBombTetrimino = function(bricksMap) {
    let isBomb = true;
    let row = tm.brick_cell_num;

    while (row--) {
        for (let col = 0; col < tm.brick_cell_num; col++) {
            if (bricksMap[row][col] !== -1) {
                isBomb = false;
            }
        }
    }
    return isBomb;
};

/**
 * 把炸弹元素转换为正常格式
 * 转换前
 * [-1, -1, -1, -1],
 * [-1, -1, -1, -1],
 * [-1, -1, -1, -1],
 * [-1, -1, -1, -1]
 *
 * 转换后
 * [0, 0, 0, 0],
 * [0, 0, 0, 0],
 * [0, 1, 0, 0],
 * [0, 0, 0, 0]
 *
 * @param bricksMap
 */
tm.convertBombToNormal = function(bricksMap) {
    let isBomb = tm.isBombTetrimino(bricksMap);
    let result = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ];

    return result;
};

/**
 *
 * @param bricksMap
 * @returns {*}
 */
tm.getTetriPaddings = function(bricksMap) {
    if (!tm.gameGridInstance) {
        return null;
    }

    let gameGrid = tm.gameGridInstance;
    let paddings = {top: 0, right: 0, left: 0};
    let row = tm.brick_cell_num;

    while (row--) {
        if (!gameGrid.isRowEmpty(bricksMap[row])) {
            break;
        }
        paddings.top++;
    }

    for (let i = 0; i < tm.brick_cell_num; i++) {
        if (!gameGrid.isColEmpty(bricksMap, i)) {
            break;
        }
        paddings.left++;
    }

    let col = tm.brick_cell_num;

    while (col--) {
        if (!gameGrid.isColEmpty(bricksMap, col)) {
            break;
        }
        paddings.right++;
    }

    return paddings;
};