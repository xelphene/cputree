
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');

beforeEach(() => { global.console = require('console'); });

var R;

const incX = (t,v) => v + t.x;
const decX = (t,v) => v - t.x;
const incY = (t,v) => v + t.y;
const decY = (t,v) => v - t.y;

beforeEach( () => {
    R = tbuild();
    
    R.i  = tinsert.input(3);
    R.j  = tinsert.input(6);
    R.c  = t => 222;
    R.x  = tinsert.input(10);
    R.y  = tinsert.input(100);
    
    R.md = t => 2;
    R.f1 = t => t.c + 1;
    R.f2 = t => t.i*10000;
    
    R.o = bexist;
    R.o.i = tinsert.input(9);
    R.o.f = t => t.i + t.o.i;
    R.o.j = t => t.j;
    
    
    R.t  = tinsert.mapSplit( R.o, incX, decX )
    R.T  = tinsert.mapSplit( R.t, incX, decX )
    
    R.s  = tinsert.mapSplit( R.o, incX, decX )
    R.S  = tinsert.mapSplit( R.s, incY, decY )
    R.s2 = tinsert.mapSplit( R.o, incX, decX )
    R.S2 = tinsert.mapSplit( R.s, incY, decY )
    
    R = unwrap(R);
    R.init({});
});

function logSpecs( specs ) {
    for( let s of specs )
        console.log(`  ${s.mapNode.fullName} :: srcNode: ${s.srcNode.fullName}  mapGetFunc: ${s.mapGetFunc.name}`);
}

test('map equiv', () =>
{
    var hasSpec = R.nav('S.j').hasEquivMapping({
        mapGetFunc: incY,
        mapSetFunc: decY,
        bindings: [R] // works either with R or R.handle
    });
    expect( hasSpec ).toBe( true );

    var specs = R.nav('S.j').getMapSpecs({});
    //console.log(`map specs from S.j:`);
    //logSpecs(specs);
    expect( specs[0].mapNode ).toBe( R.nav('S.j') )
    expect( specs[0].srcNode ).toBe( R.nav('s.j') )
    expect( specs[0].mapGetFunc ).toBe( incY )
    expect( specs[1].mapNode ).toBe( R.nav('s.j') )
    expect( specs[1].srcNode ).toBe( R.nav('o.j') )
    expect( specs[1].mapGetFunc ).toBe( incX )
    
    // find all MapNodes from o.j equiv to mappings to S.j:
    specs = R.nav('S.j').getMapSpecs();
    specs.reverse();
    var mapNodes = [... R.nav('o.j').findMapNodesBySpecs(specs) ];
    expect( mapNodes.length ).toBe( 2 );
    expect( mapNodes[0] ).toBe( R.nav('S.j') )
    expect( mapNodes[1] ).toBe( R.nav('S2.j') )

    // find all MapNodes from o.j equiv to mappings to s.j:
    specs = R.nav('s.j').getMapSpecs();
    specs.reverse();
    mapNodes = [... R.nav('o.j').findMapNodesBySpecs(specs) ];
    expect( mapNodes.length ).toBe( 3 );
    expect( mapNodes[0] ).toBe( R.nav('t.j') )
    expect( mapNodes[1] ).toBe( R.nav('s.j') )
    expect( mapNodes[2] ).toBe( R.nav('s2.j') )
    
    // find all MapNodes from o.j equiv to mappings to s.j:
    mapNodes = [... R.nav('o.j').findMapNodesLike( R.nav('s.j') ) ];
    expect( mapNodes.length ).toBe( 2 );
    expect( mapNodes[0] ).toBe( R.nav('t.j') )
    expect( mapNodes[1] ).toBe( R.nav('s2.j') )

    // find all MapNodes from o.j equiv to mappings to S.j:
    mapNodes = [... R.nav('o.j').findMapNodesLike( R.nav('S.j') ) ];
    expect( mapNodes.length ).toBe( 1 );
    expect( mapNodes[0] ).toBe( R.nav('S2.j') );
});

