// Roda os casos de teste no terminal: node testes.js  (ou npm test)
//
// 1. Os 8 casos oficiais de casos.js (5 válidos e 3 inválidos).
// 2. Casos extras que cobrem as decisões de projeto e os "cuidados" do enunciado.

import assert from "node:assert/strict";
import { analisarLexico } from "./lexer.js";
import { analisarSintatico, ErroSintatico } from "./parser.js";
import { casos } from "./casos.js";

// Mesma ordem de fases da página: se houver erro léxico, a análise sintática não roda.
function analisar(texto) {
    const { tokens, erros } = analisarLexico(texto);
    if (erros.length > 0) {
        return { errosLexicos: erros };
    }
    try {
        return { ast: analisarSintatico(tokens) };
    } catch (e) {
        if (!(e instanceof ErroSintatico)) {
            throw e;
        }
        return { erroSintatico: { linha: e.linha, esperado: e.esperado, encontrado: e.encontrado } };
    }
}

function sintatico(linha, esperado, encontrado) {
    return { erroSintatico: { linha, esperado, encontrado } };
}

const DEPOIS_DE_ITEM_FORA = '"reta", "circulo", "retangulo", "grupo" ou o fim do programa';
const DEPOIS_DE_ITEM_DENTRO = '"reta", "circulo", "retangulo", "grupo" ou "}"';

// Casos extras: programa completo -> resultado esperado.
const extras = [
    ["programa vazio", "",
        sintatico(1, '"tela"', "o fim do programa")],
    ["só comentários", "// nada\n// aqui",
        sintatico(1, '"tela"', "o fim do programa")],
    ["sem tela", "circulo(0, 0, 5)",
        sintatico(1, '"tela"', '"circulo"')],
    ["tela incompleta", "tela(400)",
        sintatico(1, '","', '")"')],
    ["tela repetida", "tela(1, 1)\ntela(2, 2)",
        sintatico(2, DEPOIS_DE_ITEM_FORA, '"tela"')],
    ["só a tela (desenho vazio)", "tela(0, 0)",
        { ast: { tipo: "Programa", tela: { tipo: "Tela", largura: 0, altura: 0 }, itens: [] } }],
    ["modificador em forma", "tela(1, 1)\ncirculo(0, 0, 5) girar(45)",
        sintatico(2, '"traco", "preenchimento", "espessura", ' + DEPOIS_DE_ITEM_FORA, '"girar"')],
    ["atributo em grupo", "tela(1, 1)\ngrupo traco: azul { }",
        sintatico(2, '"girar", "mover" ou "{"', '"traco"')],
    ["grupo sem fechar (erro no último token)", "tela(1, 1)\ngrupo {\n  reta(0, 0, 1, 1)\n\n// fim",
        sintatico(3, '"traco", "preenchimento", "espessura", ' + DEPOIS_DE_ITEM_DENTRO, "o fim do programa")],
    ["grupo vazio sem fechar", "tela(1, 1)\ngrupo {",
        sintatico(2, DEPOIS_DE_ITEM_DENTRO, "o fim do programa")],
    ["chave a mais", "tela(1, 1)\ngrupo { }\n}",
        sintatico(3, DEPOIS_DE_ITEM_FORA, '"}"')],
    ["dois-pontos faltando", "tela(1, 1)\nreta(0, 0, 1, 1) traco azul",
        sintatico(2, '":"', '"azul"')],
    ["número no lugar de cor", "tela(1, 1)\nreta(0, 0, 1, 1) traco: 5",
        sintatico(2, "cor (nome ou #RRGGBB)", '"5"')],
    ["cor no lugar de número", "tela(1, 1)\nreta(0, 0, 1, 1) espessura: azul",
        sintatico(2, "número", '"azul"')],
    ["vírgula sobrando", "tela(1, 1)\ncirculo(0, 0, 5,)",
        sintatico(2, '")"', '","')],
    ["mover com um número só", "tela(1, 1)\ngrupo mover(5) { }",
        sintatico(2, '","', '")"')],
    ["repetição detectada no fim de um grupo", "tela(1, 1)\ngrupo {\n  circulo(0, 0, 1) espessura: 1 espessura: 2\n}",
        sintatico(3, '"traco", "preenchimento", ' + DEPOIS_DE_ITEM_DENTRO, '"espessura" (atributo repetido nesta forma)')],
    ["erro léxico impede a análise sintática", "tela(1, 1)\nreta(0, 0, 1) @",
        { errosLexicos: [{ linha: 2, trecho: "@" }] }],
];

