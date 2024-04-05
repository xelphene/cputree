
'use strict';

exports.consts = require('./consts');
exports.bmap = exports.consts.bmap;
exports.bfunc = exports.consts.bfunc;
exports.bexist = exports.consts.bexist;
exports.bexpand = exports.consts.bexpand;

exports.node = require('./node');
exports.ObjNode = exports.node.ObjNode;
exports.BranchNode = exports.node.BranchNode;
exports.LeafNode = exports.node.LeafNode;

exports.CTL = require('./consts').CTL;
exports.enumerable = require('./consts').enumerable;
exports.N = require('./consts').N;
exports.O = require('./consts').O;

exports.sub = require('./consts').sub;
exports.parent = require('./consts').parent;
exports.root = require('./consts').root;
exports.getn = require('./consts').getn;
exports.getp = require('./consts').getp;
exports.isComputeProxy = require('./consts').isComputeProxy;
exports.computeProxyWrappedObject = require('./consts').computeProxyWrappedObject;

exports.nget = require('./consts').nget;
exports.nset = require('./consts').nset;

exports.excOriginNode = require('./consts').excOriginNode;
exports.excTopNode = require('./consts').excTopNode;

// mio
exports.mioSrcBranch = require('./consts').mioSrcBranch;
exports.mioMapIn = require('./consts').mioMapIn;
exports.mioMapOut = require('./consts').mioMapOut;

exports.toPath = require('./path').toPath;
exports.Path = require('./path').Path;

exports.inpn = require('./inpn');
exports.errors = require('./errors');

exports.input = require('./tbuild/tinput');
exports.tbuild = require('./tbuild/');
exports.unwrap = require('./tbuild/util').unwrap;
exports.validate = require('./validate');
exports.merge = require('./tbuild/util').merge;
exports.build = require('./tbuild/buildproxy').tbuild;
exports.predFunc = require('./tbuild').predFunc;
