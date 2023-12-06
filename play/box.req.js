
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable
} = require('../index');

function getBoundedPoint() {
    var r = new ObjNode({});
    var P = r[C];

    P.limit.xmin.value = () => -Infinity;
    P.limit.xmax.value = () => Infinity;
    P.limit.ymin.value = () => -Infinity;
    P.limit.ymax.value = () => Infinity;

    P._value = new InputNode({});
    P.value[nget] = function () {
        return this._value;
    }
    P._req = new InputNode({});
    P.req[nget] = function () { return this._req }
    P.req[nset] = function (rp) {
        var ap = p(rp.x, rp.y);

        if( ap.x > this.limit.xmax.value )
            ap.x = this.limit.xmax.value;
        else if( ap.x < this.limit.xmin.value )
            ap.x = this.limit.xmin.value;
        
        if( ap.y > this.limit.ymax.value )
            ap.y = this.limit.ymax.value;
        else if( ap.y < this.limit.ymin.value )
            ap.y = this.limit.ymin.value;
        
        if( ap.x != this._value.x || ap.y != this._value.y )
            this._value = ap;
    }
    
    P.warnings = new InputNode({});
    
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
    P.pts.br.proxError = function () {
        if( this.req === undefined ) return false;
        return (
            this.req.x < this.limit.xmin.value ||
            this.req.y < this.limit.ymin.value
        );
    }
    P.pts.br.boundsError = function () {
        if( this.req === undefined ) return false;
        return (
            this.req.x > this.limit.xmax.value ||
            this.req.y > this.limit.ymax.value
    }
        
        
    P.pts.tl = getBoundedPoint();
    P.pts.tl.limit.xmin.value = function () { return bounds.xmin }
    P.pts.tl.limit.xmax.value = function () { return this[root].pts.br.value.x - spacing.x }
    P.pts.tl.limit.ymin.value = function () { return bounds.ymin }
    P.pts.tl.limit.ymax.value = function () { return this[root].pts.br.value.y - spacing.y }
    P.pts.tl.proxError = function () {
        if( this.req === undefined ) return false;
        return (
            this.req.x > this.limit.xmax.value ||
            this.req.y > this.limit.ymax.value
        );
    }
    P.pts.br.boundsError = function () {
        if( this.req === undefined ) return false;
        return (
            this.req.x < this.limit.xmin.value ||
            this.req.y < this.limit.ymin.value
        );
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
listen( r.nav('msgs'),         v => console.warn(`>>> msgs: ${v}`) );

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
