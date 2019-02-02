
export type union = A | B

export interface A {
    AString : string
    nameParam : "A"
}

export interface B {
    BNumber : number
    nameParam : "B"
}

export const valid : Array<union> = [
    {
        AString : "astring",
        nameParam : "A"
    },
    {
        BNumber : 1,
        nameParam : "B"
    }
]


export const invalid = [{
    StringParam : 1
},
{
    AString : "astring",
    nameParam : "B"
},
{
    BNumber : 1,
    nameParam : "A"
}]