// Roda os casos de teste no terminal: node testes.js  (ou npm test)
//
// 1. Os casos oficiais de casos.js: 5 válidos e 3 inválidos da Fase 1, 3 com erro semântico da Fase 2.
// 2. Fase 1: casos extras do parser e do lexer (decisões de projeto e "cuidados" do enunciado).
// 3. Fase 2: a linha nos nós da AST, a verificação semântica, o gerador de SVG e os arquivos
//    da pasta saidas/ (que precisam ser iguais ao que o compilador gera hoje).

import assert from "node:assert/strict";
import fs from "node:fs";
import { analisarLexico } from "./lexer.js";
import { analisarSintatico, ErroSintatico } from "./parser.js";
import { verificar } from "./semantica.js";
import { gerarSVG, CORES } from "./gerador.js";
import { compilar, resumir } from "./compilador.js";
import { casos, desenhoFinal, nomeDeArquivo } from "./casos.js";
import { regras } from "./tokens.js";

// ---------------------------------------------------------------- utilitários

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

// As fases 1 e 2 juntas, resumidas como o "esperado" de casos.js.
function analisar(texto) {
    return resumir(compilar(texto));
}

// Só a Fase 1 (léxico e sintático), sem a verificação semântica: para os testes do parser,
// que aceitam programas como tela(0, 0).
function fase1(texto) {
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

function ast(texto) {
    const resultado = fase1(texto);
    assert.ok(resultado.ast, "o programa deveria passar pelo parser: " + JSON.stringify(resultado));
    return resultado.ast;
}

function svg(texto) {
    return gerarSVG(ast(texto));
}

// Linhas do SVG sem a primeira (<svg ...>) e a última (</svg>), sem a indentação do nível 1.
function corpo(texto) {
    return svg(texto).split("\n").slice(1, -1).map(l => l.replace(/^ {2}/, ""));
}

function sintatico(linha, esperado, encontrado) {
    return { erroSintatico: { linha, esperado, encontrado } };
}

// Confere, sem DOM, que o texto é XML bem formado: só tags (nada de texto solto), cada
// atributo uma vez e entre aspas, cada tag aberta fechada na ordem certa e um único <svg>
// como raiz. (A página confere de novo com o DOMParser antes de desenhar.)
function conferirXml(texto) {
    const TAG = /^<(\/?)([a-zA-Z][\w-]*)((?:\s+[a-zA-Z][\w:-]*="[^"<&]*")*)\s*(\/?)>$/;
    const pilha = [];
    let raizes = 0;
    const partes = texto.split(/(<[^>]*>)/);
    partes.forEach((parte, k) => {
        if (k % 2 === 0) {
            assert.match(parte, /^\s*$/, "texto fora de tag: " + JSON.stringify(parte));
            return;
        }
        const m = TAG.exec(parte);
        assert.ok(m, "tag malformada: " + parte);
        const [, fecha, nome, attrs, autoFecha] = m;
        const nomes = [...attrs.matchAll(/([\w:-]+)=/g)].map(a => a[1]);
        assert.equal(new Set(nomes).size, nomes.length, "atributo repetido: " + parte);
        if (fecha) {
            assert.ok(!attrs && !autoFecha, "tag de fechamento com atributos: " + parte);
            assert.equal(pilha.pop(), nome, "fechamento fora de ordem: " + parte);
            return;
        }
        if (pilha.length === 0) {
            raizes = raizes + 1;
            assert.equal(nome, "svg", "a raiz precisa ser <svg>");
        }
        if (!autoFecha) {
            pilha.push(nome);
        }
    });
    assert.deepEqual(pilha, [], "tags sem fechar: " + pilha.join(", "));
    assert.equal(raizes, 1, "precisa haver exatamente um <svg> na raiz");
}

// ---------------------------------------------------------------- 1. casos oficiais

console.log("Casos oficiais (casos.js)");
for (const caso of casos) {
    rodar(caso.id + " " + caso.nome, () => assert.deepEqual(analisar(caso.programa), caso.esperado));
}
rodar("5 válidos, 3 inválidos da Fase 1 (1 léxico, 2 sintáticos diferentes)", () => {
    const tipos = casos.map(c => Object.keys(c.esperado)[0]);
    assert.equal(tipos.filter(t => t === "ast").length, 5);
    assert.equal(tipos.filter(t => t === "errosLexicos").length, 1);
    const sint = casos.filter(c => c.esperado.erroSintatico).map(c => c.esperado.erroSintatico.esperado);
    assert.equal(sint.length, 2);
    assert.notEqual(sint[0], sint[1]);
});
rodar("casos semânticos cobrem as três verificações (tela, círculo e retângulo)", () => {
    const mensagens = casos.filter(c => c.esperado.errosSemanticos)
        .flatMap(c => c.esperado.errosSemanticos.map(e => e.mensagem));
    for (const sujeito of ["a tela", "o círculo", "o retângulo"]) {
        assert.ok(mensagens.some(m => m.startsWith(sujeito)), "falta um caso para " + sujeito);
    }
});
rodar("desenho final: válido, com as três formas e grupos aninhados com girar e mover", () => {
    const resultado = compilar(desenhoFinal.programa);
    assert.ok(resultado.svg, "o desenho final deveria gerar SVG");
    const tipos = new Set();
    let aninhadoComOsDois = false;
    function visitar(no, dentroDeGrupo) {
        tipos.add(no.tipo);
        for (const m of no.modificadores ?? []) {
            tipos.add(m.tipo);
        }
        if (no.tipo === "Grupo" && dentroDeGrupo) {
            aninhadoComOsDois = true;
        }
        for (const filho of no.itens ?? []) {
            visitar(filho, dentroDeGrupo || no.tipo === "Grupo");
        }
    }
    visitar(resultado.ast, false);
    for (const tipo of ["Reta", "Circulo", "Retangulo", "Grupo", "Rotacao", "Deslocamento"]) {
        assert.ok(tipos.has(tipo), "o desenho final não usa " + tipo);
    }
    assert.ok(aninhadoComOsDois, "o desenho final não tem grupo dentro de grupo");
});

// ---------------------------------------------------------------- 2. Fase 1

const DEPOIS_DE_ITEM_FORA = '"reta", "circulo", "retangulo", "grupo" ou o fim do programa';
const DEPOIS_DE_ITEM_DENTRO = '"reta", "circulo", "retangulo", "grupo" ou "}"';

// Casos extras: programa completo -> resultado esperado (só léxico e sintático).
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
    ["só a tela (desenho vazio; o zero passa pelo parser)", "tela(0, 0)",
        { ast: { tipo: "Programa", tela: { tipo: "Tela", linha: 1, largura: 0, altura: 0 }, itens: [] } }],
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

console.log("\nFase 1: casos extras do parser");
for (const [nome, programa, esperado] of extras) {
    rodar(nome, () => assert.deepEqual(fase1(programa), esperado));
}
rodar("aninhamento profundo (300 grupos)", () => {
    const n = 300;
    let no = ast("tela(1, 1)\n" + "grupo { ".repeat(n) + "reta(0, 0, 1, 1)" + " }".repeat(n)).itens[0];
    let profundidade = 0;
    while (no.tipo === "Grupo") {
        profundidade = profundidade + 1;
        no = no.itens[0];
    }
    assert.equal(profundidade, n);
    assert.equal(no.tipo, "Reta");
});

console.log("\nFase 1: casos extras do lexer");
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
    const programa = ast("tela(400, 0)");
    assert.equal(typeof programa.tela.largura, "number");
    assert.equal(programa.tela.altura, 0);
});

