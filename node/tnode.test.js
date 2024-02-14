
'use strict';

//const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');
const {ObjNode} = require('./objnode');
const {TGetNode} = require('./tget');
const {TInputNode} = require('./tinput');
const validate = require('../validate');

beforeEach(() => { global.console = require('console'); });

test('basic_get', () =>
{
    var root = new ObjNode({});
    root.addc( 'a', new TGetNode({
        bindings: [root],
        getFunc:  t => 222
    }));
    root.addc( 'b', new TGetNode({
        bindings: [root],
        getFunc:  t => t.a + 1
    }));
    root.init({});
    
    expect( root.nav('a').getValue() ).toBe( 222 );
    expect( root.nav('b').getValue() ).toBe( 223 );
    
    //root.logDebug();
});

test('get_input', () =>
{
    var root = new ObjNode({});
    root.addc( 'a', new TGetNode({
        bindings: [root],
        getFunc:  t => 222
    }));
    root.addc( 'b', new TGetNode({
        bindings: [root],
        getFunc:  t => t.a + 1
    }));
    root.addc( 'i', new TInputNode({
        defaultValue: 10,
        validate: validate.number
    }));
    root.addc( 'j', new TInputNode({
        validate: validate.number
    }));
    root.addc( 'c', new TGetNode({
        bindings: [root],
        getFunc:  t => t.i * 10
    }));
    root.init({j:11});
    
    expect( root.nav('a').getValue() ).toBe( 222 );
    expect( root.nav('b').getValue() ).toBe( 223 );
    expect( root.nav('c').getValue() ).toBe( 100 );
    expect( root.nav('a').fresh ).toBe( true );
    expect( root.nav('b').fresh ).toBe( true );
    expect( root.nav('c').fresh ).toBe( true );
    expect( root.nav('a').changeListeners.size ).toBe( 0 );
    expect( root.nav('i').changeListeners.size ).toBe( 0 );
    expect( root.nav('j').changeListeners.size ).toBe( 0 );
    
    root.nav('i').setValue(20);

    expect( root.nav('c').fresh ).toBe( false );

    expect( root.nav('c').getValue() ).toBe( 200 );
    expect( root.nav('c').fresh ).toBe( true );
    
    //root.logDebug();
    
    expect( root.nav('a').changeListeners.size ).toBe( 0 );
    expect( root.nav('i').changeListeners.size ).toBe( 0 );
    expect( root.nav('j').changeListeners.size ).toBe( 0 );
    expect( root.nav('a').changeListeners.size ).toBe( 0 );
});
