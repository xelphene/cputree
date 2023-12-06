
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable
} = require('../index');

function getBoundedPoint() {
    var r = new ObjNode({});
    var P = r[C];
    
    P.value = new InputNode({});

    P.limit.xmin.value = () => -Infinity;
    P.limit.xmin.expn  = () => 'xmin';
    
    P.limit.xmax.value = () => Infinity;
    P.limit.xmax.expn  = () => 'xmax';
    
    P.limit.ymin.value = () => -Infinity;
    P.limit.ymin.expn  = () => 'ymin';
    
    P.limit.ymax.value = () => Infinity;
    P.limit.ymax.expn  = () => 'ymax';
    
    P.set = function () {
        return rp => {
            var ap = p(rp.x, rp.y);
            var result = new Set();
        
            if( ap.x > this.limit.xmax.value ) {
                result.add( this.limit.xmax.expn );
                ap.x = this.limit.xmax.value;
            } else if( ap.x < this.limit.xmin.value ) {
                result.add( this.limit.xmin.expn );
                ap.x = this.limit.xmin.value;
            }
            
            if( ap.y > this.limit.ymax.value ) {
                result.add( this.limit.ymax.expn );
                ap.y = this.limit.ymax.value;
            } else if( ap.y < this.limit.ymin.value ) {
                result.add( this.limit.ymin.expn );
                ap.y = this.limit.ymin.value;
            }
        
            this.value = ap;
            return result;
        }
    }
    P.set[enumerable] = false;
    
    return r;
}

function getBox({bounds, spacing})
{
    var r = new ObjNode({});
    var P = r[C];

    P.pts.br = getBoundedPoint();
    P.pts.br.limit.xmin.value = function () { return this[root].pts.tl.value.x + spacing.x; }
    P.pts.br.limit.xmin.expn  = () => 'prox';
    P.pts.br.limit.xmax.value = function () { return bounds.xmax }
    P.pts.br.limit.xmin.expn  = () => 'bounds';
    P.pts.br.limit.ymin.value = function () { return this[root].pts.tl.value.y + spacing.y; }
    P.pts.br.limit.ymin.expn  = () => 'prox';
    P.pts.br.limit.ymax.value = function () { return bounds.ymax }
    P.pts.br.limit.ymax.expn  = () => 'bounds';
    
    P.pts.tl = getBoundedPoint();
    P.pts.tl.limit.xmin.value = function () { return bounds.xmin }
    P.pts.tl.limit.xmin.expn  = () => 'bounds';
    P.pts.tl.limit.xmax.value = function () { return this[root].pts.br.value.x - spacing.x }
    P.pts.tl.limit.xmax.expn  = () => 'prox';
    P.pts.tl.limit.ymin.value = function () { return bounds.ymin }
    P.pts.tl.limit.ymin.expn  = () => 'bounds';
    P.pts.tl.limit.ymax.value = function () { return this[root].pts.br.value.y - spacing.y }
    P.pts.tl.limit.ymax.expn  = () => 'prox';
    
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
    pts: {
        tl: { value: p(15,15)   },
        br: { value: p(100,200) },
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
    console.log('');
    console.log(`SET ${pt}`);
    console.log( o.pts.tl.set( pt ) );
    console.log( o );
}
