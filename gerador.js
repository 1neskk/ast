// gerador.js · gera o texto SVG a partir da AST (Fase 2)
//
//   Recebe:  a AST do programa, já verificada (sem erros semânticos)
//   Devolve: uma string com o SVG completo, começando em <svg ...> e terminando em </svg>
//
// O gerador é recursivo, como o paraMermaid da aula de AST: gerar(no, nivel) visita o nó,
// chama a si mesmo para cada filho (um nível de indentação a mais) e junta o texto.
// O mapeamento de cada nó está em docs/semantica.md.

const NS_SVG = "http://www.w3.org/2000/svg";
const INDENTACAO = "  ";        // 2 espaços por nível

// Tabela de cores: nome da linguagem -> nome de cor do SVG.
// Os nomes aceitos são os mesmos da regra COR_NOME de tokens.js. "#RRGGBB" passa direto.
export const CORES = {
    vermelho: "red",
    verde:    "green",
    azul:     "blue",
    amarelo:  "yellow",
    laranja:  "orange",
    roxo:     "purple",
    rosa:     "pink",
    preto:    "black",
    branco:   "white",
    cinza:    "gray",
};

// Estilo ausente (campo null na AST): sem preenchimento, traço preto e espessura 1.
// No SVG, uma reta sem stroke fica invisível e uma forma sem fill sai preta; por isso toda
// forma recebe sempre os três atributos.
const PADRAO = { fill: "none", stroke: "black", strokeWidth: 1 };

export function gerarSVG(ast) {
    return gerar(ast, 0);
}

// Devolve o texto SVG do nó, indentado no nível dado (nível 0 = o <svg>).
function gerar(no, nivel) {
    const recuo = INDENTACAO.repeat(nivel);

    switch (no.tipo) {
        case "Programa": {
            const { largura, altura } = no.tela;
            const filhos = no.itens.map(item => gerar(item, nivel + 1));
            return [
                recuo + "<svg" + atributos({
                    xmlns: NS_SVG, width: largura, height: altura,
                    viewBox: "0 0 " + largura + " " + altura,
                }) + ">",
                ...filhos,
                recuo + "</svg>",
            ].join("\n");
        }

        case "Reta":
            return recuo + "<line" + atributos({ x1: no.x1, y1: no.y1, x2: no.x2, y2: no.y2 }, no.estilo) + "/>";

        case "Circulo":
            return recuo + "<circle" + atributos({ cx: no.cx, cy: no.cy, r: no.raio }, no.estilo) + "/>";

        case "Retangulo":
            return recuo + "<rect" + atributos({ x: no.x, y: no.y, width: no.largura, height: no.altura }, no.estilo) + "/>";

        case "Grupo": {
            // Sem modificadores, o <g> sai sem transform. Grupo vazio vira <g/>.
            const abertura = recuo + "<g" + atributos(transformacao(no.modificadores));
            if (no.itens.length === 0) {
                return abertura + "/>";
            }
            const filhos = no.itens.map(item => gerar(item, nivel + 1));
            return [abertura + ">", ...filhos, recuo + "</g>"].join("\n");
        }

        default:
            throw new Error("gerarSVG: nó desconhecido na AST: " + no.tipo);
    }
}

// Todos os modificadores do grupo num único transform, na ordem em que foram escritos:
//   girar(N)    -> rotate(N)          N graus, sentido horário, em torno da origem atual
//   mover(X, Y) -> translate(X Y)     X para a direita, Y para baixo
function transformacao(modificadores) {
    if (modificadores.length === 0) {
        return {};
    }
    const partes = modificadores.map(mod => {
        switch (mod.tipo) {
            case "Rotacao":      return "rotate(" + mod.angulo + ")";
            case "Deslocamento": return "translate(" + mod.dx + " " + mod.dy + ")";
        }
        throw new Error("gerarSVG: modificador desconhecido na AST: " + mod.tipo);
    });
    return { transform: partes.join(" ") };
}

// Monta ' nome="valor"' para cada atributo. Se a forma tem estilo, acrescenta fill, stroke e
// stroke-width, sempre os três, com os padrões no lugar dos campos null.
function atributos(geometria, estilo) {
    const todos = { ...geometria };
    if (estilo) {
        todos.fill = estilo.preenchimento === null ? PADRAO.fill : cor(estilo.preenchimento);
        todos.stroke = estilo.traco === null ? PADRAO.stroke : cor(estilo.traco);
        todos["stroke-width"] = estilo.espessura === null ? PADRAO.strokeWidth : estilo.espessura;
    }
    return Object.entries(todos).map(([nome, valor]) => " " + nome + '="' + valor + '"').join("");
}

// Cor da linguagem -> cor do SVG: o nome passa pela tabela CORES e "#RRGGBB" passa direto,
// exatamente como foi escrito.
function cor(valor) {
    if (valor.startsWith("#")) {
        return valor;
    }
    if (!Object.hasOwn(CORES, valor)) {
        throw new Error("gerarSVG: cor sem correspondente no SVG: " + valor);
    }
    return CORES[valor];
}
