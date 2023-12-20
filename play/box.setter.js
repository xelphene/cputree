
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, parent, enumerable
} = require('../index');

function getBoundedPoint() {
    var r = new ObjNode({});
    var P = r[C];

    P.limit.xmin.value = () => -Infinity;
    P.limit.xmax.value = () => Infinity;
    P.limit.ymin.value = () => -Infinity;
    P.limit.ymax.value = () => Infinity;

    P.warn.xmax = new InputNode({defaultValue: false});
    P.warn.ymax = new InputNode({defaultValue: false});
    P.warn.xmin = new InputNode({defaultValue: false});
    P.warn.ymin = new InputNode({defaultValue: false});

    P._value = new InputNode({});
    P._value[enumerable] = false;
    P.value[nget] = function () {
        return this._value;
    }
    P.value[nset] = function (rp) {
        var ap = p(rp.x, rp.y);

        if( ap.x > this.limit.xmax.value ) {
            this.warn.xmin = false;
            this.warn.xmax = true;
            ap.x = this.limit.xmax.value;
        } else if( ap.x < this.limit.xmin.value ) {
            this.warn.xmin = true;
            this.warn.xmax = false;
            ap.x = this.limit.xmin.value;
        } else {
            this.warn.xmin = false;
            this.warn.xmax = false;
        }
        
        if( ap.y > this.limit.ymax.value ) {
            this.warn.ymax = true;
            this.warn.ymin = false;
            ap.y = this.limit.ymax.value;
        } else if( ap.y < this.limit.ymin.value ) {
            this.warn.ymin = true;
            this.warn.ymax = false;
            ap.y = this.limit.ymin.value;
        } else {
            this.warn.ymax = false;
            this.warn.ymin = false;
        }
        
        if( ap.x != this._value.x || ap.y != this._value.y )
            this._value = ap;
    }
    
    return r;
}

function getBox({bounds, spacing})
{
    var r = new ObjNode({});
    var P = r[C];
    P.msgs = new InputNode({});

    P.pts.br = getBoundedPoint();
    P.pts.br.limit.xmin.value = function () { return this[root].pts.tl.value.x + spacing.x; }
    P.pts.br.limit.xmax.value = function () { return bounds.xmax }
    P.pts.br.limit.ymin.value = function () { return this[root].pts.tl.value.y + spacing.y; }
    P.pts.br.limit.ymax.value = function () { return bounds.ymax }
    
    P.pts.tl = getBoundedPoint();
    P.pts.tl.limit.xmin.value = function () { return bounds.xmin }
    P.pts.tl.limit.xmax.value = function () { return this[root].pts.br.value.x - spacing.x }
    P.pts.tl.limit.ymin.value = function () { return bounds.ymin }
    P.pts.tl.limit.ymax.value = function () { return this[root].pts.br.value.y - spacing.y }

    P.warn.prox = function () {
        return [
            this[parent].pts.br.warn.xmin,
            this[parent].pts.br.warn.ymin,
            this[parent].pts.tl.warn.xmax,
            this[parent].pts.tl.warn.ymax
        ].reduce( (a,b) => a || b )
    }
    P.warn.bounds = function () {
        return [
            this[parent].pts.br.warn.xmax,
            this[parent].pts.br.warn.ymax,
            this[parent].pts.tl.warn.xmin,
            this[parent].pts.tl.warn.ymin
        ].reduce( (a,b) => a || b )
    }
    
    return r;
}

function p(x,y) {
    const r = {x,y};
    Object.defineProperty(r, 'toString', {
        get: function () {
            return () => `${x}, ${y}`
        },
        enumerable: false
    });
    return r;
}

var r = getBox({
    bounds: {
        xmin: 0,
        ymin: 0,
        xmax: 500,
        ymax: 400
    },
    spacing: {
        x: 50,
        y: 50
    }
});

//r.logStruct();

r.init({
    msgs: [],
    pts: {
        tl: { _value: p(15,15)   },
        br: { _value: p(100,200) },
    }
});

listen( r.nav('pts.br.value'), v => console.log(`>>> br: ${v.x}, ${v.y}`) );
listen( r.nav('pts.tl.value'), v => console.log(`>>> tl: ${v.x}, ${v.y}`) );
listen( r.nav('warn.prox'),    v => console.warn(`>>> pts.br.warn.prox: ${v}`) );
listen( r.nav('warn.bounds'),    v => console.warn(`>>> pts.br.warn.prox: ${v}`) );

var o = r[O];
console.log(o);
// works
//listen( P.f2, v => console.log(`update f2: ${v}`) );
//listen( root.nav('f2'), v => console.log(`update f2: ${v}`) );

//listen( root.nav('f1'), v => console.log(`update f1: ${v}`) );

var settings = [
    [80,15],
    [30,180],
    [40,15],
    [90,180],
    [90, -9000],
    [9, -9],
    [-8, -8],
    [-8, -8],
];

for( let [x,y] of settings ) {
    let pt = p(x,y);
    console.log('');
    console.log(`SET tl = ${pt}`);
    o.pts.tl.value = pt;
    console.log( o );
}
