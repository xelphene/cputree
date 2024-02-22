
'use strict';

const {mioSrcBranch} = require('../consts');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');
const {powMap} = require('../tbuild/map_pow');
const {TInputNode, TMapBoundNode} = require('../node');

beforeEach(() => { global.console = require('console'); });


function getSubTree () {
    var S = tbuild();
    S.i = tinput.number(2);
    S.c = t => t.i+1;
    return S;
}


test('merge_fill_graft_branch', () =>
{
    var R = tbuild();
    R.pow = tinput.number(1);
    R.dst = powMap( getSubTree(), R.pow );
    
    R = unwrap(R);
    //R.logDebug();
    
    expect( R.nav(['dst',mioSrcBranch,'i']) ).toBeInstanceOf( TMapBoundNode );
    expect( R.nav('dst.i') ).toBeInstanceOf( TInputNode );

    //R.init({});
    R.init({
        dst: { i:10 }
    });
    
    expect( R.nav(['dst',mioSrcBranch,'i']).getValue() ).toBe( 1 );
    expect( R.nav(['dst',mioSrcBranch,'c']).getValue() ).toBe( 2 );
    expect( R.nav('dst.i').getValue() ).toBe( 10 );
    expect( R.nav('dst.c').getValue() ).toBe( 20 );
    
    R.nav('dst.i').setValue( 30 );

    expect( R.nav(['dst',mioSrcBranch,'i']).getValue() ).toBe( 3 );
    expect( R.nav(['dst',mioSrcBranch,'c']).getValue() ).toBe( 4 );
    expect( R.nav('dst.i').getValue() ).toBe( 30 );
    expect( R.nav('dst.c').getValue() ).toBe( 40 );

    R.nav(['dst',mioSrcBranch,'i']).setValue( 5 );

    expect( R.nav(['dst',mioSrcBranch,'i']).getValue() ).toBe( 5 );
    expect( R.nav(['dst',mioSrcBranch,'c']).getValue() ).toBe( 6 );
    expect( R.nav('dst.i').getValue() ).toBe( 50 );
    expect( R.nav('dst.c').getValue() ).toBe( 60 );
    
    //R.logDebug();
    
    //expect( R.nav('s.i').getValue() ).toBe( 4 );
    //expect( R.nav('s.c').getValue() ).toBe( 5 );
});


test('merge_fill_sametree_branch', () =>
{
    console.log('-'.repeat(80));
    var R = tbuild();
    R.pow = tinput.number(1);
    R.src = getSubTree();
    R.dst = powMap( R.src, R.pow );
    
    R = unwrap(R);
    
    expect( R.nav('src.i') ).toBeInstanceOf( TInputNode );
    expect( R.nav('dst.i') ).toBeInstanceOf( TMapBoundNode );
    
    R.init({});
    
    expect( R.nav('src.i').getValue() ).toBe( 2 );
    expect( R.nav('src.c').getValue() ).toBe( 3 );
    expect( R.nav('dst.i').getValue() ).toBe( 20 );
    expect( R.nav('dst.c').getValue() ).toBe( 30 );
    
    R.nav('src.i').setValue( 5 );
    
    expect( R.nav('src.i').getValue() ).toBe( 5 );
    expect( R.nav('src.c').getValue() ).toBe( 6 );
    expect( R.nav('dst.i').getValue() ).toBe( 50 );
    expect( R.nav('dst.c').getValue() ).toBe( 60 );
    
    R.nav('dst.i').setValue( 70 );
    //R.computeIfNeeded();

    expect( R.nav('src.i').getValue() ).toBe( 7 );
    expect( R.nav('src.c').getValue() ).toBe( 8 );
    expect( R.nav('dst.i').getValue() ).toBe( 70 );
    expect( R.nav('dst.c').getValue() ).toBe( 80 );
    
    //R.logDebug();
});

test('merge_fill_sametree_leaf', () =>
{
    var R = tbuild();
    R.pow = tinput.number(1);
    R.src = getSubTree();
    R.dsti = powMap( R.src.i, R.pow );
    R.dstc = powMap( R.src.c, R.pow );
    
    R = unwrap(R);
    
    expect( R.nav('src.i') ).toBeInstanceOf( TInputNode );
    expect( R.nav('dsti') ).toBeInstanceOf( TMapBoundNode );
    expect( R.nav('dstc') ).toBeInstanceOf( TMapBoundNode );

    R.init({});
    
    expect( R.nav('dsti').getValue() ).toBe( 20 );
    expect( R.nav('dstc').getValue() ).toBe( 30 );
});
