
'use strict';

const {
    ObjNode, MapObjNode, ComputeNode, InputNode,
    parent, bmap, inpn, bfunc, enumerable, bexist,
} = require('../../');

var root;
const number = inpn.number;

beforeEach( () =>
{
    root = new ObjNode({});
    var p = root.getConProxy();
    
    //p.inp0 = inpn.number();
    p.isrc = bexist;
    p.isrc.inp0 = number();
    p.isrc.inp1 = number();
    p.isrc.s1 = bexist;
    p.isrc.s1.inp2 = number();
    
    p.b = bexist;
    p.b.isrc = bexist;
    p.b.isrc.inp0 = number();
    p.b.isrc.inp1 = number();
    p.b.isrc.s1 = bexist;
    p.b.isrc.s1.inp2 = number();
    
    ////////////
    
    p.tomap = bexist;
    p.tomap.inp0 = number();
    p.tomap.inp1 = number();
    p.tomap.s1 = bexist;
    p.tomap.s1.inp2 = number();
    
    p.s = bexist;
    p.s.tomap = bexist;
    p.s.tomap.inp0 = number();
    p.s.tomap.inp1 = number();
    p.s.tomap.s1 = bexist;
    p.s.tomap.s1.inp2 = number();
    
    p.s.b = bexist;
    p.s.b.tomap = bexist;
    p.s.b.tomap.inp0 = number();
    p.s.b.tomap.inp1 = number();
    p.s.b.tomap.s1 = bexist;
    p.s.b.tomap.s1.inp2 = number();

    ////////////////////////////////////////////
    
    
    root.getProp('tomap').treeInputMap( root.getProp('isrc') );
    root.getProp('s').getProp('tomap').treeInputMap( root.getProp('isrc') );
    root.getProp('s').getProp('b').getProp('tomap').treeInputMap( root.getProp('b').getProp('isrc') );
    
    //console.log('');
    //console.log('//////');
    //console.log('');
    
    root.finalizeEntireTree();
    
    root.getProp('isrc').getProp('inp0').value = 0;
    root.getProp('isrc').getProp('inp1').value = 1;
    root.getProp('isrc').getProp('s1').getProp('inp2').value = 2;
    root.getProp('b').getProp('isrc').getProp('inp0').value = 1000;
    root.getProp('b').getProp('isrc').getProp('inp1').value = 1001;
    root.getProp('b').getProp('isrc').getProp('s1').getProp('inp2').value = 1002;

    root.computeIfNeeded();

    //root.logStruct();
});

test('init', () =>
{    
    var oo = root.rawObject;

    expect( oo.tomap.s1.inp2 ).toBe( 2 );
    expect( oo.tomap.inp0 ).toBe( 0 );
    expect( oo.tomap.inp1 ).toBe( 1 );
    
    expect( oo.s.tomap.s1.inp2 ).toBe( 2 );
    expect( oo.s.tomap.inp0 ).toBe( 0 );
    expect( oo.s.tomap.inp1 ).toBe( 1 );
    
    expect( oo.s.b.tomap.s1.inp2 ).toBe( 1002 );
    expect( oo.s.b.tomap.inp0 ).toBe( 1000 );
    expect( oo.s.b.tomap.inp1 ).toBe( 1001 );
    
    expect( root.getProp('s').getProp('tomap').getProp('s1').getProp('inp2').computeCount ).toBe( 1 );
});

test('update', () => 
{
    var oo = root.rawObject;
    oo.isrc.s1.inp2 = 20;
    expect( oo.s.tomap.s1.inp2 ).toBe( 20 );
    expect( root.getProp('s').getProp('tomap').getProp('s1').getProp('inp2').computeCount ).toBe( 2 );
    expect( root.getProp('s').getProp('tomap').getProp('inp1').computeCount ).toBe( 1 );
});
