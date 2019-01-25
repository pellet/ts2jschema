import Ast, { ExportDeclaration, InterfaceDeclaration, NamespaceDeclaration, Node, SourceFile, Statement, TypeAliasDeclaration, VariableDeclarationKind, Scope } from "ts-simple-ast";
import { JSONSchema4, JSONSchema7, JSONSchema6, JSONSchema4Type, JSONSchema6Type, JSONSchema7Type, JSONSchema7Version, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';


interface Ts2JSchemaConfig {
    version: JSONSchema7Version
    tsConfigFilePath: string
}

class Ts2JSchema {

    astIn: Ast

    constructor({
        tsConfigFilePath = "../tsconfig.json",
        version = 'http://json-schema.org/draft-07/schema#' }: Ts2JSchemaConfig) {

        this.astIn = new Ast({
            tsConfigFilePath: tsConfigFilePath
        });
    }

    convertFile(filePath: string, type: string): JSONSchema7 {
        this.astIn.addExistingSourceFile(filePath)
        const sfIn = this.astIn.getSourceFile(filePath)
        
        
        let jsonSchema = this.renderJsonSchema(type)
        return jsonSchema
    }

    renderJsonSchema(type: string): JSONSchema7 {
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
        return toRet;
    }

}