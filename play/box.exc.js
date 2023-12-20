
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable, bexist, excTopNode
} = require('../index');

class OKError extends Error {
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

function getBoundedPoint(expn) {
    var r = new ObjNode({});
    var P = r[C];
    
    P.limit.xmin = () => -Infinity;
    P.limit.xmax = () => Infinity;
    P.limit.ymin = () => -Infinity;
    P.limit.ymax = () => Infinity;
 
    P._value = new InputNode({});  
    P._value[enumerable] = false;
    P.value[nget] = function () { return this._value }
    P.value[nset] = function (rp) {
        if( rp.x > this.limit.xmax )
            throw new OKError(expn.xmax);
        else if( rp.x < this.limit.xmin )
            throw new OKError(expn.xmin);
        
        if( rp.y > this.limit.ymax )
            throw new OKError(expn.ymax);
        else if( rp.y < this.limit.ymin )
            throw new OKError(expn.ymin);
        this._value = rp;
    }
    
    return r;
}

function getBox({bounds, spacing})
{
    var r = new ObjNode({});
    r.addSliderKey('$');
    var P = r[C];

    P.pts.br = getBoundedPoint({
        xmin: 'prox', xmax: 'bouds',
        ymin: 'prox', ymax: 'bounds'
    });
    P.pts.br.limit.xmin = function () { return this.$.pts.tl.value.x + spacing.x; }
    P.pts.br.limit.xmax = function () { return bounds.xmax }
    P.pts.br.limit.ymin = function () { return this.$.pts.tl.value.y + spacing.y; }
    P.pts.br.limit.ymax = function () { return bounds.ymax }
    
    P.pts.tl = getBoundedPoint({
        xmin: 'bounds', xmax: 'prox',
        ymin: 'bounds', ymax: 'prox'
    });
    P.pts.tl.limit.xmin = function () { return bounds.xmin }
    P.pts.tl.limit.xmax = function () { return this.$.pts.br.value.x - spacing.x }
    P.pts.tl.limit.ymin = function () { return bounds.ymin }
    P.pts.tl.limit.ymax = function () { return this.$.pts.br.value.y - spacing.y }
    
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
    pts: {
        tl: { _value: p(15,15)   },
        br: { _value: p(100,200) },
    }
});

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
    console.log('='.repeat(80));
    console.log('');
    console.log(`SET tl = ${pt}`);
    try {
        o.pts.tl.value = pt;
    } catch (e) {
        if( e instanceof OKError ) {
            console.log(`>>> okerr: top: ${e[excTopNode].fullName}   msg: ${e.message}`);
        } else
            throw e;
    }
    console.log( o.pts.tl );
}
