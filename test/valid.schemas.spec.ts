import * as Promise from "bluebird";
import * as _ from "lodash";

import * as chai from 'chai';
import * as assert from "assert";

const expect = chai.expect;

import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

chai.should();
chai.use(sinonChai);

import * as Ajv from 'ajv'

import {Ts2JSchema, Ts2JSchemaConfig} from "../src/ts2jschema" 

import * as valid_simple from './valid/simple/type'

let ts2jschema = new Ts2JSchema({})

let ajv = new Ajv()


describe("schema tests", () => {

    it("should generate simple schema", (done) => {
        let schema = ts2jschema.convertFile(  "./test/valid/simple/type.ts", "simple")
        expect(schema).to.deep.equals(require("./valid/simple/schema.json"))  
        
        let validate = ajv.compile(schema)
        validate(valid_simple.valid)
        
        expect(validate.errors).to.be.null

        validate(valid_simple.invalid)
        
        expect(validate.errors).to.exist  

        if(validate.errors)  
            expect(validate.errors.length).to.be.gt(0)

        done()
    })
})


