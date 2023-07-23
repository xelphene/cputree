
'use strict';

const {
    constructorize, input, subobj, CTL, PROXY, sub,
    parent, root
} = require('../../');

var Root = {
    x: input(),
    y: input(),
    sub: {
        sy: function () {
            return 300;
        },
        sx: function () {
            //return 200;
            //return this[root].x+1;
            return this[parent].x+1;
        },
        sub2: {
            r_x_1: function () { return this[root].x+1 },
            p_x_1: function () { return this[parent].sx+1 },
            [sub]: true
        },
        [sub]: true
    }
};
var RootC = constructorize(Root);

function test (t)
{
    var root = new RootC();
    root.x = 200;

    // invoke lazy computes
    root.x==true;
    root.sub.sx==true;
    root.sub.sub2.r_x_1==true;
    root.sub.sub2.p_x_1==true;
    
    t.callEq( () => root.sub.sx, 201 );
    t.callEq( () => root.sub.sub2.r_x_1, 201 );
    t.callEq( () => root.sub.sub2.p_x_1, 202 );
    
    t.callEq( () => root[CTL].getProp('x').speakingToStr, '☉.sub.sx(cpu), ☉.sub.sub2.r_x_1(cpu)' );
}
exports.test = test;

function main () {
    const Tester = require('../tester').Tester;
    var t = new Tester();

    test(t);

    console.log('');
    console.log('='.repeat(40));
    console.log('test results:');
    t.logResults();
}

if( require.main === module ) {
    main();
}

