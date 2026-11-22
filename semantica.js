// semantica.js · verificação semântica (Fase 2)
//
//   Recebe:  a AST do programa (ver docs/especificacao.md, seção 4)
//   Devolve: o vetor de erros semânticos: [ { linha, mensagem }, ... ]
//            (vetor vazio = nenhum erro encontrado)
//
// A gramática aceita o zero em qualquer número, então alguns programas passam pelo parser mas
// não fazem sentido. Esta fase os detecta, com três verificações:
//   1. a tela precisa ter largura e altura maiores que zero;
//   2. o círculo precisa ter raio maior que zero;
//   3. o retângulo precisa ter largura e altura maiores que zero.
//
// A verificação percorre a AST inteira, recursivamente, inclusive dentro de grupos aninhados,
// e devolve TODOS os erros, na ordem em que aparecem no programa. A linha de cada erro é a do
// nó (campo "linha", guardado pelo parser).

export function verificar(ast) {
    const erros = [];
    visitar(ast, erros);
    return erros;
}

// Visita um nó: confere o próprio nó e desce nos filhos.
function visitar(no, erros) {
    switch (no.tipo) {
        case "Programa":
            visitar(no.tela, erros);
            for (const item of no.itens) {
                visitar(item, erros);
            }
            break;

        case "Tela":
            positivos(no, ["largura", "altura"], erros,
                      "a tela precisa ter largura e altura maiores que zero");
            break;

        case "Circulo":
            positivos(no, ["raio"], erros, "o círculo precisa ter raio maior que zero");
            break;

        case "Retangulo":
            positivos(no, ["largura", "altura"], erros,
                      "o retângulo precisa ter largura e altura maiores que zero");
            break;

        case "Grupo":
            // Os modificadores não têm verificação: qualquer ângulo e qualquer deslocamento valem.
            for (const item of no.itens) {
                visitar(item, erros);
            }
            break;

        case "Reta":
            // Sem verificação: uma reta de comprimento zero é aceita (não desenha nada visível).
            break;

        default:
            throw new Error("verificar: nó desconhecido na AST: " + no.tipo);
    }
}

// Confere se os campos do nó são maiores que zero. Se algum não for, registra UM erro para o
// nó (mesmo que os dois campos sejam zero) e, quando há dois campos, diz qual deles falhou:
//   "..., mas a altura é 0"   ou   "..., mas a largura e a altura são 0"
// (os números não têm sinal, então "não ser maior que zero" é ser zero).
function positivos(no, campos, erros, mensagem) {
    const invalidos = campos.filter(campo => !(no[campo] > 0));
    if (invalidos.length === 0) {
        return;
    }
    let detalhe = "";
    if (campos.length > 1) {
        detalhe = invalidos.length === 1
            ? ", mas a " + invalidos[0] + " é " + no[invalidos[0]]
            : ", mas a " + invalidos.join(" e a ") + " são 0";
    }
    erros.push({ linha: no.linha, mensagem: mensagem + detalhe });
}
