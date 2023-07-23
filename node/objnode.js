
'use strict';

const util = require('util');

const {
    CTL, NAME_SEP, ROOT_STR, DEBUG, C, N, O,
    root, parent, isComputeProxy,  computeProxyWrappedObject, endProxy,
    enumerable, bexpand,
    isDTProxy, dtProxyWrappedObject
} = require('../consts');

const ComputeNode = require('./compute').ComputeNode;
const BaseComputeNode = require('./compute').BaseComputeNode;
const PostValidateComputeNode = require('./compute').PostValidateComputeNode;
const InputNode = require('./input').InputNode;
const MapNode = require('./map').MapNode;
const Node = require('./node').Node
const getDTProxyHandler = require('./sproxy').getDTProxyHandler;
const {allOwnKeys, allOwnValues} = require('../util');
const {toPath, Path} = require('../path');
const NavError = require('../errors').NavError;
const GetSetNode = require('./getset').GetSetNode;

class ObjNode extends Node {
    constructor({parent}) {
        super({parent});
        
        this._childKeysInAddedOrder = [];
        this._inputs = {};
        this._computes = {};
        this._subs = {};

        this._o = this._getInitObj();

        // tree state
        this._definitionFinalized = false;
        this._realChildrenComplete = false;
        this._underlyingObjectFinalized = false;
        this._treeFinalized = false;

        // only ever true on the root node
        this._treeFinalized = false;
        
        this._majorPaths = [];
        
        this._conProxy = null;

        this._enumerable = undefined;
        
        this._sliderKeys = new Set();
        
        this._mergeOpts = null;
        //this._mergeOpts = {
        //    leafConflict:'throw'
        //};
    }

    //////////////////////////////////////////////////////
    // core characteristics
    //////////////////////////////////////////////////////

    get nodeType () { return 'obj' }    
    get nodeAbbr () { return 'obj' }

    get isLeaf ()   { return false }
    get isBranch () { return true }

    [Symbol.for('nodejs.util.inspect.custom')] () {
        // when doing something like console.log(this) within a compute
        // func, the DT Proxy's get trap for
        // Symbol.for('nodejs.util.inspect.custom') never gets called.
        // Not sure why. Instead, this method gets called and 'this' is
        // the DT Proxy-wrapped ObjNode.
        if( this[isDTProxy]===true )
            var this2 = this[dtProxyWrappedObject];
        else
            var this2 = this;
        
        return util.inspect( this2.debugValue );
    }
    
    get InputNodeClass   () { return InputNode }
    get ComputeNodeClass () { return ComputeNode }
    get BranchNodeClass  () { return ObjNode }
    get MapNodeClass     () { return MapNode }
    get PostValidateComputeClass () { return PostValidateComputeNode }
    get GetSetNodeClass  () { return GetSetNode }

    get debugValue () {
        return Object.fromEntries(
            this.getAllPropKeys().map( k => [k, this.getc(k).debugValue] )
        )
    }

    //////////////////////////////////////////////////////
    // manage tree state
    //////////////////////////////////////////////////////

    init (initialInput) {
        if( ! this.isRoot )
            throw new Error('init() should only be called from the root node');

        this.finalize();
        if( initialInput !== undefined )
            this.applyInput(initialInput);
        this.computeIfNeeded();
    }

    finalize () { this.finalizeEntireTree(); }
    
    finalizeEntireTree () {
        if( ! this.isRoot )
            throw new Error('finalizeEntireTree() should only be called from the root node');
        
        // all parent links are set
        // all ObjNode, InputNode and ComputeNode are added
        // MapNode children can now be set up.
        if( ! this.root.definitionFinalized )
            this.finalizeDefinition();
        
        // build the underlying _o / rawObject objects
        this.finalizeUnderlyingObject();
        
        // mark the tree ready for normal use.
        this._treeFinalized = true;
    }
    
    computeIfNeeded () {
        for( let n of this.iterChildren() ) {
            n.computeIfNeeded();
        }
    }

    get definitionFinalized () {
        if( this.isRoot )
            return this._definitionFinalized
        else
            return this.root.definitionFinalized;
    }

    finalizeDefinition() {
        if( this.definitionFinalized )
            throw new Error('finalizeDefinition() can only be called once');

        for( let c of this.iterObjChildren() )
            c.finalizeDefinition();
        
        for( let c of this.iterLeafChildren() )
            c.finalizeDefinition();
        
        if( this.isRoot )
            this._definitionFinalized = true;
    }

