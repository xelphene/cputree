
'use strict';

const {ObjNode, TNode, makeNode} = require('../');
const {InputKernel, GetKernel} = require('../kernel');
const validate = require('../validate');

var R = new ObjNode({});

//R.addc('i', makeNode('Input', {defaultValue: 1, validate: validate.number}) );

//R.addc('i', makeNode('Input', {validate: validate.number}) );
//R.addc('i', makeNode('Input', {defaultValue: 'x', validate: validate.number}) );

R.addc('i', makeNode('Input', {defaultValue: 1, validate: validate.number}) );

//R.init({i:2});
R.init({i:'x'});

console.log( R.nav('i').value );
//console.log( R.nav('j').value );
//console.log( R.nav('k').value );
