
'use strict';

const {
    ObjNode, C, N, O, listen, inpn, InputNode, GetSetNode,
    nget, nset, root, enumerable
} = require('../index');

function getBoundedPoint() {
    var r = new ObjNode({});
    var P = r[C];
    
    P._eff = new InputNode({});
    P._eff[enumerable] = false;
    P.eff = function () { return this._eff }

    P.limit.xmin = () => -Infinity;
    P.limit.xmax = () => Infinity;
    P.limit.ymin = () => -Infinity;
    P.limit.ymax = () => Infinity;
    
    P._req = new InputNode({});
    P._req[enumerable] = false;
    P.req[nget] = function () { return this._req };
    P.set = function () {
        return rp => {
            this._req = rp;
            var ap = p(rp.x, rp.y);
        
            if( ap.x > this.limit.xmax )
                ap.x = this.limit.xmax;
            else if( ap.x < this.limit.xmin )
                ap.x = this.limit.xmin;
            
            if( ap.y > this.limit.ymax )
                ap.y = this.limit.ymax;
            else if( ap.y < this.limit.ymin )
                ap.y = this.limit.ymin;
        
            this._eff = ap;
        }
    }
    
    return r;
}

function getBox({bounds, spacing})
{
    var r = new ObjNode({});
    var P = r[C];

    ///////////////////////////////////////

    // TODO: cputree: use ensure like this:
    // ensure 0: points are points. if not, throw.
    // ensure 1: points are within bounds. if not: set point = bound corner
    // ensure 2: tl is above & left of br. if not: set br = tl + spacing
    // ensure 3: tl is bounds distance away from br. if not: set br = tl + spacing
    // current limit assumes init vals are in bounds, spaced
    // from each other and leaves spacing for other point
    // TODO: cputree:
    // move limit check logic from setters into ensure
    // remove setters & getters.
    // no need to store requested value.
    // TODO: cputree:
    // there will only be a .val InputNode
    // no getters/setters
    // limits implemented by ensures
    // TODO: cputree:
    // ensures should:
    //  throw on init
    //  adjust on set

    P.pts.br._eff = new InputNode({});
    P.pts.br._eff[enumerable] = false;
    P.pts.br.eff = function () { return this._eff }

    //P.pts.br._req[enumerable] = false;
    
    P.pts.br.limit.xmin = function () { return this[root].pts.tl.eff.x + spacing.x; }
    P.pts.br.limit.xmax = function () { return bounds.xmax }
    P.pts.br.limit.ymin = function () { return this[root].pts.tl.eff.y + spacing.y; }
    P.pts.br.limit.ymax = function () { return bounds.ymax }
    
    P.pts.br._req = new InputNode({});
    P.pts.br._req[enumerable] = false;
    P.pts.br.req[nget] = function () { return this._req };
    P.pts.br.req[nset] = function (rp) {
        this._req = rp;
        var ap = p(rp.x, rp.y);
        
        if( ap.x > this.limit.xmax )
            ap.x = this.limit.xmax;
        else if( ap.x < this.limit.xmin )
            ap.x = this.limit.xmin;
        
        if( ap.y > this.limit.ymax )
            ap.y = this.limit.ymax;
        else if( ap.y < this.limit.ymin )
            ap.y = this.limit.ymin;
        
        this._req = ap;
    }

    ///////////////////////////////////////

    P.pts.tl._eff = new InputNode({});
    P.pts.tl._eff[enumerable] = false;
    P.pts.tl.eff = function () { return this._eff }

    P.pts.tl.limit.xmin = function () { return bounds.xmin }
    P.pts.tl.limit.xmax = function () { return this[root].pts.br.eff.x - spacing.x }
    P.pts.tl.limit.ymin = function () { return bounds.ymin }
    P.pts.tl.limit.ymax = function () { return this[root].pts.br.eff.y - spacing.y }
    
    P.pts.tl._req = new InputNode({});
    P.pts.tl._req[enumerable] = false;
    P.pts.tl.req[nget] = function () { return this._req };
    P.pts.tl.req[nset] = function (rp) {
        this._req = rp;
        var ap = p(rp.x, rp.y);
        
        if( ap.x > this.limit.xmax )
            ap.x = this.limit.xmax;
        else if( ap.x < this.limit.xmin )
            ap.x = this.limit.xmin
        
        if( ap.y > this.limit.ymax )
            ap.y = this.limit.ymax;
        else if( ap.y < this.limit.ymin )
            ap.y = this.limit.ymin;
        
        this._eff = ap;
    }
    
    P.pts.tl.warnings = function () {
        if( this._req === undefined ) return [];
        if( this.req.x > this.limit.xmax || this.req.y > this.limit.ymax )
            return ['prox'];
        return [];
    }
    
    /*
    P.pts.warning = function () {
        if( this.tl._req === undefined || this.br._req === undefined )
            return null;
        if( this.tl._req.x > this.tl.limit.xmax || this.tl._req.y > this.tl.limit.ymax )
            return 'points too close together';
        if( this.br._req.x < this.br.limit.xmin || this.br._req.y < this.br.limit.ymin )
            return 'points too close together';
        return null;
    }
    */
    
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
        tl: { _eff: p(15,15)   },
        br: { _eff: p(100,200) },
    }
});

listen( r.nav('pts.br.eff'), v => console.log(`new br: ${v.x}, ${v.y}`) );
listen( r.nav('pts.tl.eff'), v => console.log(`new tl: ${v.x}, ${v.y}`) );

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

console.log('- tl = 90,9000');
o.pts.tl.req = p(9,-9000);
console.log( o );
