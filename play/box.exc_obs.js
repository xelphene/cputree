
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
    
    P.hateOddY = function () {
        if( this.$.pts.tl.value.y %2 != 0 )
            throw new Error('I hate odd values of tl.y');
        return 'alright';
    }
    
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
        tl: { _value: p(16,16)   },
        br: { _value: p(100,200) },
    }
});

function observe(root, paths) {
    var updates = {};
    for( let p of paths ) {
        let n = r.nav(p);
        listen( n, v => {
            console.log(`  obs heard: ${n.fullName} = ${v}`);
            updates[n.fullName] = v;
        });
    }
    return function update (path, newValue) {
        updates = {};
        let origValue = root.nav(path).value;
        let setDone = false;
        try {
            console.log(`  obs update set ${path} = ${newValue}`);
            root.nav(path).setValue(newValue);
            setDone = true;
            root.computeIfNeeded();
            return {
                ok: true,
                updates
            }
        } catch(e) {
            console.error(`  obs update error: ${e.message}`);
            if( setDone ) {
                console.log(`  obs update revert ${path} to ${origValue}`);
                root.nav(path).setValue(origValue);
                root.computeIfNeeded();
            } return {
                ok: false,
                exc: e
            }
        }
    }
}

function observe2(root, paths) {
    return function update (path, newValue) 
    {
        let node = root.nav(path);
        let origValue = node.value;
        
        console.log(`  obs update set ${path} = ${newValue}`);

        try {
            node.setValue(newValue);
        } catch (e) {
            console.error(`  obs update on set error: ${e.message}`);
            return {
                ok: false,
                exc: e
            }
        }

        try {
            // TODO: first recompute the observed nodes, then the rest.
            let updatedNodes = root.computeIfNeeded();
            return {
                ok: true,
                updates: updatedNodes
            }
        } catch(e) {
            console.error(`  obs update recompute error: ${e.message}`);
            console.log(`  obs update revert ${path} to ${origValue}`);
            node.setValue(origValue);
            root.computeIfNeeded();
            return {
                ok: false,
                exc: e
            }
        }
    }
}

var o = r[O];
console.log(o);

var settings = [
    [80,15],
    [30,180],
    [20,20],
    [40,15],
    [90,180],
    [90, -9000],
    [9, -9],
    [-8, -8],
    [-8, -8],
];

var update = observe(r, [
    'pts.tl.value',
    'pts.br.value',
    'hateOddY'
]);

for( let [x,y] of settings ) {
    let pt = p(x,y);
    console.log('='.repeat(80));
    console.log('');
    console.log(`SET tl = ${pt}`);
    let result = update('pts.tl.value', pt);
    if( result.ok ) {
        console.log('UPDATE good. changes:');
        for( let p of Object.keys(result.updates) ) {
            console.log(`  ${p} = ${result.updates[p]}`);
        }
    } else
        console.log(`UPDATE fail: ${result.exc.message}`);
    console.log( o );
}
