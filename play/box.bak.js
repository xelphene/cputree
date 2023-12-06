
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable
} = require('../index');

function getBox({bounds, spacing})
{
    var r = new ObjNode({});
    var P = r[C];

    ///////////////////////////////////////

    P.pts.br.cur = new InputNode({});

    // TODO: use ensure like this:
    // ensure 0: points are points
    // ensure 1: points are within bounds
    // ensure 2: tl is above & left of br
    // ensure 3: tl is bounds distance away from br
    // current limit assumes init vals are in bounds, spaced
    // from each other and leaves spacing for other point
    
    P.pts.br.limit.xmin = function () { return this[root].pts.tl.cur.x + spacing.x; }
    P.pts.br.limit.xmax = function () { return bounds.xmax }
    P.pts.br.limit.ymin = function () { return this[root].pts.tl.cur.y + spacing.y; }
    P.pts.br.limit.ymax = function () { return bounds.ymax }
    
    P.pts.br._req = new InputNode({});
    P.pts.br._req[enumerable] = false;
    P.pts.br.req[nget] = function () { return this._req };
    P.pts.br.req[nset] = function (rp) {
        this._req = p(rp.x, rp.y);
        var ep = p(rp.x, rp.y);
        if( ep.x < this[root].pts.tl.cur.x - spacing.x )
            ep.x = this[root].pts.tl.cur.x - spacing.x;
        if( ep.y < this[root].pts.tl.cur.y - spacing.y )
            ep.y = this[root].pts.tl.cur.y - spacing.y;
        this.cur = ep;
    }

    ///////////////////////////////////////

    P.pts.tl.cur = new InputNode({});

    P.pts.tl.limit.xmin = function () { return bounds.xmin }
    P.pts.tl.limit.xmax = function () { return this[root].pts.br.cur.x - spacing.x }
    P.pts.tl.limit.ymin = function () { return bounds.ymin }
    P.pts.tl.limit.ymax = function () { return this[root].pts.br.cur.y - spacing.y }
    
    P.pts.tl._req = new InputNode({});
    P.pts.tl._req[enumerable] = false;
    P.pts.tl.req[nget] = function () { return this._req };
    P.pts.tl.req[nset] = function (rp) {
        this._req = p(rp.x, rp.y);
        if( rp.x > this[root].pts.br.cur.x-spacing.x && rp.y > this[root].pts.br.cur.y-spacing.y )
            this.cur = p(this[root].pts.br.cur.x - spacing.x, this[root].pts.br.cur.y - spacing.y);
        else if( rp.x >  this[root].pts.br.cur.x - spacing.x )
            this.cur = p(this[root].pts.br.cur.x - spacing.x, rp.y);
        else if( rp.y >  this[root].pts.br.cur.y - spacing.y )
            this.cur = p(rp.x, this[root].pts.br.cur.y - spacing.y);
        else
            this.cur = p(rp.x, rp.y);
    }
    
    return r;
}

//const p = (x,y) => ({x, y});
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

console.log( p(15,15) );
console.log( ''+p(15,15) );

r.init({
    pts: {
        tl: { cur: p(15,15)   },
        br: { cur: p(100,200) },
    }
});

listen( r.nav('pts.br.cur'), v => console.log(`new br: ${v.x}, ${v.y}`) );
listen( r.nav('pts.tl.cur'), v => console.log(`new tl: ${v.x}, ${v.y}`) );

var o = r[O];
console.log(o);
// works
//listen( P.f2, v => console.log(`update f2: ${v}`) );
//listen( root.nav('f2'), v => console.log(`update f2: ${v}`) );

//listen( root.nav('f1'), v => console.log(`update f1: ${v}`) );

console.log('-');
o.pts.tl.req = p(80,15);
console.log( o );

console.log('-');
o.pts.tl.req = p(30,180);
console.log( o );

console.log('-');
o.pts.tl.req = p(40,15);
console.log( o );

console.log('-');
o.pts.tl.req = p(90,190);
console.log( o );
