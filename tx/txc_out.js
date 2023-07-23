"use strict"
const {parent} = require("gobj4");
const wrap = require("./proxy").wrap;
module.exports = function  () {
var root = {};
Object.defineProperty(root, "s", {
    value: {}
});
Object.defineProperty(root.s, parent, {
    get: () => root
});
Object.defineProperty(root.s, "t", {
    value: {}
});
Object.defineProperty(root.s.t, parent, {
    get: () => root.s
});
Object.defineProperty(root.s.t, "g1", {
    get: function () {
        return this.$.ia*100;
    }
});
Object.defineProperty(root.s.t, "g2", {
    get: function () {
        return 999;
    }
});
Object.defineProperty(root.s.t, "g3", {
    get: function () {
        return this[parent].e2 * 10;
    }
});
Object.defineProperty(root.s, "e1", {
    get: function () {
        return this[parent].f1+2;
    }
});
Object.defineProperty(root.s, "e2", {
    get: function () { return 222 }
});
Object.defineProperty(root, "f1", {
    get: function () {
        return this.ia+1;
    }
});
return wrap(root);
}