// ---------------------------------------------------------------- 3. Fase 2: linha nos nós

console.log("\nFase 2: linha nos nós da AST");
rodar("a linha de cada nó é a da palavra-chave que o começa", () => {
    const programa = ast(
        "// comentário\n" +             // 1
        "\n" +                          // 2
        "tela(\n  10,\n  10\n)\n" +     // 3 a 6
        "circulo\n(0, 0,\n5)\n" +       // 7 a 9
        "grupo\n" +                     // 10
        "  girar(1)\n" +                // 11
        "  mover(1,\n 1) {\n" +         // 12 e 13
        "  reta(0, 0, 1, 1) retangulo(0, 0, 1, 1)\n" + // 14
        "}");
    assert.equal(programa.tela.linha, 3);
    const [circulo, grupo] = programa.itens;
    assert.equal(circulo.linha, 7);
    assert.equal(grupo.linha, 10);
    assert.deepEqual(grupo.modificadores.map(m => m.linha), [11, 12]);
    assert.deepEqual(grupo.itens.map(i => [i.tipo, i.linha]), [["Reta", 14], ["Retangulo", 14]]);
});
rodar("todo nó tem linha, menos o Programa", () => {
    function conferir(no) {
        if (no.tipo === "Programa") {
            assert.ok(!("linha" in no));
        } else {
            assert.equal(typeof no.linha, "number", no.tipo + " sem linha");
        }
        [no.tela, ...(no.modificadores ?? []), ...(no.itens ?? [])].filter(Boolean).forEach(conferir);
    }
    conferir(compilar(desenhoFinal.programa).ast);
});