    get isTreeFinalized () {
        if( this.isRoot )
            return this._treeFinalized
        else
            return this.root.isTreeFinalized;
    }

    //////////////////////////////////////////////////////
    // manage the underlying Object that this Branch represents
    //////////////////////////////////////////////////////

    get rawObject () { return this._o }    
    get value () { return this.rawObject }

    _getInitObj () {
        var o = {};
        
        o[Symbol.for('nodejs.util.inspect.custom')] = function(depth, options, inspect) {
                const util = require('util');
                let copy = Object.assign({}, this);
                delete copy[Symbol.for('nodejs.util.inspect.custom')];
                let newOptions = Object.assign({}, options);
                newOptions.getters = true;
                return util.inspect(copy, newOptions);
        };
                
        Object.defineProperty(o, CTL, {
            value: this,
            writable: false,
            enumerable: false,
            configurable: false
        });
        Object.defineProperty(o, N, {
            value: this,
            writable: false,
            enumerable: false,
            configurable: false
        });
        return o;
    }

    finalizeUnderlyingObject() 
    {
        if( this._underlyingObjectFinalized ) {
            throw new Error('can only call finalizeUnerlyingObject() once');
        }
        
        for( let i of this.iterInputChildren() ) {
            if( i.settable ) {
                Object.defineProperty(this._o, i.key, {
                    get: () => i.value,
                    set: v  => i.value = v,
                    enumerable: i.enumerable,
                    configurable: false,
                });
            } else {
                Object.defineProperty(this._o, i.key, {
                    get: () => i.value,
                    enumerable: i.enumerable,
                    configurable: false,
                });
            }
        }
        
        for( let c of this.iterComputeChildren() )
        {
            if( c instanceof GetSetNode )
                Object.defineProperty(this._o, c.key, {
                    get: () => c.value,
                    set: v  => { c.setValue(v) },
                    enumerable: c.enumerable,
                    configurable: false,
                });
            else
                Object.defineProperty(this._o, c.key, {
                    get: () => c.value,
                    enumerable: c.enumerable,
                    configurable: false,
                });
        }

        for( let s of allOwnValues(this._subs) ) {
            Object.defineProperty(this._o, s.key, {
                get: () => s.rawObject,
                configurable: false,
                enumerable: s.enumerable
            });
            s.finalizeUnderlyingObject();
        }

        Object.freeze(this._o);

        this._underlyingObjectFinalized=true 
    }
    
    
    //////////////////////////////////////////////////////
    // check for the existence of a child Node
    //////////////////////////////////////////////////////

    hasc(key) { return this.hasNodeWithKey(key) }

    hasNodeWithKey (key) {
        return (
            this._inputs.hasOwnProperty(key) ||
            this._computes.hasOwnProperty(key) ||
            this._subs.hasOwnProperty(key)
        )
    }
    hasInputWithKey   (key) { return this._inputs.hasOwnProperty(key) }
    hasUnlinkedInputWithKey   (key) {
        if( this._inputs.hasOwnProperty(key) )
            return ! this._inputs[key].isLinked;
        else
            return false;
    }
    hasComputeWithKey (key) { return this._computes.hasOwnProperty(key) }
    hasObjWithKey     (key) { return this._subs.hasOwnProperty(key) }
    hasBranchWithKey  (key) { return this.hasObjWithKey(key) }
    hasLeafWithKey    (key) {
        return (
            this.hasInputWithKey(key) || 
            this.hasComputeWithKey(key)
        )
    }
    
    get hasChildren () { return this._childKeysInAddedOrder.length!=0 }

    hasChild(node) {
        for( let k of this._childKeysInAddedOrder ) {
            if( this.getProp(k)===node )
                return true;
        }
        return false;
    }

    //////////////////////////////////////////////////////
    // get a child Node or it's key in this Branch
    //////////////////////////////////////////////////////

    getc(key) { return this.getProp(key) }

    getChildKey(node) {
        for( let k of this._childKeysInAddedOrder ) {
            if( this.getProp(k)===node )
                return k;
        }
        throw new Error(`${this.fullName} has no such node`);
    }

    getProp(key) {
        if( typeof(key)!='string' && typeof(key)!='symbol' )
            throw new TypeError(`Invalid key ${key} of type ${typeof(key)} for getProp on ${this.fullName}`);
            
        if( this._inputs.hasOwnProperty(key) ) {
            return this._inputs[key];
        } else if( this._computes.hasOwnProperty(key) ) {
            return this._computes[key];
        } else if( this._subs.hasOwnProperty(key) ) {
            return this._subs[key];
        } else {
            throw new Error(`no such node ${key.toString()} on ${this.fullName}`);
        }
    }

