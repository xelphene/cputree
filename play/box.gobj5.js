
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable
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

function getBox({bounds, spacing})
{
    var T = ct.build();
    
    T.pts.br.limit.xmin = t => t.pts.tl.val.x + spacing.x
    T.pts.br.limit.xmax = t => bounds.xmax
    T.pts.br.limit.ymin = t => t.pts.tl.val.y + spacing.y
    T.pts.br.limit.ymax = t => bounds.ymax

    T.pts.br.val = value;
    ct.sanitize( T.pts.br.val, [
        [ (t,v) => v.x <= t.pts.br.limit.xmax, (t,v) => t.pts.br.limit.xmax ],
        [ (t,v) => v.x >= t.pts.br.limit.xmin, (t,v) => t.pts.br.limit.xmin ],
        [ (t,v) => v.y <= t.pts.br.limit.ymax, (t,v) => t.pts.br.limit.ymax ],
        [ (t,v) => v.y >= t.pts.br.limit.ymin, (t,v) => t.pts.br.limit.ymin ],
    ]);

    ///////////////////////////////////////

    T.pts.tl.limit.xmin = t => bounds.xmin
    T.pts.tl.limit.xmax = t => t.pts.br.val.x - spacing.x
    T.pts.tl.limit.ymin = t => bounds.ymin
    T.pts.tl.limit.ymax = t => t.pts.br.val.y - spacing.y
    
    T.pts.tl.val = value;
    ct.sanitize( T.pts.tl.val, [
        [ (t,v) => v.x <= t.pts.tl.limit.xmax, t => t.pts.tl.limit.xmax ],
        [ (t,v) => v.x >= t.pts.tl.limit.xmin, t => t.pts.tl.limit.xmin ],
        [ (t,v) => v.y <= t.pts.tl.limit.ymax, t => t.pts.tl.limit.ymax ],
        [ (t,v) => v.y >= t.pts.tl.limit.ymin, t => t.pts.tl.limit.ymin ],
    ]);
    
    t.sanitize( T.pts.tl.val, [
        (t,v) => v.x <= t.pts.tl.limit.xmax ? [t.pts.tl.limit.xmax, ['prox']],
    ]);
    
    return T;
}

function getBox({bounds, spacing})
{
    var T = ct.build();
    
    T.pts.br.limit.xmin = t => t.pts.tl.eff.x + spacing.x
    T.pts.br.limit.xmax = t => bounds.xmax
    T.pts.br.limit.ymin = t => t.pts.tl.eff.y + spacing.y
    T.pts.br.limit.ymax = t => bounds.ymax

    T.pts.br.req = value;
    T.pts.br.eff = function () {
        var ap = p(this.req.x, this.req.y);
        if( ap.x > this.limit.xmax )
            ap.x = this.limit.xmax;
        else if( ap.x < this.limit.xmin )
            ap.x = this.limit.xmin;
        
        if( ap.y > this.limit.ymax )
            ap.y = this.limit.ymax;
        else if( ap.y < this.limit.ymin )
            ap.y = this.limit.ymin;
        return ap;
    }
    ///////////////////////////////////////

    T.pts.tl.limit.xmin = t => bounds.xmin
    T.pts.tl.limit.xmax = t => t.pts.br.eff.x - spacing.x
    T.pts.tl.limit.ymin = t => bounds.ymin
    T.pts.tl.limit.ymax = t => t.pts.br.eff.y - spacing.y
    
    T.pts.tl.val = value;
    T.pts.tl.set = function (t) { // METHOD
        return v => {
            var ap = p(v.x, v.y);
            if( ap.x > this.limit.xmax )
                ap.x = this.limit.xmax;
            else if( ap.x < this.limit.xmin )
                ap.x = this.limit.xmin;
            
            if( ap.y > this.limit.ymax )
                ap.y = this.limit.ymax;
            else if( ap.y < this.limit.ymin )
                ap.y = this.limit.ymin;
            return ap;
        }
    }
    
    return T;
}

function getBox({bounds, spacing})
{
    var T = ct.build();
    
    /*
    T.pts.br.limit.xmin = t => t.pts.tl.val.x + spacing.x
    T.pts.br.limit.xmax = t => bounds.xmax
    T.pts.br.limit.ymin = t => t.pts.tl.val.y + spacing.y
    T.pts.br.limit.ymax = t => bounds.ymax

    T.pts.br.val = value;
    ct.sanitize( T.pts.br.val, [
        [ (t,v) => v.x <= t.pts.br.limit.xmax, (t,v) => t.pts.br.limit.xmax ],
        [ (t,v) => v.x >= t.pts.br.limit.xmin, (t,v) => t.pts.br.limit.xmin ],
        [ (t,v) => v.y <= t.pts.br.limit.ymax, (t,v) => t.pts.br.limit.ymax ],
        [ (t,v) => v.y >= t.pts.br.limit.ymin, (t,v) => t.pts.br.limit.ymin ],
    ]);
    */

    ///////////////////////////////////////

    T.pts.tl.eff = value;
    
    T.pts.tl.limit.xmin = t => bounds.xmin
    T.pts.tl.limit.xmax = t => t.pts.br.eff.x - spacing.x
    T.pts.tl.limit.ymin = t => bounds.ymin
    T.pts.tl.limit.ymax = t => t.pts.br.eff.y - spacing.y
    
    T.pts.tl.req = value;
    ct.sanitize( T.pts.tl.val, [
        [ (t,v) => v.x <= t.pts.tl.limit.xmax, t => t.pts.tl.limit.xmax ],
        [ (t,v) => v.x >= t.pts.tl.limit.xmin, t => t.pts.tl.limit.xmin ],
        [ (t,v) => v.y <= t.pts.tl.limit.ymax, t => t.pts.tl.limit.ymax ],
        [ (t,v) => v.y >= t.pts.tl.limit.ymin, t => t.pts.tl.limit.ymin ],
    ]);
    
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

ct.listenFor( r.pts.br.val, 'sanitized', (t, prop, proposed, adjusted) => {
    console.warn(`${ct.pathOf(prop)} value ${proposed} exceeds limit ${adjusted}`);
}

console.log( p(15,15) );
console.log( ''+p(15,15) );

r.init({
    pts: {
        tl: { _val: p(15,15)   },
        br: { _val: p(100,200) },
    }
});

listen( r.nav('pts.br._val'), v => console.log(`new br: ${v.x}, ${v.y}`) );
listen( r.nav('pts.tl._val'), v => console.log(`new tl: ${v.x}, ${v.y}`) );

var o = r[O];
console.log(o);
// works
//listen( P.f2, v => console.log(`update f2: ${v}`) );
//listen( root.nav('f2'), v => console.log(`update f2: ${v}`) );

//listen( root.nav('f1'), v => console.log(`update f1: ${v}`) );

console.log('-');
o.pts.tl.val = p(80,15);
console.log( o );

console.log('-');
o.pts.tl.val = p(30,180);
console.log( o );

console.log('-');
o.pts.tl.val = p(40,15);
console.log( o );

console.log('-');
o.pts.tl.val = p(90,190);
console.log( o );
