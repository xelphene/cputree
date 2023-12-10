
'use strict';

exports.DEBUG = false;

exports.CTL = Symbol('CTL');
exports.enumerable = Symbol('enumerable');
exports.MAJORS = Symbol('MAJORS');
exports.C = Symbol('C');
exports.N = Symbol('N');
exports.O = Symbol('O');

exports.NAME_SEP = '.';
exports.ROOT_STR = '☉';
exports.PARENT_STR = '^';

exports.parent = Symbol('parent');
exports.root = Symbol('root');
exports.getn = Symbol('getn');
exports.getp = Symbol('getp');

// getter/setter nodes
exports.nget = Symbol('nget');
exports.nset = Symbol('nset');

exports.isComputeProxy = Symbol('isComputeProxy');
exports.computeProxyWrappedObject = Symbol('computeProxyWrappedObject');
exports.endProxy = Symbol('endProxy');

exports.isDTProxy = Symbol('isDTProxy');
exports.dtProxyWrappedObject = Symbol('dtProxyWrappedObject');

// if a ComputeNode's compute func throws an error, the raised Error
// object will be given an excOriginNode prop whose value is the Node where
// the exception was raised.
exports.excOriginNode = Symbol('excOriginNode');
exports.excTopNode = Symbol('excTopNode');

//exports.PRE_FINAL_LEAF_VALUE = undefined;
exports.PRE_FINAL_LEAF_VALUE = Symbol('PRE_FINAL_LEAF_VALUE');
exports.bfunc = Symbol('bfunc');   // mark a function as a returning a branch
exports.bmap = Symbol('bmap');     // within a bfunc, do a branch map
exports.bexist = Symbol('bexist'); // conproxy: ensure branch exists. add if needed
exports.bexpand = Symbol('bexpand');
exports.pbexist = Symbol('pbexist');
exports.potnPathFromRoot = Symbol('potnPathFromRoot');

// probably defunct
exports.portalEndpoints = Symbol('portalEndpoints');
exports.postVal = Symbol('postVal');
exports.sub = Symbol('sub');

// mio
exports.mioSrcBranch = Symbol('mioSrcBranch');
exports.mioMapIn = Symbol('mioMapIn');
exports.mioMapOut = Symbol('mioMapOut');
exports.mioInput = Symbol('mioInput');