    getAllPropKeys () {
        return this._childKeysInAddedOrder;
    }
    
    //////////////////////////////////////////////////////
    // delete a child Node
    //////////////////////////////////////////////////////

    del(key) { return this.detachChild(key); }
    delc(key) { return this.detachChild(key) }

    // call from anywhere
    detachChild(key) {
        let c = this.getc(key);
        c.parentDetaching();
        this._purgeChild(c);
        return c;
    }
    
    // call only from child Node
    childDetaching(child) {
        this._purgeChild(child);
    }
    
    _purgeChild(child) 
    {
        let childKey = this.getChildKey(child);

        if( this._subs.hasOwnProperty(childKey) )
            delete this._subs[childKey];
        else if( this._computes.hasOwnProperty(childKey) )
            delete this._computes[childKey];
        else if( this._inputs.hasOwnProperty(childKey) )
            delete this._inputs[childKey];
        else
            throw new Error('no such key');
        
        this._childKeysInAddedOrder = this._childKeysInAddedOrder.filter( k => k!=childKey );
    }
    

    //////////////////////////////////////////////////////
    // add a child Node
    //////////////////////////////////////////////////////

    addc(key, node) { return this.add(key, node) }

    addBranch(key) {
        if( typeof(key)!='symbol' && typeof(key)!='string' )
            throw new TypeError(`symbol or string required for branch key, not ${typeof(key)}`);
        return this.add(key, new this.BranchNodeClass({}));
    }
    
    addMap(key) {
        return this.add( key, new this.MapNodeClass({}) );
    }
    
    addCompute(key, computeFunc) {
        return this.add( key, new this.ComputeNodeClass({computeFunc}) );
    }
    
    add(key, node) 
    {
        const conProxyUnwrap = require('../tmpl/conproxy').conProxyUnwrap;
        node = conProxyUnwrap(node);
        
        if( this.definitionFinalized )
            throw new Error(`attempt to add node after definitionFinalized`);
        if( Array.isArray(key) )
            //return this.addDeep(key, node);
            return this.addNodeAtPath(toPath(key), node);
        if( this.hasNodeWithKey(key) )
            throw new Error(`duplicate key ${key.toString()}`);
        
        if( node.hasParent )
            throw new Error(`adding node to ${this.fullName}: new child ${node.fullName} already has a parent.`);
        
        if( typeof(node)=='function' && node.hasOwnProperty(bexpand) && node[bexpand]==true )
        {
            let child = new this.constructor({});
            //child.parent = this;
            child.parentAttaching(this);
            this._subs[key] = child;
            this._childKeysInAddedOrder.push(key);
            node(child);
            return child;
        }
        else if( node instanceof BaseComputeNode )
            this._computes[key] = node;
        else if( node instanceof InputNode )
            this._inputs[key] = node;
        else if( node instanceof ObjNode )
            this._subs[key] = node;
        else {
            //console.log(key);
            //console.log(node);
            throw new Error(`Attempt to add unknown node of unknown class`);
        }
        
        //node.parent = this;
        node.parentAttaching(this);
        this._childKeysInAddedOrder.push(key);
        return node;
    }

    computeToMap(key) {
        const {getMapOutBCF} = require('../mio');
        
        let branchComputeFunc = this._computes[key].computeFunc;

        this.delc(key);
        
        this.add(key, getMapOutBCF(branchComputeFunc));
    }

    //////////////////////////////////////////////////////
    // check for the existence of a descendant Node
    //////////////////////////////////////////////////////

    hasDescendant(n) {
        if( n===this )
            return true;
        else 
        {
            for( let c of this.iterChildren() )
                if( c.treeHasNode(n) )
                    return true;
            return false;
        }
    }    
    treeHasNode(n) { return this.hasDescendant(n) }
    hasd(n)        { return this.hasDescendant(n) }
    
    //////////////////////////////////////////////////////
    // add or get a Node anywhere in the tree
    //////////////////////////////////////////////////////

    addp(path,node) { return this.addNodeAtPath(path,node) }