// ---------------------------------------------------------------- 3. Fase 2: semântica

function erros(texto) {
    return verificar(ast(texto));
}

const TELA = "a tela precisa ter largura e altura maiores que zero";
const CIRCULO = "o círculo precisa ter raio maior que zero";
const RETANGULO = "o retângulo precisa ter largura e altura maiores que zero";

console.log("\nFase 2: verificação semântica");
const extrasSemanticos = [
    ["tela sem largura", "tela(0, 5)", [{ linha: 1, mensagem: TELA + ", mas a largura é 0" }]],
    ["tela sem altura", "tela(5, 0)", [{ linha: 1, mensagem: TELA + ", mas a altura é 0" }]],
    ["tela sem largura nem altura: um erro só", "tela(0, 0)",
        [{ linha: 1, mensagem: TELA + ", mas a largura e a altura são 0" }]],
    ["menor tela válida", "tela(1, 1)", []],
    ["círculo de raio zero", "tela(9, 9)\ncirculo(4, 4, 0)", [{ linha: 2, mensagem: CIRCULO }]],
    ["círculo de raio 1", "tela(9, 9)\ncirculo(4, 4, 1)", []],
    ["retângulo sem largura", "tela(9, 9)\nretangulo(1, 1, 0, 3)", [{ linha: 2, mensagem: RETANGULO + ", mas a largura é 0" }]],
    ["retângulo sem altura", "tela(9, 9)\nretangulo(1, 1, 3, 0)", [{ linha: 2, mensagem: RETANGULO + ", mas a altura é 0" }]],
    ["retângulo sem largura nem altura: um erro só", "tela(9, 9)\nretangulo(1, 1, 0, 0)",
        [{ linha: 2, mensagem: RETANGULO + ", mas a largura e a altura são 0" }]],
    ["menor retângulo válido", "tela(9, 9)\nretangulo(0, 0, 1, 1)", []],
    ["todos os erros, na ordem do programa, inclusive vários na mesma linha",
        "tela(0, 9)\ngrupo {\n  retangulo(0, 0, 0, 1) circulo(0, 0, 0)\n}\ncirculo(0, 0, 0)", [
            { linha: 1, mensagem: TELA + ", mas a largura é 0" },
            { linha: 3, mensagem: RETANGULO + ", mas a largura é 0" },
            { linha: 3, mensagem: CIRCULO },
            { linha: 5, mensagem: CIRCULO },
        ]],
    ["erro depois de grupos irmãos e de grupo vazio",
        "tela(9, 9)\ngrupo { }\ngrupo { circulo(1, 1, 1) }\ngrupo {\n grupo { }\n retangulo(0, 0, 5, 0)\n}",
        [{ linha: 6, mensagem: RETANGULO + ", mas a altura é 0" }]],
    ["sem verificação: reta de comprimento zero, espessura 0, coordenadas 0 e fora da tela",
        "tela(9, 9)\nreta(0, 0, 0, 0)\ncirculo(0, 0, 1) espessura: 0\nretangulo(500, 500, 1, 1)", []],
    ["sem verificação: girar(0), mover(0, 0), ângulos acima de 360 e grupo vazio",
        "tela(9, 9)\ngrupo girar(0) mover(0, 0) girar(720) { }", []],
];
for (const [nome, programa, esperado] of extrasSemanticos) {
    rodar(nome, () => assert.deepEqual(erros(programa), esperado));
}
rodar("percorre a AST inteira: erro 200 grupos abaixo", () => {
    const n = 200;
    const programa = "tela(9, 9)\n" + "grupo mover(1, 1) {\n".repeat(n) + "circulo(0, 0, 0)\n" + "}\n".repeat(n);
    assert.deepEqual(erros(programa), [{ linha: n + 2, mensagem: CIRCULO }]);
});
rodar("devolve um vetor vazio (e não undefined) quando não há erro", () => {
    assert.deepEqual(verificar(compilar(desenhoFinal.programa).ast), []);
});
rodar("ordem das fases: com erro semântico, há AST mas não há SVG", () => {
    const resultado = compilar("tela(0, 1)\ncirculo(0, 0, 0)");
    assert.ok(resultado.ast);
    assert.equal(resultado.errosSemanticos.length, 2);
    assert.ok(!("svg" in resultado));
});
rodar("ordem das fases: com erro sintático, a semântica não roda", () => {
    const resultado = compilar("tela(0, 0)\ncirculo(0, 0)");          // tela inválida, mas o parser para antes
    assert.ok(resultado.erroSintatico);
    assert.ok(!("ast" in resultado) && !("errosSemanticos" in resultado) && !("svg" in resultado));
});
rodar("ordem das fases: com erro léxico, nada depois roda", () => {
    const resultado = compilar("tela(0, 0) @");
    assert.deepEqual(resultado.errosLexicos, [{ linha: 1, trecho: "@" }]);
    assert.ok(!("ast" in resultado) && !("erroSintatico" in resultado));
});

