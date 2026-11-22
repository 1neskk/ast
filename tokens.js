// Regras léxicas da Linguagem de Desenho.
//
// Cada regra tem um tipo de token e uma expressão regular com a flag "y" (sticky):
// o lexer posiciona lastIndex e a regra só casa exatamente naquela posição.
// As regras são testadas na ordem da lista e a primeira que casar vence.
//
// O sufixo (?![\p{L}\p{N}_]) aparece nas palavras-chave, nas cores e nos números.
// Ele exige que o próximo caractere NÃO seja letra (inclusive acentuada), dígito ou "_",
// ou seja, que a palavra termine ali. Sem ele:
//   "reta"  casaria com o começo de "retangulo" e de "retas";
//   "0"     casaria com o começo de "05";
//   "azul"  casaria com o começo de "azulado".
// A flag "u" é necessária para usar \p{L} (qualquer letra Unicode) e \p{N} (qualquer dígito).

export const regras = [
    // ignorados
    { tipo: "ESPACO",        padrao: /\s+/y,          ignorar: true },
    { tipo: "COMENTARIO",    padrao: /\/\/[^\n]*/y,   ignorar: true },

    // palavras-chave: declaração da tela e formas
    { tipo: "TELA",          padrao: /tela(?![\p{L}\p{N}_])/yu },
    { tipo: "RETA",          padrao: /reta(?![\p{L}\p{N}_])/yu },
    { tipo: "CIRCULO",       padrao: /circulo(?![\p{L}\p{N}_])/yu },
    { tipo: "RETANGULO",     padrao: /retangulo(?![\p{L}\p{N}_])/yu },
    { tipo: "GRUPO",         padrao: /grupo(?![\p{L}\p{N}_])/yu },

    // palavras-chave: atributos de estilo (só para formas)
    { tipo: "TRACO",         padrao: /traco(?![\p{L}\p{N}_])/yu },
    { tipo: "PREENCHIMENTO", padrao: /preenchimento(?![\p{L}\p{N}_])/yu },
    { tipo: "ESPESSURA",     padrao: /espessura(?![\p{L}\p{N}_])/yu },

    // palavras-chave: modificadores (só para grupos)
    { tipo: "GIRAR",         padrao: /girar(?![\p{L}\p{N}_])/yu },
    { tipo: "MOVER",         padrao: /mover(?![\p{L}\p{N}_])/yu },

    // valores
    {
        tipo: "COR_NOME",
        padrao: /(?:vermelho|verde|azul|amarelo|laranja|roxo|rosa|preto|branco|cinza)(?![\p{L}\p{N}_])/yu
    },
    { tipo: "COR_HEX",       padrao: /#[0-9A-Fa-f]{6}(?![\p{L}\p{N}_])/yu },
    { tipo: "NUM",           padrao: /(?:0|[1-9][0-9]*)(?![\p{L}\p{N}_])/yu },

    // pontuação e delimitadores
    { tipo: "ABRE_PAR",      padrao: /\(/y },
    { tipo: "FECHA_PAR",     padrao: /\)/y },
    { tipo: "VIRGULA",       padrao: /,/y },
    { tipo: "DOIS_PONTOS",   padrao: /:/y },
    { tipo: "ABRE_CHAVE",    padrao: /\{/y },
    { tipo: "FECHA_CHAVE",   padrao: /\}/y },
];

// Como cada tipo de token aparece nas mensagens de erro ("esperado ...").
export const descricoes = {
    TELA: '"tela"',
    RETA: '"reta"',
    CIRCULO: '"circulo"',
    RETANGULO: '"retangulo"',
    GRUPO: '"grupo"',
    TRACO: '"traco"',
    PREENCHIMENTO: '"preenchimento"',
    ESPESSURA: '"espessura"',
    GIRAR: '"girar"',
    MOVER: '"mover"',
    COR_NOME: "nome de cor",
    COR_HEX: "cor #RRGGBB",
    NUM: "número",
    ABRE_PAR: '"("',
    FECHA_PAR: '")"',
    VIRGULA: '","',
    DOIS_PONTOS: '":"',
    ABRE_CHAVE: '"{"',
    FECHA_CHAVE: '"}"',
    EOF: "o fim do programa",
};
