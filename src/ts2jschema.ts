import Ast, { ExportDeclaration, InterfaceDeclaration, NamespaceDeclaration, Node, SourceFile, Statement, TypeAliasDeclaration, VariableDeclarationKind, Scope, FileNotFoundError, PropertySignature } from "ts-simple-ast";
import { JSONSchema4, JSONSchema7, JSONSchema6, JSONSchema4Type, JSONSchema6Type, JSONSchema7Type, JSONSchema7Version, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import * as _ from 'lodash'

export interface Ts2JSchemaConfig {
    version?: JSONSchema7Version
    tsConfigFilePath?: string
}

export class Ts2JSchema {

    astIn: Ast

    constructor({
        tsConfigFilePath = "./tsconfig.json",
        version = 'http://json-schema.org/draft-07/schema#' }: Ts2JSchemaConfig) {

        this.astIn = new Ast({
            tsConfigFilePath: tsConfigFilePath
        });
    }

    convertFile(filePath: string, type: string): JSONSchema7 {
        this.astIn.addExistingSourceFile(filePath)
        const sfIn = this.astIn.getSourceFile(filePath)
        if(!sfIn) throw Error(`[${filePath}] file not found`)
        
        let toSchemify = sfIn.getInterface(type);
        if(!toSchemify) throw Error(`[${type}] not found within the file`)

        let jsonSchema = this.renderJsonSchema(type, toSchemify)
        return jsonSchema
    }

    renderJsonSchema(type: string, astInterface : InterfaceDeclaration): JSONSchema7 {
        let toRet = {
            "$schema": <"http://json-schema.org/draft-07/schema#">"http://json-schema.org/draft-07/schema#",
            "allOf": [
                {
                    "$ref": `#/definitions/${type}`
                }
            ],
            "definitions": {}
        }
        toRet.definitions[type] =
        {
            "additionalProperties": false,
            "properties": {
            },
            "required": [
            ],
            "type": "object"
        }
        
        toRet.definitions[type].properties = astInterface.getProperties()
        .reduce((p, c : PropertySignature ,i,a) => {
            p[c.getName()] = this.renderProperty(c)
            return p
        }, {})

        toRet.definitions[type].required = _.keys(toRet.definitions[type].properties)
        
        return toRet;
    }

    renderProperty(astPropertySignature : PropertySignature) : any {
        return {
            "type" : astPropertySignature.getType().getText()
        }
    }

}