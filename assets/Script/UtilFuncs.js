
window.tm = window.tm || {};

tm.utils = {

    getRandomInt: function (num) {
        return Math.floor(Math.random() * num)
    },

    getRandomArrItem: function (arr) {
        return arr[tm.utils.getRandomInt(arr.length)]
    },
        /**
     * 自定义UUID,不能确保100%唯一
     * @param len 长度
     * @param radix 2/10/16 进制数
     * @returns {string}
     */
    uuid : function (len, radix) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [], i;

        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) {
                uuid[i] = chars[0 | Math.random() * radix];
            }

        } else {
            // rfc4122, version 4 form
            let r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }
};