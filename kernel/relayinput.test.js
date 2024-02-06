
'use strict';

const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('./input');
const {GetKernel} = require('./get');
const {RelayInputKernel} = require('./relayinput');
const {LeafNode} = require('../node/leaf');
const validate = require('../validate');
/*
test('relay_input', () =>
{
    var R = new ObjNode({});
    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: -1}) ) );
    R.addc('cj', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => t.j * 10
    })));
    R.addc('ci', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => t.i * 2
    })));

    R.addc('r', new TNode( new RelayInputKernel({
        validate: validate.number,
        srcNode:  R.getc('j')
    })));
    
    R.init({});
    //R.logDebug();
    //console.log( R.rawObject );
    
    expect( R.getc('r').getValue() ).toBe( -1 );

    R.getc('j').setValue('a');

    expect( () => R.computeIfNeeded() ).toThrow('Input validation failure setting ☉.r to a');
});
*/

test('relay_compute', () =>
{
    var R = new ObjNode({});
    R.addc('j', new TNode( new InputKernel({defaultValue: 2}) ) );
    R.addc('cj', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => {
            if( t.j < 0 )
                return 'NOPE'
            else
                return t.j * 10
        }
    })));
    
    R.addc('r', new TNode( new RelayInputKernel({
        validate: validate.number,
        srcNode:  R.getc('cj')
    })));
    
    R.init({});
    //R.logDebug();
    
    expect( R.getc('r').getValue() ).toBe( 20 );

    R.getc('j').setValue(-10);
    
    expect( () => R.computeIfNeeded() ).toThrow('Input validation failure setting ☉.r to NOPE');
    
});
