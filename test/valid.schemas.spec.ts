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

function testSchema(tsFile, testName) {

    const schema = ts2jschema.convertFile(tsFile, testName)
    expect(schema).to.deep.equals(require(`./valid/${testName}/schema.json`))  
    
    const validate = ajv.compile(schema)

    const testData = require(`./valid/${testName}/type`)
    
    testData.valid.forEach((toCheck) => {
        validate(toCheck)
        expect(validate.errors).to.be.null
    })

    testData.invalid.forEach((toCheck) => {
        validate(toCheck)
        expect(validate.errors).to.exist  
    }) 

    if(validate.errors)  
        expect(validate.errors.length).to.be.gt(0)
}

function testSchemaValidPath(testName) {
    testSchema(`./test/valid/${testName}/type.ts`, testName)
}

describe("schema tests", () => {

    it("simple", (done) => {
        testSchemaValidPath("simple")
        done()
    })

    it("union", (done) => {
        testSchemaValidPath("union")
        done()
    })

    it("simple2", (done) => {
        testSchemaValidPath("simple2")
        done()
    })
})