    addNodeAtPath(path, node) {
        path = toPath(path);
        if( path.length==1 ) {
            return this.add(path.first, node);
        } else {
            if( this.hasNodeWithKey(path.first) )
            {
                if( ! (this.getProp(path.first) instanceof ObjNode) )
                    throw new Error(`A non-ObjNode exists at ${this.getProp(path.first).fullName}`);
                else
                    var o = this.getProp(path.first);
            }
            else if( path.first===parent )
                var o = this.parent;
            else if( path.first===root )
                var o = this.root;
            else
                var o = this.add(path.first, new this.constructor({}));
            
            return o.addNodeAtPath( path.rest, node );
        }
    }

    nav(path, originNode, pathFromOrigin) 
    {
        path = toPath(path);

        if( originNode===undefined ) {
            originNode = this;
            pathFromOrigin = path;
        }

        if( path.length==0 )
            return this;

        if( path.first===parent )
            if( this.isRoot )
                //throw new Error('attempt to get parent of root node');
                throw new NavError({
                    nodeAtError: this,
                    msg: 'attempt to get parent of root node',
                    originNode, pathFromOrigin
                });
            else
                return this.parent
                    .nav(path.rest, originNode, pathFromOrigin);
        else if( path.first===root )
            return this.root.nav(path.rest, originNode, pathFromOrigin);
        else
            if( this.hasNodeWithKey(path.first) )
                return this.getProp(path.first)
                    .nav( path.rest, originNode, pathFromOrigin );
            else if( this.sliderKeyExists(path.first) )
                return this.getSliderNode(path.first)
                    .nav( path.rest, originNode, pathFromOrigin );
            else
                //throw new Error(`${this.fullName} has no child with key ${path.first.toString()}`);
                throw new NavError({
                    nodeAtError: this,
                    msg: `no child with key ${path.first.toString()}`,
                    originNode, pathFromOrigin
                });
    }

    getNodeAtPath(path) {
        path = toPath(path);
        return this.nav(path);
    }



    //////////////////////////////////////////////////////
    // get other personalities of this Node
    //////////////////////////////////////////////////////

    getConProxy() {
        //const conproxy = require('../tmpl/conproxy');
        //return new Proxy(this, conproxy.conProxyHandler);
        if( this._conProxy==null ) {
            const conproxy = require('../tmpl/conproxy');
            this._conProxy = new Proxy(this, conproxy.conProxyHandler);
        }
        return this._conProxy;
    }
    
    get [C] () { return this.getConProxy(); }
    get C   () { return this.getConProxy(); }
    
    get [O] () { return this.rawObject; }
    get O   () { return this.rawObject; }
    
    getDTProxyOverMe({rcvr,purpose}) {
        return new Proxy(this, getDTProxyHandler({
            overNode: this,
            rcvr, purpose
        }));
    }    

    //////////////////////////////////////////////////////
    // work with sliders
    //////////////////////////////////////////////////////

    addSliderKey(key) {
        this._sliderKeys.add(key);
    }

    setSliderKeys(keys) {
        this._sliderKeys = new Set(keys);
    }
    
    getSliderKeys() { return this._sliderKeys };
    
    sliderKeyExists(key) {
        if( this._sliderKeys.has(key) )
            return true;
        else
            if( this.isRoot )
                return false;
            else
                return this.parent.sliderKeyExists(key);
    }
    
    getSliderNode(key) {
        if( this._sliderKeys.has(key) )
            return this;
        else
            if( this.isRoot )
                throw new Error(`unable to find node with slider key ${key.toString()}`);
            else
                return this.parent.getSliderNode(key);
    }

    //////////////////////////////////////////////////////
    // work with Nodes designated as "major" Nodes
    //////////////////////////////////////////////////////

    set majors (majors) {
        if( ! Array.isArray(majors) )
            throw new Error('majors must be an array');
        
        const conProxyUnwrap = require('../tmpl/conproxy').conProxyUnwrap;
        this._majorPaths = [];
        
        for( let m of majors ) {
            m = conProxyUnwrap(m);
            let p;
            if( m instanceof Node )
                p = this.pathToNode(m);
            else if( typeof(m)==='string' )
                p = toPath(m);
            else if( m instanceof Path )
                p = m;
            else
                throw new Error(`unknown value ${m} in majors assignment`);
            
            this._majorPaths.push(p);
        }
    }
    
    get majors () { return this._majorPaths }
    
    hasMajorNode(node) {
        var nodePath = this.pathToNode(node);
        for( let mp of this._majorPaths )
            if( nodePath.equals( mp ) ) {
                return true;
            }
        return false;
    }
    
    * iterTreeMajors () {
        for( let c of this.iterTree({includeNonEnumerable:true}) ) {
            if( this.hasMajorNode(c) )
                yield c;
        }
    }