// ---------------------------------------------------------------- 3. Fase 2: gerador

const NS = 'xmlns="http://www.w3.org/2000/svg"';

console.log("\nFase 2: gerador de SVG");
rodar("o exemplo do enunciado (carro, caso V2) gera exatamente o SVG esperado", () => {
    const esperado = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">',
        '  <rect x="50" y="150" width="200" height="60" fill="blue" stroke="black" stroke-width="1"/>',
        '  <g transform="translate(70 190)">',
        '    <circle cx="0" cy="0" r="25" fill="black" stroke="black" stroke-width="1"/>',
        '    <g transform="rotate(45)">',
        '      <line x1="0" y1="0" x2="20" y2="0" fill="none" stroke="white" stroke-width="2"/>',
        "    </g>",
        "  </g>",
        '  <g transform="translate(200 190)">',
        '    <circle cx="0" cy="0" r="25" fill="black" stroke="black" stroke-width="1"/>',
        "  </g>",
        "</svg>",
    ].join("\n");
    assert.equal(compilar(casos.find(c => c.id === "V2").programa).svg, esperado);
});
rodar("tela: <svg> com xmlns, width, height e viewBox; programa só com a tela", () => {
    assert.equal(svg("tela(640, 480)"),
        '<svg ' + NS + ' width="640" height="480" viewBox="0 0 640 480">\n</svg>');
});
rodar("estilo ausente: fill none, stroke black e stroke-width 1, nas três formas", () => {
    assert.deepEqual(corpo("tela(9, 9)\nreta(1, 2, 3, 4)\ncirculo(5, 6, 7)\nretangulo(1, 2, 3, 4)"), [
        '<line x1="1" y1="2" x2="3" y2="4" fill="none" stroke="black" stroke-width="1"/>',
        '<circle cx="5" cy="6" r="7" fill="none" stroke="black" stroke-width="1"/>',
        '<rect x="1" y="2" width="3" height="4" fill="none" stroke="black" stroke-width="1"/>',
    ]);
});
rodar("só um atributo: os outros dois ficam com o padrão", () => {
    assert.deepEqual(corpo("tela(9, 9)\ncirculo(1, 1, 1) preenchimento: azul\n" +
                           "circulo(1, 1, 1) traco: azul\ncirculo(1, 1, 1) espessura: 4"), [
        '<circle cx="1" cy="1" r="1" fill="blue" stroke="black" stroke-width="1"/>',
        '<circle cx="1" cy="1" r="1" fill="none" stroke="blue" stroke-width="1"/>',
        '<circle cx="1" cy="1" r="1" fill="none" stroke="black" stroke-width="4"/>',
    ]);
});
rodar("a ordem dos atributos no programa não muda o SVG", () => {
    assert.deepEqual(corpo("tela(9, 9)\nreta(0, 0, 1, 1) espessura: 3 preenchimento: rosa traco: verde"),
                     corpo("tela(9, 9)\nreta(0, 0, 1, 1) traco: verde preenchimento: rosa espessura: 3"));
});
rodar("espessura 0 vira stroke-width 0 (forma sem contorno)", () => {
    assert.match(svg("tela(9, 9)\ncirculo(1, 1, 1) espessura: 0"), /stroke-width="0"/);
});
rodar("tabela de cores: os 10 nomes viram nomes de cor do SVG", () => {
    const nomes = regras.find(r => r.tipo === "COR_NOME").padrao.source.match(/\(\?:([^)]*)\)/)[1].split("|");
    assert.deepEqual(Object.keys(CORES).sort(), [...nomes].sort(), "CORES e tokens.js com nomes diferentes");
    const linhas = corpo("tela(9, 9)\n" + nomes.map(n => "reta(0, 0, 1, 1) traco: " + n + " preenchimento: " + n).join("\n"));
    nomes.forEach((nome, k) => {
        assert.match(linhas[k], new RegExp(' fill="' + CORES[nome] + '" stroke="' + CORES[nome] + '"'));
    });
    assert.deepEqual(Object.values(CORES),
        ["red", "green", "blue", "yellow", "orange", "purple", "pink", "black", "white", "gray"]);
});
rodar("cor #RRGGBB passa direto, como foi escrita", () => {
    assert.deepEqual(corpo("tela(9, 9)\nretangulo(0, 0, 1, 1) traco: #1a2B3c preenchimento: #FFFFFF"), [
        '<rect x="0" y="0" width="1" height="1" fill="#FFFFFF" stroke="#1a2B3c" stroke-width="1"/>',
    ]);
});
rodar("grupo sem modificadores: <g> sem transform; grupo vazio: <g/>", () => {
    assert.deepEqual(corpo("tela(9, 9)\ngrupo { }\ngrupo girar(10) { }\ngrupo { reta(0, 0, 1, 1) }"), [
        "<g/>",
        '<g transform="rotate(10)"/>',
        "<g>",
        '  <line x1="0" y1="0" x2="1" y2="1" fill="none" stroke="black" stroke-width="1"/>',
        "</g>",
    ]);
});
rodar("girar(N) vira rotate(N) e mover(X, Y) vira translate(X Y)", () => {
    assert.deepEqual(corpo("tela(9, 9)\ngrupo girar(45) { }\ngrupo mover(70, 190) { }"),
        ['<g transform="rotate(45)"/>', '<g transform="translate(70 190)"/>']);
});
rodar("vários modificadores: todos no transform, na ordem escrita, sem juntar nem descartar", () => {
    assert.deepEqual(corpo("tela(9, 9)\ngrupo girar(90) mover(40, 0) { }\ngrupo mover(40, 0) girar(90) { }\n" +
                           "grupo girar(0) mover(0, 0) girar(30) girar(30) { }"), [
        '<g transform="rotate(90) translate(40 0)"/>',
        '<g transform="translate(40 0) rotate(90)"/>',
        '<g transform="rotate(0) translate(0 0) rotate(30) rotate(30)"/>',
    ]);
});
rodar("grupos aninhados: cada nível dentro do anterior, com 2 espaços a mais", () => {
    assert.deepEqual(corpo("tela(9, 9)\ngrupo mover(1, 2) {\n circulo(0, 0, 1)\n grupo girar(3) {\n  grupo {\n   reta(0, 0, 1, 0)\n  }\n }\n}"), [
        '<g transform="translate(1 2)">',
        '  <circle cx="0" cy="0" r="1" fill="none" stroke="black" stroke-width="1"/>',
        '  <g transform="rotate(3)">',
        "    <g>",
        '      <line x1="0" y1="0" x2="1" y2="0" fill="none" stroke="black" stroke-width="1"/>',
        "    </g>",
        "  </g>",
        "</g>",
    ]);
});
rodar("aninhamento profundo (300 grupos): todos os níveis, nenhum perdido", () => {
    const n = 300;
    const texto = svg("tela(1, 1)\n" + "grupo girar(1) { ".repeat(n) + "reta(0, 0, 1, 1)" + " }".repeat(n));
    assert.equal(texto.match(/<g transform="rotate\(1\)">/g).length, n);
    assert.equal(texto.match(/<\/g>/g).length, n);
    assert.match(texto, new RegExp("\n" + " ".repeat(2 * (n + 1)) + "<line "));
    conferirXml(texto);
});
rodar("ordem dos elementos: a do programa (o que vem depois fica por cima)", () => {
    const linhas = corpo("tela(9, 9)\nretangulo(0, 0, 9, 9)\ngrupo { circulo(1, 1, 1) }\nreta(0, 0, 9, 9)");
    assert.deepEqual(linhas.map(l => l.trim().match(/^<\/?(\w+)/)[1]), ["rect", "g", "circle", "g", "line"]);
});
rodar("o gerador não altera a AST", () => {
    const programa = compilar(desenhoFinal.programa).ast;
    const copia = structuredClone(programa);
    gerarSVG(programa);
    assert.deepEqual(programa, copia);
});

