
'use strict';

const {ObjNode} = require('../node/objnode');
const {TInputNode, TGetNode, TRelayInputNode} = require('./');
const {LeafNode} = require('../node/leaf');
const validate = require('../validate');

test('relay_input', () =>
{
    var R = new ObjNode({});
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: -1}) );
    R.addc('cj', new TGetNode({
        bindings: [R],
        getFunc: t => t.j * 10
    }));
    R.addc('ci', new TGetNode({
        bindings: [R],
        getFunc: t => t.i * 2
    }));

    R.addc('r', new TRelayInputNode({
        validate: validate.number,
        srcNode:  R.getc('j')
    }));
    
    R.init({});
    //R.logDebug();
    //console.log( R.rawObject );
    
    expect( R.getc('r').getValue() ).toBe( -1 );

    R.getc('j').setValue('a');

    expect( () => R.computeIfNeeded() ).toThrow('Input validation failure setting ☉.r to a');
});

test('relay_compute', () =>
{
    var R = new ObjNode({});
    R.addc('j', new TInputNode({defaultValue: 2}) );
    R.addc('cj', new TGetNode({
        bindings: [R],
        getFunc: t => {
            if( t.j < 0 )
                return 'NOPE'
            else
                return t.j * 10
        }
    }));
    
    R.addc('r', new TRelayInputNode({
        validate: validate.number,
        srcNode:  R.getc('cj')
    }));
    
    R.init({});
    //R.logDebug();
    
    expect( R.getc('r').getValue() ).toBe( 20 );

    R.getc('j').setValue(-10);
    
    expect( () => R.computeIfNeeded() ).toThrow('Input validation failure setting ☉.r to NOPE');
    
});

test('relay_node', () =>
{
    var R = new ObjNode({});
    R.addc('i', new TInputNode({
        defaultValue: 2,
        validate: validate.number,
    }));
    R.addc('j', new TInputNode({
        defaultValue: 222
    }));
    
    //R.getc('i').relayInput( R.getc('j') );
    R.getc('i').replaceWithRelay( R.getc('j') );
    
    R.init({});
    
    expect( R.getc('i').getValue() ).toBe( 222 );
    
    R.getc('j').setValue('x');
    expect( R.getc('i').fresh ).toBe(false);
    expect( () => R.getc('i').getValue() ).toThrow( 'Input validation failure setting ☉.i to x:' );
    
    R.getc('j').setValue(3);
    expect( R.getc('i').getValue() ).toBe( 3 );
});