    //////////////////////////////////////////////////////
    // merge this Branch with another
    //////////////////////////////////////////////////////

    get mergeOpts () {
        if( this._mergeOpts===null )
        {
            if( this.isRoot )
                return {leafConflict: 'throw'};
            else
                return this.parent.mergeOpts;
        }
        else
            return this._mergeOpts;
    }
    set mergeOpts (opts) { this._mergeOpts=opts }

    _mergeLeaf(key, bc, ic, opts)
    {
        if( bc instanceof InputNode && ic instanceof InputNode )
        {
            //console.log(`${ic.fullName}: ok. both inputs. keep bc`);
        }
        else if( bc instanceof InputNode && ! (ic instanceof InputNode) ) 
        {
            //console.log(`${ic.fullName}: ok. bc input, ic not. replace bc with ic`);
            // discard our version of the child
            this.detachChild(key);
            // adopt inc's version of the child
            ic.detachParent();
            this.addc(key, ic);
        }
        else if( ! (bc instanceof InputNode) && ic instanceof InputNode )
        {
            //console.log(`${ic.fullName}: ok. bc non-input, ic input. ignore ic.`);
        }
        else 
        {
            //console.log(`${ic.fullName}: FAIL. both are non-input leafs.`);
            if( opts.leafConflict != 'keepBase' )
                throw new Error(`tree merge failed at ${ic.fullName}: both nodes are non-input leaf nodes`);
        }
    }


    merge(incT, opts)
    {
        if( opts===undefined ) 
        {
            opts = this.mergeOpts;
            /*
            opts = {
                leafConflict: 'throw'
            };
            */
        }
        
        if( typeof(incT)=='function' && incT.hasOwnProperty(bexpand) ) {
            incT(this);
            return;
        }
        
        var iCs = [];
        for( let ic of incT.iterChildren() )
            iCs.push([ic, ic.key]);

        for( let [ic, icKey] of iCs )
        {
            if( ! this.hasc(icKey) ) 
            {
                //console.log(`${ic.fullName}: ok: no baseC. move ic into me`);
                ic.detachParent();
                this.addc(icKey, ic);
            }
            else
            {
                let bc = this.getc(icKey);
                if( bc.isBranch && ic.isBranch ) 
                {
                    //console.log(`${ic.fullName}: ok: both branches. recurse.`);
                    for( let sk of ic.getSliderKeys() )
                        bc.addSliderKey(sk);
                    bc.majors = bc.majors.concat(ic.majors);
                    bc.merge(ic, opts);
                }
                else if( bc.isBranch && ic.isLeaf ) 
                {
                    //console.log(`${ic.fullName}: FAIL: bc branch, ic leaf.`);
                    throw new Error(`tree merge failed at ${ic.fullName}: base node is a branch but incoming is a leaf.`);
                } 
                else if( bc.isLeaf && ic.isBranch ) 
                {
                    //console.log(`${ic.fullName}: FAIL: bc leaf, ic branch.`);
                    throw new Error(`tree merge failed at ${ic.fullName}: base node is a branch but incoming is a leaf.`);
                }
                else
                    this._mergeLeaf(icKey, bc, ic, opts);
            }
        }
    }

    //////////////////////////////////////////////////////
    // manage my InputNode children
    //////////////////////////////////////////////////////
    
    treeInputMap(srcBranch) {
        for( let i of this.iterTreeInputUnlinked() ) {
            let basePath = i.pathToNode(srcBranch);
            let endPath = this.pathToNode(i);
            let fullPath = basePath.concat(endPath);
            i.linkToPath(fullPath);
        }
    }
    
    applyInput(input) {
        var unused = Object.assign({},input);
        for( let k of allOwnKeys(input) ) {
            if( this.hasUnlinkedInputWithKey(k) ) {
                this._inputs[k].value = input[k];
                delete unused[k];
            }
            if( typeof(input[k])=='object' && this.hasObjWithKey(k) ) {
                let u = this.getProp(k).applyInput(input[k]);
                if( allOwnKeys(u).length > 0 )
                    unused[k] = u;
                else
                    delete unused[k];
            }
        }
        return unused;
    }

    //////////////////////////////////////////////////////
    // iterate over children of this Branch
    //////////////////////////////////////////////////////
    
    *iterChildren () {
        for( let n of allOwnValues(this._subs) )
            yield n;
        for( let n of allOwnValues(this._inputs) )
            yield n;
        for( let n of allOwnValues(this._computes) )
            yield n;
    }
    
