import { descricoes } from "./tokens.js";

// Erro sintático: guarda a linha, o que era esperado e o que foi encontrado.
export class ErroSintatico extends Error {
    constructor(linha, esperado, encontrado) {
        super("Erro sintático na linha " + linha + ": esperado " + esperado + ", encontrado " + encontrado);
        this.name = "ErroSintatico";
        this.linha = linha;
        this.esperado = esperado;
        this.encontrado = encontrado;
    }
}

// Tokens que podem começar um item (uma forma ou um grupo): FIRST(item).
const INICIO_DE_ITEM = ["RETA", "CIRCULO", "RETANGULO", "GRUPO"];

// Os três atributos de estilo: token, campo na AST e o que vem depois dos dois-pontos.
const ATRIBUTOS = {
    TRACO:         { campo: "traco",         valor: "cor" },
    PREENCHIMENTO: { campo: "preenchimento", valor: "cor" },
    ESPESSURA:     { campo: "espessura",     valor: "numero" },
};

// Analisador descendente recursivo. Cada não-terminal da gramática (ver docs/especificacao.md)
// virou uma função com o mesmo nome. Recebe a lista de tokens do lexer e devolve a AST.
// Para no primeiro erro, lançando um ErroSintatico.
export function analisarSintatico(tokens) {
    let i = 0;          // ponteiro: posição do token atual na lista de tokens
    let nivel = 0;      // quantos grupos estão abertos (0 = fora de qualquer grupo)

    // Token "fim do programa", devolvido quando a lista acaba. A linha é a do último token.
    const ultimaLinha = tokens.length > 0 ? tokens[tokens.length - 1].linha : 1;
    const fim = { tipo: "EOF", lexema: "", linha: ultimaLinha };

    function atual() {
        return i < tokens.length ? tokens[i] : fim;
    }

    function descreverEncontrado(token) {
        return token.tipo === "EOF" ? descricoes.EOF : '"' + token.lexema + '"';
    }

    // Junta uma lista de alternativas: ["a", "b", "c"] -> "a, b ou c".
    function alternativas(lista) {
        if (lista.length === 1) {
            return lista[0];
        }
        return lista.slice(0, -1).join(", ") + " ou " + lista[lista.length - 1];
    }

    function erro(esperados, token = atual(), observacao = "") {
        const encontrado = descreverEncontrado(token) + (observacao ? " (" + observacao + ")" : "");
        throw new ErroSintatico(token.linha, alternativas(esperados), encontrado);
    }

    // O que pode vir depois de um item: outro item ou o fechamento do bloco atual.
    // FOLLOW(itens) é { "}", fim }, mas o "}" só é válido dentro de um grupo e o fim só fora.
    function fimDoBloco() {
        return nivel > 0 ? "FECHA_CHAVE" : "EOF";
    }

    function podeSeguirItem(tipo) {
        return INICIO_DE_ITEM.includes(tipo) || tipo === fimDoBloco();
    }

    function esperadosAposItem() {
        return [...INICIO_DE_ITEM, fimDoBloco()].map(t => descricoes[t]);
    }

    // Consome o token atual se for do tipo pedido; senão, erro. Devolve o token consumido.
    function esperar(tipo, esperados = [descricoes[tipo]]) {
        const token = atual();
        if (token.tipo !== tipo) {
            erro(esperados, token);
        }
        i = i + 1;
        return token;
    }

    function numero() {
        return Number(esperar("NUM").lexema);               // número como número, não como texto
    }

    // programa → decl_tela itens
    function programa() {
        const tela = declTela();
        const lista = itens();
        esperar("EOF", esperadosAposItem());                 // nada pode sobrar depois dos itens
        return { tipo: "Programa", tela, itens: lista };
    }

    // decl_tela → TELA ABRE_PAR NUM VIRGULA NUM FECHA_PAR
    function declTela() {
        esperar("TELA");
        esperar("ABRE_PAR");
        const largura = numero();
        esperar("VIRGULA");
        const altura = numero();
        esperar("FECHA_PAR");
        return { tipo: "Tela", largura, altura };
    }

    // itens → item itens | ε
    // A recursão à direita vira um laço: enquanto o próximo token começa um item, analisa-o.
    function itens() {
        const lista = [];
        while (INICIO_DE_ITEM.includes(atual().tipo)) {
            lista.push(item());
        }
        return lista;                                        // ε: quem chamou confere o que vem depois
    }

    // item → forma | grupo
    // forma → reta | circulo | retangulo
    function item() {
        switch (atual().tipo) {
            case "RETA":      return reta();
            case "CIRCULO":   return circulo();
            case "RETANGULO": return retangulo();
            case "GRUPO":     return grupo();
        }
        // itens() só chama item() quando o token está em INICIO_DE_ITEM
        erro(INICIO_DE_ITEM.map(t => descricoes[t]));
    }

    // Lê "( NUM , NUM , ... )" com a quantidade pedida de números.
    function argumentos(quantidade) {
        esperar("ABRE_PAR");
        const valores = [numero()];
        for (let k = 1; k < quantidade; k++) {
            esperar("VIRGULA");
            valores.push(numero());
        }
        esperar("FECHA_PAR");
        return valores;
    }

    // reta → RETA ABRE_PAR NUM VIRGULA NUM VIRGULA NUM VIRGULA NUM FECHA_PAR estilo
    function reta() {
        esperar("RETA");
        const [x1, y1, x2, y2] = argumentos(4);
        return { tipo: "Reta", x1, y1, x2, y2, estilo: estilo() };
    }

    // circulo → CIRCULO ABRE_PAR NUM VIRGULA NUM VIRGULA NUM FECHA_PAR estilo
    function circulo() {
        esperar("CIRCULO");
        const [cx, cy, raio] = argumentos(3);
        return { tipo: "Circulo", cx, cy, raio, estilo: estilo() };
    }

    // retangulo → RETANGULO ABRE_PAR NUM VIRGULA NUM VIRGULA NUM VIRGULA NUM FECHA_PAR estilo
    function retangulo() {
        esperar("RETANGULO");
        const [x, y, largura, altura] = argumentos(4);
        return { tipo: "Retangulo", x, y, largura, altura, estilo: estilo() };
    }

    // estilo, estilo_t, estilo_p, estilo_e, estilo_tp, estilo_te, estilo_pe
    // As letras do nome dizem quais atributos já foram usados (t = traco, p = preenchimento,
    // e = espessura), e cada um só tem alternativas para os atributos que faltam. Por exemplo:
    //   estilo   → atr_traco estilo_t | atr_preench estilo_p | atr_espessura estilo_e | ε
    //   estilo_t → atr_preench estilo_tp | atr_espessura estilo_te | ε
    // Esta função implementa os sete: o parâmetro "estiloAtual" faz o papel das letras
    // (um campo diferente de null é um atributo já usado).
    function estilo(estiloAtual = { traco: null, preenchimento: null, espessura: null }) {
        const token = atual();
        const atributo = ATRIBUTOS[token.tipo];
        const naoUsados = Object.keys(ATRIBUTOS).filter(t => estiloAtual[ATRIBUTOS[t].campo] === null);

        if (atributo && estiloAtual[atributo.campo] === null) {
            esperar(token.tipo);
            esperar("DOIS_PONTOS");
            const valor = atributo.valor === "cor" ? cor() : numero();
            return estilo({ ...estiloAtual, [atributo.campo]: valor });
        }

        // ε: só vale se o token pode vir depois de uma forma (FOLLOW)
        if (podeSeguirItem(token.tipo)) {
            return estiloAtual;
        }

        const esperados = [...naoUsados.map(t => descricoes[t]), ...esperadosAposItem()];
        erro(esperados, token, atributo ? "atributo repetido nesta forma" : "");
    }

    // cor → COR_NOME | COR_HEX
    function cor() {
        const token = atual();
        if (token.tipo === "COR_NOME" || token.tipo === "COR_HEX") {
            i = i + 1;
            return token.lexema;
        }
        erro(["cor (nome ou #RRGGBB)"]);
    }

    // grupo → GRUPO modificadores ABRE_CHAVE itens FECHA_CHAVE
    function grupo() {
        esperar("GRUPO");
        const mods = modificadores();
        esperar("ABRE_CHAVE", [descricoes.GIRAR, descricoes.MOVER, descricoes.ABRE_CHAVE]);
        nivel = nivel + 1;
        const lista = itens();
        esperar("FECHA_CHAVE", esperadosAposItem());
        nivel = nivel - 1;
        return { tipo: "Grupo", modificadores: mods, itens: lista };
    }

    // modificadores → modificador modificadores | ε
    // Laço, como em itens(). Os modificadores ficam na ordem em que foram escritos.
    function modificadores() {
        const lista = [];
        while (atual().tipo === "GIRAR" || atual().tipo === "MOVER") {
            lista.push(modificador());
        }
        return lista;
    }

    // modificador → GIRAR ABRE_PAR NUM FECHA_PAR
    //             | MOVER ABRE_PAR NUM VIRGULA NUM FECHA_PAR
    function modificador() {
        if (atual().tipo === "GIRAR") {
            esperar("GIRAR");
            const [angulo] = argumentos(1);
            return { tipo: "Rotacao", angulo };
        }
        esperar("MOVER");
        const [dx, dy] = argumentos(2);
        return { tipo: "Deslocamento", dx, dy };
    }

    return programa();                                       // símbolo inicial
}
