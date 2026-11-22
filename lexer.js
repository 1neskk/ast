import { regras } from "./tokens.js";

// Fim de um trecho inválido: espaço em branco, um delimitador ou o início de um comentário.
// Os delimitadores entram aqui porque nesta linguagem eles ficam colados às palavras
// ("circulo(05, 0, 10)"): o trecho inválido é "05", e não "05,".
const FIM_DO_TRECHO = /\s|[(){},:]|\/\//y;

export function analisarLexico(texto) {
    const tokens = [];      // lista de tokens encontrados
    const erros = [];       // lista de erros léxicos encontrados
    let pos = 0;            // ponteiro: posição atual no texto
    let linha = 1;          // linha atual (começa na linha 1)

    while (pos < texto.length) {
        let achou = false;                                   // ainda nenhuma regra casou nesta posição

        for (const regra of regras) {
            regra.padrao.lastIndex = pos;                    // posiciona o ponteiro
            const m = regra.padrao.exec(texto);              // tenta casar exatamente ali
            if (m) {
                if (!regra.ignorar) {                        // só guarda se não for ignorável
                    tokens.push({ tipo: regra.tipo, lexema: m[0], linha });
                }

                for (const caractere of m[0]) {              // conta as quebras de linha do trecho casado
                    if (caractere === "\n") {
                        linha = linha + 1;
                    }
                }

                pos = regra.padrao.lastIndex;                // o ponteiro avança em qualquer caso
                achou = true;                                // casou: avisa o while
                break;
            }
        }

        if (!achou) {                                        // nenhuma regra casou: erro léxico
            let fim = pos + 1;                               // o trecho tem pelo menos 1 caractere
            while (fim < texto.length && !terminaTrecho(texto, fim)) {
                fim = fim + 1;                               // anda até o fim da palavra
            }
            erros.push({ linha, trecho: texto.slice(pos, fim) });
            pos = fim;                                       // pula o trecho inválido e continua
        }
    }

    return { tokens, erros };
}

function terminaTrecho(texto, pos) {
    FIM_DO_TRECHO.lastIndex = pos;
    return FIM_DO_TRECHO.test(texto);
}
