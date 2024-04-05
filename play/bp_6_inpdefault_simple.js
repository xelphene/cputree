
'use strict';

const {TInputNode} = require('../node');
const {nget, nset} = require('../consts');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');

var Q = tbuild();
Q.oq.i = tinput.any(4);
Q.qc = t => t.oq.i ** 2;

var T = tbuild();
T.p = () => 10;
T.unit = tinput.string();

T.saWidth.input = new TInputNode({
    validate: (node, value) => {
        if( typeof(value)=='number' ) {
            if( value > 0 )
                return [true, ''];
            else
                return [false, `number > 0 required, not ${value}`];
        } else if( typeof(value)=='undefined' ) {
            return [true, ''];
        } else {
            return [false, `number or undefined required, not ${typeof(value)}`];
        }
    }
});
T.saWidth.default = t => {
    if( t.unit=='in' )
        return 0.375;
    else if( t.unit=='cm' )
        return 1;
    else
        throw new ValueError(`Invalid unit ${t.unit}`)
};
T.saWidth.eff = function () {
    if( this.input===undefined )
        return this.default;
    else
        return this.input;
}
T.saWidth.inc = function (t) {
    return () => {
        if( t.unit=='in' )
            this.input = this.eff + 0.125;
        else if( t.unit=='cm' )
            this.input = this.eff + 0.1;
        else
            throw new ValueError(`Invalid unit ${t.unit}`)
    }
};

T.q = t => t.p + t.saWidth.eff;

T = unwrap(T);
T.init({unit: 'in'});
var t = T.rawObject;
console.log( t.saWidth.eff );

console.log('='.repeat(40));

t.saWidth.inc();
console.log( t.saWidth.eff );

console.log('='.repeat(40));

t.saWidth.input = 0.6;
console.log( t.saWidth.eff );

console.log('='.repeat(40));

t.saWidth.inc();
console.log( t.saWidth.eff );

console.log('='.repeat(40));

console.log( t.q );
