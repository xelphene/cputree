
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

function getBox({bounds, spacing})
{
    var T = ct.build();
    
    T.pts.br = value;
    T.pts.tl = value;
    
    // TODO: throw OKError(expn)
    
    ct.ensure( T, t => t.pts.br.x <= bounds.xmax );
    ct.ensure( T, t => t.pts.br.y <= bounds.ymax );

    ct.ensure( T, t => t.pts.tl.x >= bounds.xmin );
    ct.ensure( T, t => t.pts.tl.y >= bounds.ymin );
    
    ct.ensure( T, t => t.pts.tl.x <= t.pts.br.x - spacing.x );
    ct.ensure( T, t => t.pts.tl.y <= t.pts.br.y - spacing.y );
    
    ct.ensure( T,
        [
            t => t.pts.tl.x <= t.pts.br.x - spacing.x,
            t => t.pts.tl.y <= t.pts.br.y - spacing.y 
        ],
        new Error(`tl and br can be no closer than ${spacing} to each other`)
    );
    
    ct.ensure( T, t => {
        if( t.pts.tl.x > t.pts.br.x - spacing.x )
            throw new Error(`tl and br can be horizontally no closer than ${spacing.x} to each other`);
        if( t.pts.tl.y > t.pts.br.y - spacing.y )
            throw new Error(`tl and br can be vertically no closer than ${spacing.y} to each other`);
    });

    T.spacingCheck = ct.pre( ct.nonEnum( t => {
        if( t.pts.tl.x > t.pts.br.x - spacing.x )
            throw new Error(`tl and br can be horizontally no closer than ${spacing.x} to each other`);
        if( t.pts.tl.y > t.pts.br.y - spacing.y )
            throw new Error(`tl and br can be vertically no closer than ${spacing.y} to each other`);
    }));
    // shortcut for above:
    T.spacingCheck = ct.ensure( t => {
        if( t.pts.tl.x > t.pts.br.x - spacing.x )
            throw new Error(`tl and br can be horizontally no closer than ${spacing.x} to each other`);
        if( t.pts.tl.y > t.pts.br.y - spacing.y )
            throw new Error(`tl and br can be vertically no closer than ${spacing.y} to each other`);
    });

    // these are redundant, right?    
    //ct.ensure( T, t => t.pts.br.x >= t.pts.tl.x + spacing );
    //ct.ensure( T, t => t.pts.br.y >= t.pts.tl.y + spacing );
    
    T.hateOddY = function () {
        if( this.pts.tl.value.y %2 != 0 )
            throw new Error('I hate odd values of tl.y');
        return 'alright';
    }
    
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
