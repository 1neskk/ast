// Casos de teste oficiais, cada um com o resultado esperado:
//   Fase 1: 5 programas válidos (V1 a V5) e 3 inválidos (I1 léxico, I2 e I3 sintáticos);
//   Fase 2: 3 programas com erros semânticos (S1 a S3), um para cada verificação.
// No fim do arquivo está o desenho final da Fase 2, que não tem resultado esperado escrito à mão.
// Usados pela página (lista "Casos de teste"), por testes.js (node testes.js) e por
// gerar-saidas.js, que grava o .svg e o .png de cada programa válido na pasta saidas/.
// Os documentos docs/casos-de-teste.md (Fase 1) e docs/testes-fase2.md descrevem os casos.

// Estilo de uma forma: atributos omitidos ficam null.
function estilo({ traco = null, preenchimento = null, espessura = null } = {}) {
    return { traco, preenchimento, espessura };
}

export const casos = [
    {
        id: "V1",
        nome: "Casa com sol",
        descricao: "Comentário antes da tela e no fim das linhas, as três formas, cores por nome e " +
                   "hexadecimais, os três atributos e um grupo dentro de outro.",
        programa:
`// Uma casa com sol
tela(400, 300)
retangulo(0, 250, 400, 50) preenchimento: verde              // gramado
retangulo(100, 150, 150, 100) preenchimento: #F5DEB3 traco: preto espessura: 2
reta(100, 150, 175, 90) traco: #8B0000 espessura: 3          // telhado
reta(175, 90, 250, 150) traco: #8B0000 espessura: 3
retangulo(160, 200, 30, 50) preenchimento: roxo              // porta
grupo mover(330, 60) {
    circulo(0, 0, 26) preenchimento: amarelo traco: laranja espessura: 3
    grupo girar(0)   { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(45)  { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(90)  { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(135) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(180) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(225) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(270) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(315) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
}`,
        esperado: {
            ast: {
                tipo: "Programa",
                tela: { tipo: "Tela", linha: 2, largura: 400, altura: 300 },
                itens: [
                    { tipo: "Retangulo", linha: 3, x: 0, y: 250, largura: 400, altura: 50,
                      estilo: estilo({ preenchimento: "verde" }) },
                    { tipo: "Retangulo", linha: 4, x: 100, y: 150, largura: 150, altura: 100,
                      estilo: estilo({ traco: "preto", preenchimento: "#F5DEB3", espessura: 2 }) },
                    { tipo: "Reta", linha: 5, x1: 100, y1: 150, x2: 175, y2: 90,
                      estilo: estilo({ traco: "#8B0000", espessura: 3 }) },
                    { tipo: "Reta", linha: 6, x1: 175, y1: 90, x2: 250, y2: 150,
                      estilo: estilo({ traco: "#8B0000", espessura: 3 }) },
                    { tipo: "Retangulo", linha: 7, x: 160, y: 200, largura: 30, altura: 50,
                      estilo: estilo({ preenchimento: "roxo" }) },
                    {
                        tipo: "Grupo", linha: 8,
                        modificadores: [{ tipo: "Deslocamento", linha: 8, dx: 330, dy: 60 }],
                        itens: [
                            { tipo: "Circulo", linha: 9, cx: 0, cy: 0, raio: 26,
                              estilo: estilo({ traco: "laranja", preenchimento: "amarelo", espessura: 3 }) },
                            { tipo: "Grupo", linha: 10, modificadores: [{ tipo: "Rotacao", linha: 10, angulo: 0 }],
                              itens: [{ tipo: "Reta", linha: 10, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 11, modificadores: [{ tipo: "Rotacao", linha: 11, angulo: 45 }],
                              itens: [{ tipo: "Reta", linha: 11, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 12, modificadores: [{ tipo: "Rotacao", linha: 12, angulo: 90 }],
                              itens: [{ tipo: "Reta", linha: 12, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 13, modificadores: [{ tipo: "Rotacao", linha: 13, angulo: 135 }],
                              itens: [{ tipo: "Reta", linha: 13, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 14, modificadores: [{ tipo: "Rotacao", linha: 14, angulo: 180 }],
                              itens: [{ tipo: "Reta", linha: 14, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 15, modificadores: [{ tipo: "Rotacao", linha: 15, angulo: 225 }],
                              itens: [{ tipo: "Reta", linha: 15, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 16, modificadores: [{ tipo: "Rotacao", linha: 16, angulo: 270 }],
                              itens: [{ tipo: "Reta", linha: 16, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                            { tipo: "Grupo", linha: 17, modificadores: [{ tipo: "Rotacao", linha: 17, angulo: 315 }],
                              itens: [{ tipo: "Reta", linha: 17, x1: 34, y1: 0, x2: 48, y2: 0,
                                        estilo: estilo({ traco: "laranja", espessura: 3 }) }] },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: "V2",
        nome: "Carro",
        descricao: "O exemplo do enunciado escrito nesta linguagem: dois grupos deslocados (rodas), " +
                   "o primeiro com um grupo girado dentro.",
        programa:
`tela(400, 300)
// um carro simples
retangulo(50, 150, 200, 60) preenchimento: azul
grupo mover(70, 190) {
    circulo(0, 0, 25) preenchimento: preto
    grupo girar(45) {
        reta(0, 0, 20, 0) traco: branco espessura: 2
    }
}
grupo mover(200, 190) {
    circulo(0, 0, 25) preenchimento: preto
}`,
        esperado: {
            ast: {
                tipo: "Programa",
                tela: { tipo: "Tela", linha: 1, largura: 400, altura: 300 },
                itens: [
                    { tipo: "Retangulo", linha: 3, x: 50, y: 150, largura: 200, altura: 60,
                      estilo: estilo({ preenchimento: "azul" }) },
                    {
                        tipo: "Grupo", linha: 4,
                        modificadores: [{ tipo: "Deslocamento", linha: 4, dx: 70, dy: 190 }],
                        itens: [
                            { tipo: "Circulo", linha: 5, cx: 0, cy: 0, raio: 25,
                              estilo: estilo({ preenchimento: "preto" }) },
                            {
                                tipo: "Grupo", linha: 6,
                                modificadores: [{ tipo: "Rotacao", linha: 6, angulo: 45 }],
                                itens: [
                                    { tipo: "Reta", linha: 7, x1: 0, y1: 0, x2: 20, y2: 0,
                                      estilo: estilo({ traco: "branco", espessura: 2 }) },
                                ],
                            },
                        ],
                    },
                    {
                        tipo: "Grupo", linha: 10,
                        modificadores: [{ tipo: "Deslocamento", linha: 10, dx: 200, dy: 190 }],
                        itens: [
                            { tipo: "Circulo", linha: 11, cx: 0, cy: 0, raio: 25,
                              estilo: estilo({ preenchimento: "preto" }) },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: "V3",
        nome: "Formas e estilos",
        descricao: "Formas sem estilo, atributos em ordens diferentes, hexadecimal em maiúsculas, " +
                   "minúsculas e misto, e o número 0 em coordenadas e na espessura.",
        programa:
`// as três formas, sem estilo e com estilo em ordens diferentes
tela(300, 200)
reta(0, 0, 300, 200)
reta(0, 200, 300, 0) espessura: 3 traco: #FF0000
circulo(150, 100, 40) traco: preto preenchimento: amarelo espessura: 0
retangulo(10, 10, 80, 50) preenchimento: #00ff7f traco: cinza
retangulo(210, 140, 80, 50) espessura: 5 preenchimento: azul traco: #1a2B3c`,
        esperado: {
            ast: {
                tipo: "Programa",
                tela: { tipo: "Tela", linha: 2, largura: 300, altura: 200 },
                itens: [
                    { tipo: "Reta", linha: 3, x1: 0, y1: 0, x2: 300, y2: 200, estilo: estilo() },
                    { tipo: "Reta", linha: 4, x1: 0, y1: 200, x2: 300, y2: 0,
                      estilo: estilo({ traco: "#FF0000", espessura: 3 }) },
                    { tipo: "Circulo", linha: 5, cx: 150, cy: 100, raio: 40,
                      estilo: estilo({ traco: "preto", preenchimento: "amarelo", espessura: 0 }) },
                    { tipo: "Retangulo", linha: 6, x: 10, y: 10, largura: 80, altura: 50,
                      estilo: estilo({ traco: "cinza", preenchimento: "#00ff7f" }) },
                    { tipo: "Retangulo", linha: 7, x: 210, y: 140, largura: 80, altura: 50,
                      estilo: estilo({ traco: "#1a2B3c", preenchimento: "azul", espessura: 5 }) },
                ],
            },
        },
    },
    {
        id: "V4",
        nome: "Grupos e modificadores",
        descricao: "Grupo sem modificadores, grupo vazio, três níveis de aninhamento e modificadores " +
                   "repetidos e misturados, que ficam na AST na ordem em que foram escritos.",
        programa:
`// grupos aninhados, grupo vazio e modificadores na ordem escrita
tela(500, 500)
grupo {
    grupo { }
}
grupo mover(250, 250) girar(30) {
    retangulo(0, 0, 100, 20) preenchimento: vermelho
    grupo girar(90) mover(10, 0) girar(0) {
        grupo mover(0, 0) {
            circulo(0, 0, 5) preenchimento: verde
        }
    }
}`,
        esperado: {
            ast: {
                tipo: "Programa",
                tela: { tipo: "Tela", linha: 2, largura: 500, altura: 500 },
                itens: [
                    {
                        tipo: "Grupo", linha: 3,
                        modificadores: [],
                        itens: [
                            { tipo: "Grupo", linha: 4, modificadores: [], itens: [] },
                        ],
                    },
                    {
                        tipo: "Grupo", linha: 6,
                        modificadores: [
                            { tipo: "Deslocamento", linha: 6, dx: 250, dy: 250 },
                            { tipo: "Rotacao", linha: 6, angulo: 30 },
                        ],
                        itens: [
                            { tipo: "Retangulo", linha: 7, x: 0, y: 0, largura: 100, altura: 20,
                              estilo: estilo({ preenchimento: "vermelho" }) },
                            {
                                tipo: "Grupo", linha: 8,
                                modificadores: [
                                    { tipo: "Rotacao", linha: 8, angulo: 90 },
                                    { tipo: "Deslocamento", linha: 8, dx: 10, dy: 0 },
                                    { tipo: "Rotacao", linha: 8, angulo: 0 },
                                ],
                                itens: [
                                    {
                                        tipo: "Grupo", linha: 9,
                                        modificadores: [{ tipo: "Deslocamento", linha: 9, dx: 0, dy: 0 }],
                                        itens: [
                                            { tipo: "Circulo", linha: 10, cx: 0, cy: 0, raio: 5,
                                              estilo: estilo({ preenchimento: "verde" }) },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: "V5",
        nome: "Formato livre",
        descricao: "Espaços são opcionais entre tokens: comandos colados na mesma linha, comentário " +
                   "colado no código, tabulações, linhas em branco e espaços dentro dos parênteses.",
        programa:
`tela(10,10)// sem espaços, comentário colado
reta(0,0,10,10)reta(10,0,0,10) circulo(5,5,5)
\t\tretangulo  (  0 ,  0 , 10 , 10  )   traco:rosa


grupo{}grupo girar(0){reta(0,0,0,0)traco:branco}`,
        esperado: {
            ast: {
                tipo: "Programa",
                tela: { tipo: "Tela", linha: 1, largura: 10, altura: 10 },
                itens: [
                    { tipo: "Reta", linha: 2, x1: 0, y1: 0, x2: 10, y2: 10, estilo: estilo() },
                    { tipo: "Reta", linha: 2, x1: 10, y1: 0, x2: 0, y2: 10, estilo: estilo() },
                    { tipo: "Circulo", linha: 2, cx: 5, cy: 5, raio: 5, estilo: estilo() },
                    { tipo: "Retangulo", linha: 3, x: 0, y: 0, largura: 10, altura: 10,
                      estilo: estilo({ traco: "rosa" }) },
                    { tipo: "Grupo", linha: 6, modificadores: [], itens: [] },
                    {
                        tipo: "Grupo", linha: 6,
                        modificadores: [{ tipo: "Rotacao", linha: 6, angulo: 0 }],
                        itens: [
                            { tipo: "Reta", linha: 6, x1: 0, y1: 0, x2: 0, y2: 0,
                              estilo: estilo({ traco: "branco" }) },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: "I1",
        nome: "Erro léxico",
        descricao: "Zero à esquerda, palavra-chave com sufixo (retangulos) e cor hexadecimal com " +
                   "dígito inválido. O lexer relata os três erros e a análise sintática não roda.",
        programa:
`tela(400, 300)
circulo(05, 50, 20) preenchimento: azul
retangulos(0, 0, 10, 10)
reta(0, 0, 10, 10) traco: #12345G`,
        esperado: {
            errosLexicos: [
                { linha: 2, trecho: "05" },
                { linha: 3, trecho: "retangulos" },
                { linha: 4, trecho: "#12345G" },
            ],
        },
    },
    {
        id: "I2",
        nome: "Erro sintático: argumento faltando",
        descricao: "Uma reta com só três números. Depois do terceiro número o parser espera a vírgula " +
                   "do quarto argumento e encontra o fecha-parênteses.",
        programa:
`tela(200, 200)
grupo mover(10, 10) {
    reta(0, 0, 50) traco: azul
}`,
        esperado: {
            erroSintatico: { linha: 3, esperado: '","', encontrado: '")"' },
        },
    },
    {
        id: "I3",
        nome: "Erro sintático: atributo repetido",
        descricao: "O círculo usa traco duas vezes. Depois de traco e preenchimento, só espessura, " +
                   "uma nova forma, um grupo ou o fim do programa podem vir.",
        programa:
`tela(200, 200)
circulo(100, 100, 50) traco: preto preenchimento: branco traco: vermelho`,
        esperado: {
            erroSintatico: {
                linha: 2,
                esperado: '"espessura", "reta", "circulo", "retangulo", "grupo" ou o fim do programa',
                encontrado: '"traco" (atributo repetido nesta forma)',
            },
        },
    },
    {
        id: "S1",
        nome: "Erro semântico: tela sem altura",
        descricao: "A tela tem altura 0. O programa passa pelo léxico e pelo parser (a gramática " +
                   "aceita o zero), mas a verificação semântica o rejeita e o SVG não é gerado.",
        programa:
`// um sol numa tela sem altura
tela(400, 0)
grupo mover(200, 150) {
    circulo(0, 0, 50) preenchimento: amarelo traco: laranja
}`,
        esperado: {
            errosSemanticos: [
                { linha: 2, mensagem: "a tela precisa ter largura e altura maiores que zero, mas a altura é 0" },
            ],
        },
    },
    {
        id: "S2",
        nome: "Erro semântico: círculo de raio zero",
        descricao: "Um círculo de raio 0 dentro de três grupos aninhados. A verificação percorre a " +
                   "AST inteira e acha o erro lá dentro, com a linha do círculo.",
        programa:
`tela(300, 200)
// a roda pequena não tem raio
grupo mover(150, 100) {
    circulo(0, 0, 40) preenchimento: cinza
    grupo girar(45) {
        grupo mover(60, 0) {
            circulo(0, 0, 0) preenchimento: preto
        }
    }
}`,
        esperado: {
            errosSemanticos: [
                { linha: 7, mensagem: "o círculo precisa ter raio maior que zero" },
            ],
        },
    },
    {
        id: "S3",
        nome: "Erro semântico: retângulos sem tamanho",
        descricao: "Três retângulos com largura ou altura 0, um fora e dois dentro de um grupo. " +
                   "A verificação relata todos os erros de uma vez, na ordem do programa.",
        programa:
`tela(300, 200)
retangulo(10, 10, 0, 50) preenchimento: azul
circulo(150, 100, 30)
grupo mover(100, 100) {
    retangulo(0, 0, 80, 0) traco: vermelho
    retangulo(0, 20, 0, 0)
}`,
        esperado: {
            errosSemanticos: [
                { linha: 2, mensagem: "o retângulo precisa ter largura e altura maiores que zero, mas a largura é 0" },
                { linha: 5, mensagem: "o retângulo precisa ter largura e altura maiores que zero, mas a altura é 0" },
                { linha: 6, mensagem: "o retângulo precisa ter largura e altura maiores que zero, mas a largura e a altura são 0" },
            ],
        },
    },
];

// Desenho final da Fase 2 (entregável 5.5): usa as três formas e grupos aninhados com os dois
// modificadores. O resultado é conferido pelo arquivo saidas/F1-moinho-de-vento.svg.
export const desenhoFinal = {
    id: "F1",
    nome: "Moinho de vento",
    descricao: "Desenho final: um moinho num campo, com sol, nuvens, pássaros e flores. A hélice é " +
               "um grupo deslocado e girado com quatro pás, cada uma num grupo girado; o telhado " +
               "é um quadrado girado 45 graus, com a metade de baixo escondida atrás da torre.",
    programa:
`// Desenho final: um moinho de vento num campo
tela(500, 400)

// céu, colina e chão (espessura 0: sem contorno)
retangulo(0, 0, 500, 400) preenchimento: #BFE6FF espessura: 0
circulo(110, 540, 280) preenchimento: #7CC46A espessura: 0
retangulo(0, 318, 500, 82) preenchimento: #5DA84B espessura: 0

// sol: um círculo e oito raios, cada raio num grupo girado
grupo mover(432, 68) {
    circulo(0, 0, 26) preenchimento: amarelo traco: laranja espessura: 3
    grupo girar(0)   { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(45)  { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(90)  { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(135) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(180) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(225) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(270) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
    grupo girar(315) { reta(34, 0, 48, 0) traco: laranja espessura: 3 }
}

// nuvens: três círculos e um retângulo que deixa a base reta
grupo mover(60, 52) {
    circulo(0, 20, 18) preenchimento: branco espessura: 0
    circulo(26, 8, 24) preenchimento: branco espessura: 0
    circulo(54, 20, 18) preenchimento: branco espessura: 0
    retangulo(0, 20, 54, 18) preenchimento: branco espessura: 0
}
grupo mover(330, 130) {
    circulo(0, 14, 13) preenchimento: branco espessura: 0
    circulo(18, 6, 17) preenchimento: branco espessura: 0
    circulo(38, 14, 13) preenchimento: branco espessura: 0
    retangulo(0, 14, 38, 13) preenchimento: branco espessura: 0
}

// pássaros: duas retas em V
grupo mover(150, 60) {
    reta(0, 0, 8, 5) espessura: 2
    reta(8, 5, 16, 0) espessura: 2
}
grupo mover(178, 82) {
    reta(0, 0, 6, 4) espessura: 2
    reta(6, 4, 12, 0) espessura: 2
}

// moinho: o telhado é um quadrado girado 45 graus; a torre, desenhada depois, cobre a metade de baixo
grupo mover(250, 128) girar(45) {
    retangulo(0, 0, 58, 58) preenchimento: #A0522D traco: #5C2E12 espessura: 2
}
retangulo(214, 168, 72, 156) preenchimento: #EAD7B5 traco: #6B4F2A espessura: 2
retangulo(238, 282, 24, 42) preenchimento: #7A5533 traco: #4A3520 espessura: 2
circulo(250, 232, 11) preenchimento: #FFF5CC traco: #6B4F2A espessura: 2
reta(239, 232, 261, 232) traco: #6B4F2A espessura: 2
reta(250, 221, 250, 243) traco: #6B4F2A espessura: 2

// hélice: quatro pás iguais, cada uma num grupo girado dentro do grupo da hélice
grupo mover(250, 168) girar(20) {
    grupo girar(0) {
        reta(0, 0, 124, 0) traco: #4A3520 espessura: 4
        retangulo(32, 0, 90, 22) preenchimento: branco traco: #4A3520 espessura: 2
        reta(62, 0, 62, 22) traco: #4A3520
        reta(92, 0, 92, 22) traco: #4A3520
    }
    grupo girar(90) {
        reta(0, 0, 124, 0) traco: #4A3520 espessura: 4
        retangulo(32, 0, 90, 22) preenchimento: branco traco: #4A3520 espessura: 2
        reta(62, 0, 62, 22) traco: #4A3520
        reta(92, 0, 92, 22) traco: #4A3520
    }
    grupo girar(180) {
        reta(0, 0, 124, 0) traco: #4A3520 espessura: 4
        retangulo(32, 0, 90, 22) preenchimento: branco traco: #4A3520 espessura: 2
        reta(62, 0, 62, 22) traco: #4A3520
        reta(92, 0, 92, 22) traco: #4A3520
    }
    grupo girar(270) {
        reta(0, 0, 124, 0) traco: #4A3520 espessura: 4
        retangulo(32, 0, 90, 22) preenchimento: branco traco: #4A3520 espessura: 2
        reta(62, 0, 62, 22) traco: #4A3520
        reta(92, 0, 92, 22) traco: #4A3520
    }
    circulo(0, 0, 10) preenchimento: #4A3520 traco: #2E2114 espessura: 2
}

// flores: um caule e uma flor, cada flor num grupo deslocado
grupo mover(60, 352) {
    reta(0, 0, 0, 22) traco: verde espessura: 2
    circulo(0, 0, 6) preenchimento: vermelho traco: #8B0000
}
grupo mover(104, 366) {
    reta(0, 0, 0, 22) traco: verde espessura: 2
    circulo(0, 0, 6) preenchimento: rosa traco: roxo
}
grupo mover(384, 350) {
    reta(0, 0, 0, 22) traco: verde espessura: 2
    circulo(0, 0, 6) preenchimento: amarelo traco: laranja
}
grupo mover(436, 368) {
    reta(0, 0, 0, 22) traco: verde espessura: 2
    circulo(0, 0, 6) preenchimento: vermelho traco: #8B0000
}`,
};

// Nome dos arquivos de um caso na pasta saidas/, sem a extensão: "V1-casa-com-sol".
export function nomeDeArquivo(caso) {
    const nome = caso.nome.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return caso.id + "-" + nome;
}
