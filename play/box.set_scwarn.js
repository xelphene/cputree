
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, parent, enumerable
} = require('../index');

function getBoundedPoint(warn, expn) {
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
            warn(expn.xmax);
            ap.x = this.limit.xmax.value;
        } else if( ap.x < this.limit.xmin.value ) {
            warn(expn.xmin);
            ap.x = this.limit.xmin.value;
        }
        
        if( ap.y > this.limit.ymax.value ) {
            warn(expn.ymax);
            ap.y = this.limit.ymax.value;
        } else if( ap.y < this.limit.ymin.value ) {
            warn(expn.ymin);
            ap.y = this.limit.ymin.value;
        }
        
        if( ap.x != this._value.x || ap.y != this._value.y )
            this._value = ap;
    }
    
    return r;
}

function getBox({warn, bounds, spacing})
{
    var r = new ObjNode({});
    var P = r[C];

    P.pts.br = getBoundedPoint(warn, {
        xmin: 'prox', xmax: 'bouds',
        ymin: 'prox', ymax: 'bounds'
    });
    P.pts.br.limit.xmin.value = function () { return this[root].pts.tl.value.x + spacing.x; }
    P.pts.br.limit.xmax.value = function () { return bounds.xmax }
    P.pts.br.limit.ymin.value = function () { return this[root].pts.tl.value.y + spacing.y; }
    P.pts.br.limit.ymax.value = function () { return bounds.ymax }
    
    P.pts.tl = getBoundedPoint(warn, {
        xmin: 'bounds', xmax: 'prox',
        ymin: 'bounds', ymax: 'prox'
    });
    P.pts.tl.limit.xmin.value = function () { return bounds.xmin }
    P.pts.tl.limit.xmax.value = function () { return this[root].pts.br.value.x - spacing.x }
    P.pts.tl.limit.ymin.value = function () { return bounds.ymin }
    P.pts.tl.limit.ymax.value = function () { return this[root].pts.br.value.y - spacing.y }
    
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

function warn(expn) {
    console.log(`!!! ${expn}`);
}

var r = getBox({
    warn,
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

// TODO
//listenWarn( r.nav('pts.br.value'), w => console.log(`!!! br: ${w}`) );
//listenWarn( r.nav('pts.tl.value'), w => console.log(`!!! tl: ${w}`) );
listen( r.nav('pts.br.value'), v => console.log(`>>> br: ${v.x}, ${v.y}`) );
listen( r.nav('pts.tl.value'), v => console.log(`>>> tl: ${v.x}, ${v.y}`) );

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
