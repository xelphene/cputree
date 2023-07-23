
'use strict';

class Tester
{
    constructor() {
        this._failures = [];
        this._passes = [];
    }
    
    logResults() {
        var failCount=0;
        for( let f of this._failures ) {
            failCount++;
            console.error(`FAILURE ${failCount}/${this._failures.length}:`);
            console.error(`  code: ${f.code}`);
            console.error(`  result: ${f.actualResult}`);
            console.error(`  expected: ${f.expectedResult}`);
        }
        if( failCount>0 ) {
            console.error(`TEST_RESULT: FAIL. ${failCount} failures. ${this._passes.length} passes.`);
        } else {
            console.info(`TEST_RESULT: pass. 0 failures. ${this._passes.length} passes.`);
        }
    }
    
    fail(code, actualResult, expectedResult)
    {
        this._failures.push({
            code, actualResult, expectedResult
        });
    }
    
    pass(code, result)
    {
        this._passes.push({code, result});
    }
    
    f( innerCode, expectedResult, namespace ) {
        var code = '"use strict"; ';
        for( let [varName, varValue] of Object.entries(namespace) ) {
            code += `var ${varName}=${JSON.stringify(varValue)};`;
        }
        code += `return ${innerCode}`;
        //console.log(`code: ${code}`);
        var func = new Function(code);
        var rv = func();
        //console.log(`rv: type=${typeof(rv)} value=${rv}`);
        
        if( rv != expectedResult ) {
            this.fail(code, rv, expectedResult);
        } else {
            this.pass(code, rv);
        }
    }
    
    callTrue(f) {
        var r = f();
        if( ! r ) {
            this.fail(f.toString(), r, true);
        } else {
            this.pass(f.toString(), r);
        }
    }

    callEq(f, expectedResult) {
        var r = f();
        if( r != expectedResult ) {
            this.fail(f.toString(), r, expectedResult);
        } else {
            this.pass(f.toString(), r);
        }
    }
    
    callExc(f, expectedExcClass) {
        try {
            f();
        } catch(e) {
            if( e instanceof expectedExcClass )
                this.pass(f.toString(), e)
            else
                throw e
        }
    }
}
exports.Tester=Tester;
