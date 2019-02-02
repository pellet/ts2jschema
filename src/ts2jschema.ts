
import Ast, {TypeGuards, SyntaxKind, UnionTypeNode, ExportDeclaration, InterfaceDeclaration, NamespaceDeclaration, Node, SourceFile, Statement, TypeAliasDeclaration, VariableDeclarationKind, Scope, FileNotFoundError, PropertySignature, ts, TypeReferenceNode, Identifier, EntityName } from "ts-simple-ast";
import { JSONSchema4, JSONSchema7, JSONSchema6, JSONSchema4Type, JSONSchema6Type, JSONSchema7Type, JSONSchema7Version, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import * as _ from 'lodash'
import { Interface } from "readline";
import { isIdentifier, isInterfaceDeclaration } from "typescript";

export interface StringMap<T> {
    [key : string] : T
}

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
        
        let jsonSchema = this.renderJsonSchema(
            type, 
            this.findToSchemify(sfIn, type)
        )
        return jsonSchema
    }

    findToSchemify(sfIn: SourceFile, typeOrInterface : string) : InterfaceDeclaration | TypeAliasDeclaration{
        let toRet = sfIn.getInterface(typeOrInterface) || sfIn.getTypeAlias(typeOrInterface)
        if(!toRet) throw Error(`[${typeOrInterface}] not found within the file`)

        return toRet;
    }

    renderJsonSchema(type: string, astInterfaceOrType : InterfaceDeclaration | TypeAliasDeclaration): JSONSchema7 {
        let toRet = {
            "$schema": <"http://json-schema.org/draft-07/schema#">"http://json-schema.org/draft-07/schema#",
            "allOf": [
                this.renderRef(type)
            ],
            "definitions": {}
        }
        
        if(astInterfaceOrType instanceof InterfaceDeclaration) {
            toRet.definitions[type] = this.renderInterfaceDeclaration(astInterfaceOrType, toRet.definitions)
        } else {
            toRet.definitions[type] = this.renderTypeAliasDeclaration(astInterfaceOrType, toRet.definitions)
        }

        return toRet;
    }

    renderRef(name : string) {
        return {"$ref": `#/definitions/${name}`}
    }

    renderProperty(p : PropertySignature) : any {
        if(p.getType().isStringLiteral()) {
            return this.renderLiteral(p.getType().getText(), "string")
        } else {
            return {
                "type" : p.getType().getText()
            }
        }
    }

    renderLiteral(literal : string, type: string) {
        return {
            "type" : type,
            "enum" : [
                JSON.parse(literal)
            ]
        }
    }

    renderTypeAliasDeclaration(td : TypeAliasDeclaration, definitions : StringMap<any>) {
        return {
            anyOf : td.getChildrenOfKind(SyntaxKind.UnionType)[0].getTypeNodes().map(
                (trn : TypeReferenceNode) => this.extractInterfaceDeclarationFromTypeReferenceNode(trn.getTypeName(), definitions))
        }
    }

    extractInterfaceDeclarationFromTypeReferenceNode(id : EntityName, definitions : StringMap<any>) {
        if(TypeGuards.isIdentifier(id)) {
            const dec = id.getDefinitions()[0].getDeclarationNode()
            if(dec && TypeGuards.isInterfaceDeclaration(dec)) {
                if(!definitions[dec.getName()]) { // if we haven't already rendered this type, add it in
                    definitions[dec.getName()] = this.renderInterfaceDeclaration(dec)
                } 
                return this.renderRef(dec.getName())
            }
        }
    }

    renderInterfaceDeclaration(id : InterfaceDeclaration, definitions? : StringMap<any>) {
        let definition = {
            properties:  
                id.getProperties()
                .reduce((p, c : PropertySignature ,i,a) => {
                    p[c.getName()] = this.renderProperty(c)
                    return p
                }, {}),
            additionalProperties: false,
            type : "object"
        }
        definition["required"] = _.keys(definition.properties)
        return definition;
    }

}