    *iterBuildChildren () {
        for( let n of this.iterChildren() )
            yield n
    }
        
    
    *iterComputeChildren () {
        for( let n of allOwnValues(this._computes) ) {
            yield n;
        }
    }
    
    *iterInputChildren () {
        for( let n of allOwnValues(this._inputs) ) {
            yield n
        }
    }

    *iterUnlinkedInputChildren () {
        for( let n of allOwnValues(this._inputs) ) {
            if( ! n.isLinked )
                yield n;
        }
    }

    *iterLeafChildren () {
        for( let n of this.iterComputeChildren() )
            yield n;
        for( let n of this.iterInputChildren() )
            yield n;
    }

    *iterObjChildren () {
        for( let n of allOwnValues(this._subs) ) {
            if( n.nodeType=='obj' ) {
                yield n;
            }
        }
    }
    
    *iterBranchChildren () {
        for( let n of allOwnValues(this._subs) ) {
            yield n;
        }
    }
    
    //////////////////////////////////////////////////////
    // iterate over Nodes in the tree
    //////////////////////////////////////////////////////

    * iterTreeDF (opts) {
        yield this;
        for( let n of this.iterChildren() ) {
            if( n.isBranch ) {
                for( let c of n.iterTreeDF(opts) )
                    yield c;
            } else {
                yield n;
            }
        }
    }

    * iterTreeBranch(opts) {
        if( typeof(opts)=='object' ) {
            if( ! opts.hasOwnProperty('includeNonEnumerable') )
                opts.includeNonEnumerable = false;
        } else
            opts = {
                includeNonEnumerable: false,
            }

        for( let n of this.iterTree(opts) )
            if( n.isBranch )
                yield n;
        
    }

    * iterTreeLeaf(opts) {
        if( typeof(opts)=='object' ) {
            if( ! opts.hasOwnProperty('includeNonEnumerable') )
                opts.includeNonEnumerable = false;
        } else
            opts = {
                includeNonEnumerable: false,
            }

        for( let n of this.iterTree(opts) )
            if( n.isLeaf )
                yield n;
        
    }
    
    * iterTreeInput(opts) {
        if( typeof(opts)=='object' ) {
            if( ! opts.hasOwnProperty('includeNonEnumerable') )
                opts.includeNonEnumerable = false;
        } else
            opts = {
                includeNonEnumerable: false,
            }
        
        for( let n of this.iterTree(opts) )
            //if( n.nodeType=='input' )
            if( n instanceof InputNode )
                yield n;
    }

    * iterTreeInputUnlinked(opts) {
        if( typeof(opts)=='object' ) {
            if( ! opts.hasOwnProperty('includeNonEnumerable') )
                opts.includeNonEnumerable = false;
        } else
            opts = {
                includeNonEnumerable: false,
            }
        
        for( let n of this.iterTree(opts) ) {
            //if( n.nodeType=='input' )
            if( n instanceof InputNode && ! n.isLinked )
                yield n;
        }
    }

    * iterTree(opts) {
        if( typeof(opts)=='object' ) {
            if( ! opts.hasOwnProperty('includeNonEnumerable') )
                opts.includeNonEnumerable = false;
            if( ! opts.hasOwnProperty('yieldBranches') )
                opts.yieldBranches = true;
        } else
            opts = {
                includeNonEnumerable: false,
                yieldBranchNodes: true
            }

        for( let c of this.iterChildren() )
            if( c.enumerable || opts.includeNonEnumerable ) {
                if( c.isBranch && opts.yieldBranches )
                    yield c;
                if( c.isLeaf )
                    yield c;
                if( c.isBranch )
                    for( let c2 of c.iterTree(opts) )
                        yield c2;
            }
    }
    
    * iter (iterCtl) {
        if( iterCtl===undefined )
            iterCtl = {
                yieldNode: n => n.enumerable,
                descend: b => b.enumerable,
            }
        else
        {
            if( iterCtl.yieldNode === undefined )
                iterCtl.yieldNode = n => n.enumerable;
            if( iterCtl.descend === undefined )
                iterCtl.descend = b => b.enumerable;
        }
        
        for( let c of this.iterChildren() )
        {
            if( iterCtl.yieldNode(c) )
                yield c;
            if( c.isBranch )
                if( iterCtl.descend(c) )
                    for( let c2 of c.iter(iterCtl) )
                        yield c2;
        }
    }

}
exports.ObjNode = ObjNode;