console.log("\nFase 2: arquivos da pasta saidas/ (gerados por: node gerar-saidas.js)");
for (const caso of [...casos.filter(c => c.esperado.ast), desenhoFinal]) {
    const arquivo = "saidas/" + nomeDeArquivo(caso) + ".svg";
    rodar(arquivo + " é igual ao SVG gerado e é XML bem formado", () => {
        const gerado = compilar(caso.programa).svg;
        conferirXml(gerado);
        assert.ok(fs.existsSync(new URL(arquivo, import.meta.url)), "arquivo não existe: rode node gerar-saidas.js");
        const gravado = fs.readFileSync(new URL(arquivo, import.meta.url), "utf-8");
        assert.equal(gravado, gerado + "\n", "arquivo desatualizado: rode node gerar-saidas.js");
        assert.ok(fs.existsSync(new URL(arquivo.replace(/\.svg$/, ".png"), import.meta.url)), "falta a imagem .png");
    });
}
rodar("saidas/" + nomeDeArquivo(desenhoFinal) + ".txt é o programa do desenho final", () => {
    const gravado = fs.readFileSync(new URL("saidas/" + nomeDeArquivo(desenhoFinal) + ".txt", import.meta.url), "utf-8");
    assert.equal(gravado, desenhoFinal.programa + "\n");
});

console.log("\n" + (total - falhas) + "/" + total + " testes passaram");
process.exitCode = falhas > 0 ? 1 : 0;
