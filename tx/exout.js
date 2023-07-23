
'use strict';

var o = {};

Object.defineProperty(o, 'ia', {
    get: function () {
        return this._ia;
    },
    set: function (v) {
        this._ia = v;
    }
});

Object.defineProperty(o, 'f1', {
    get: function () {
        return this.ia+1;
    }
});

o.ia = 10;
console.log(o.f1);
