
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable, bexist
} = require('../index');

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

function getBoundedPoint(expn)
{
    var T = ct.build();    

    T.limit.xmin = () => -Infinity;
    T.limit.xmax = () => Infinity;
    T.limit.ymin = () => -Infinity;
    T.limit.ymax = () => Infinity;

    T.value = ct.guard( (t,rp) => {
        if( rp.x > this.limit.xmax )
            throw new OKError(expn.xmax);
        else if( rp.x < this.limit.xmin )
            throw new OKError(expn.xmin);
        
        if( rp.y > this.limit.ymax )
            throw new OKError(expn.ymax);
        else if( rp.y < this.limit.ymin )
            throw new OKError(expn.ymin);
        this._value = rp;
    });

    return T;
}

function getBox({bounds, spacing})
{
    var T = ct.build();

    T.pts.br = getBoundedPoint({
        xmin: 'prox', xmax: 'bouds',
        ymin: 'prox', ymax: 'bounds'
    });
    T.pts.br.limit.xmin = t => t.pts.tl.value.x + spacing.x
    T.pts.br.limit.xmax = t => bounds.xmax
    T.pts.br.limit.ymin = t => t.pts.tl.value.y + spacing.y
    T.pts.br.limit.ymax = t => bounds.ymax
    
    T.pts.tl = getBoundedPoint({
        xmin: 'bounds', xmax: 'prox',
        ymin: 'bounds', ymax: 'prox'
    });
    T.pts.tl.limit.xmin = t => bounds.xmin
    T.pts.tl.limit.xmax = t => t.pts.br.value.x - spacing.x
    T.pts.tl.limit.ymin = t => bounds.ymin
    T.pts.tl.limit.ymax = t => t.pts.br.value.y - spacing.y
     
    return T;
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
        if( e instanceof OKError )
            console.log(`>>> okerr: ${e.message}`);
        else
            throw e;
    }
    console.log( o.pts.tl );
}
