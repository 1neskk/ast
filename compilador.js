// compilador.js · o caminho completo: programa → tokens → AST → verificação semântica → SVG
//
// Roda as quatro fases na ordem e para na primeira que tiver erro (as seguintes não rodam).
// Usado pela página (main.js), pelos testes (testes.js) e por gerar-saidas.js.
//
//   Recebe:  o texto do programa
//   Devolve: sempre { tokens } e mais um destes, conforme a fase em que parou:
//     { errosLexicos }              erro léxico: sem AST
//     { erroSintatico }             erro sintático (um ErroSintatico): sem AST
//     { ast, errosSemanticos }      erro semântico: tem AST, mas não tem SVG
//     { ast, svg }                  sem erros: o texto SVG gerado

import { analisarLexico } from "./lexer.js";
import { analisarSintatico, ErroSintatico } from "./parser.js";
import { verificar } from "./semantica.js";
import { gerarSVG } from "./gerador.js";

export function compilar(texto) {
    // 1) léxico
    const { tokens, erros } = analisarLexico(texto);
    if (erros.length > 0) {
        return { tokens, errosLexicos: erros };
    }

    // 2) sintático
    let ast;
    try {
        ast = analisarSintatico(tokens);
    } catch (falha) {
        if (!(falha instanceof ErroSintatico)) {
            throw falha;
        }
        return { tokens, erroSintatico: falha };
    }

    // 3) semântico
    const errosSemanticos = verificar(ast);
    if (errosSemanticos.length > 0) {
        return { tokens, ast, errosSemanticos };
    }

    // 4) gerador
    return { tokens, ast, svg: gerarSVG(ast) };
}

// Resume o resultado no formato do campo "esperado" de casos.js, para comparar:
// { errosLexicos } | { erroSintatico: { linha, esperado, encontrado } } | { errosSemanticos } | { ast }
export function resumir(resultado) {
    if (resultado.errosLexicos) {
        return { errosLexicos: resultado.errosLexicos };
    }
    if (resultado.erroSintatico) {
        const { linha, esperado, encontrado } = resultado.erroSintatico;
        return { erroSintatico: { linha, esperado, encontrado } };
    }
    if (resultado.errosSemanticos) {
        return { errosSemanticos: resultado.errosSemanticos };
    }
    return { ast: resultado.ast };
}