// Casos extras só do lexer: texto -> tipos dos tokens e erros.
const extrasLexicos = [
    ["palavra-chave não casa com o começo de outra maior", "retangulo reta retas linhas",
        ["RETANGULO", "RETA"], [{ linha: 1, trecho: "retas" }, { linha: 1, trecho: "linhas" }]],
    ["zero aceito, zeros à esquerda não", "0 10 05 007 12px",
        ["NUM", "NUM"], [{ linha: 1, trecho: "05" }, { linha: 1, trecho: "007" }, { linha: 1, trecho: "12px" }]],
    ["hexadecimal com exatamente 6 dígitos", "#FFFFFF #a1B2c3 #FFF #FFFFFFF #GGGGGG",
        ["COR_HEX", "COR_HEX"], [
            { linha: 1, trecho: "#FFF" }, { linha: 1, trecho: "#FFFFFFF" }, { linha: 1, trecho: "#GGGGGG" }]],
    ["# de cor e // de comentário não se confundem", "#FF0000// comentário com #123456 e 05",
        ["COR_HEX"], []],
    ["maiúsculas e acentos não são palavras-chave", "Tela TELA círculo traço azulão",
        [], [
            { linha: 1, trecho: "Tela" }, { linha: 1, trecho: "TELA" }, { linha: 1, trecho: "círculo" },
            { linha: 1, trecho: "traço" }, { linha: 1, trecho: "azulão" }]],
    ["trecho inválido para antes de delimitador", "circulo(05,0)",
        ["CIRCULO", "ABRE_PAR", "VIRGULA", "NUM", "FECHA_PAR"], [{ linha: 1, trecho: "05" }]],
    ["trecho inválido para antes de comentário", "x// resto\n@ok",
        [], [{ linha: 1, trecho: "x" }, { linha: 2, trecho: "@ok" }]],
    ["barra sozinha não é comentário", "a / b",
        [], [{ linha: 1, trecho: "a" }, { linha: 1, trecho: "/" }, { linha: 1, trecho: "b" }]],
];

let total = 0;
let falhas = 0;

function rodar(nome, teste) {
    total = total + 1;
    try {
        teste();
        console.log("  ok    " + nome);
    } catch (e) {
        falhas = falhas + 1;
        console.log("  FALHA " + nome + "\n" + e.message.replace(/^/gm, "        "));
    }
}

console.log("Casos oficiais (casos.js)");
for (const caso of casos) {
    rodar(caso.id + " " + caso.nome, () => assert.deepEqual(analisar(caso.programa), caso.esperado));
}
rodar("5 válidos, 3 inválidos (1 léxico, 2 sintáticos diferentes)", () => {
    const tipos = casos.map(c => Object.keys(c.esperado)[0]);
    assert.equal(tipos.filter(t => t === "ast").length, 5);
    assert.equal(tipos.filter(t => t === "errosLexicos").length, 1);
    const sint = casos.filter(c => c.esperado.erroSintatico).map(c => c.esperado.erroSintatico.esperado);
    assert.equal(sint.length, 2);
    assert.notEqual(sint[0], sint[1]);
});

console.log("\nCasos extras do parser");
for (const [nome, programa, esperado] of extras) {
    rodar(nome, () => assert.deepEqual(analisar(programa), esperado));
}
rodar("aninhamento profundo (300 grupos)", () => {
    const n = 300;
    let { ast } = analisar("tela(1, 1)\n" + "grupo { ".repeat(n) + "reta(0, 0, 1, 1)" + " }".repeat(n));
    let profundidade = 0;
    let no = ast.itens[0];
    while (no.tipo === "Grupo") {
        profundidade = profundidade + 1;
        no = no.itens[0];
    }
    assert.equal(profundidade, n);
    assert.equal(no.tipo, "Reta");
});

console.log("\nCasos extras do lexer");
for (const [nome, texto, tipos, erros] of extrasLexicos) {
    rodar(nome, () => {
        const r = analisarLexico(texto);
        assert.deepEqual(r.tokens.map(t => t.tipo), tipos);
        assert.deepEqual(r.erros, erros);
    });
}
rodar("contagem de linhas com comentários, linhas em branco e \\r\\n", () => {
    const r = analisarLexico("\n\ntela\r\n\n  // x\n reta /* */");
    assert.deepEqual(r.tokens.map(t => [t.tipo, t.linha]), [["TELA", 3], ["RETA", 6]]);
    assert.deepEqual(r.erros, [{ linha: 6, trecho: "/*" }, { linha: 6, trecho: "*/" }]);
});
rodar("números viram Number na AST, não texto", () => {
    const { ast } = analisar("tela(400, 0)");
    assert.equal(typeof ast.tela.largura, "number");
    assert.equal(ast.tela.altura, 0);
});

console.log("\n" + (total - falhas) + "/" + total + " testes passaram");
process.exitCode = falhas > 0 ? 1 : 0;
