
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

function getBoundedPoint() {
    var T = ct.build();
    
    T.value = ct.value;

    T.limit.xmin.value = ct.fixed( -Infinity );
    T.limit.xmin.expn  = ct.fixed( 'xmin' );
    
    T.limit.xmax.value = ct.fixed( Infinity );
    T.limit.xmax.expn  = ct.fixed( 'xmax' );
    
    T.limit.ymin.value = ct.fixed( -Infinity );
    T.limit.ymin.expn  = ct.fixed( 'ymin' );
    
    T.limit.ymax.value = ct.fixed( Infinity );
    T.limit.ymax.expn  = ct.fixed( 'ymax' );
    
    // GOBJ5: could this be automatically detected as a method?
    // parse number of arguments
    T.set = ct.nonEnum( ct.method( (t,rp) => {
        var ap = p(rp.x, rp.y);
        var result = new Set();
    
        if( ap.x > t.limit.xmax.value ) {
            result.add( t.limit.xmax.expn );
            ap.x = t.limit.xmax.value;
        } else if( ap.x < t.limit.xmin.value ) {
            result.add( t.limit.xmin.expn );
            ap.x = t.limit.xmin.value;
        }
        
        if( ap.y > t.limit.ymax.value ) {
            result.add( t.limit.ymax.expn );
            ap.y = t.limit.ymax.value;
        } else if( ap.y < t.limit.ymin.value ) {
            result.add( t.limit.ymin.expn );
            ap.y = t.limit.ymin.value;
        }
    
        t.value = ap;
        return result;
    }));
    // GOBJ5: could do a ct.nonEnum( <node_builder> )
    // T.set = ct.nonEnum( ct.method( ... ) )
    //ct.setEnumerable( T.set, false);    

    return t;
}

function getBox({bounds, spacing})
{
    var T = ct.build();

    T.pts.br = getBoundedPoint();
    T.pts.br.limit.xmin.value = t => t.pts.tl.value.x + spacing.x
    T.pts.br.limit.xmin.expn  = t => 'prox'
    T.pts.br.limit.xmax.value = t => bounds.xmax
    T.pts.br.limit.xmin.expn  = t => 'bounds'
    T.pts.br.limit.ymin.value = t => t.pts.tl.value.y + spacing.y
    T.pts.br.limit.ymin.expn  = t => 'prox'
    T.pts.br.limit.ymax.value = t => bounds.ymax
    T.pts.br.limit.ymax.expn  = t => 'bounds'
    
    T.pts.tl = getBoundedPoint();
    T.pts.tl.limit.xmin.value = t => bounds.xmin
    T.pts.tl.limit.xmin.expn  = t => 'bounds'
    T.pts.tl.limit.xmax.value = t => t.pts.br.value.x - spacing.x
    T.pts.tl.limit.xmax.expn  = t => 'prox'
    T.pts.tl.limit.ymin.value = t => bounds.ymin
    T.pts.tl.limit.ymin.expn  = t => 'bounds'
    T.pts.tl.limit.ymax.value = t => t.pts.br.value.y - spacing.y
    T.pts.tl.limit.ymax.expn  = t => 'prox'
    
    return r;
}

function getUI({bounds, spacing})
{
    var T = ct.build();
        
    T.model = getBox({bounds, spacing});
    
    T.ui.warn.prox = new InputNode({});
    T.ui = bexist; // TODO: strange bug if this is omitted
    T.ui.tl = ct.getset(
        t => t.model.pts.tl.value,
        (t,v) => {
            let r = t.model.pts.tl.set(v);
            if( r.has('prox') )
                t.warn.prox = true;
            else
                t.warn.prox = false;
        }
    );
    
    P.ui.br = t => t.model.pts.br.value;
    
    return r;
}


var r = getUI({
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
    model: {
        pts: {
            tl: { value: p(15,15)   },
            br: { value: p(100,200) },
        },
    },
    warn: {
        proxy: false
    }
});

listen( r.nav('model.pts.br.value'), v => console.log(`>>> br: ${v.x}, ${v.y}`) );
listen( r.nav('model.pts.tl.value'), v => console.log(`>>> tl: ${v.x}, ${v.y}`) );
listen( r.nav('ui.warn.prox'), v => {
    if( v )
        console.log('>>> PROX WARNING') 
    else
        console.log('>>> no prox warning');
});

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
    console.log( o.ui.tl = pt );
    console.log( o.model.pts.tl );
}
