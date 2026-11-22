// Casos de teste oficiais: 5 programas válidos e 3 inválidos, cada um com o resultado esperado.
// Usados pela página (lista "Casos de teste") e por testes.js (node testes.js).
// O documento docs/casos-de-teste.md descreve os mesmos casos.

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
grupo mover(330, 60) {                                       // sol
    circulo(0, 0, 30) preenchimento: amarelo traco: laranja
    grupo girar(45) {
        reta(35, 0, 50, 0) traco: laranja espessura: 2       // um raio
    }
}`,
        esperado: {
            ast: {
                tipo: "Programa",
                tela: { tipo: "Tela", largura: 400, altura: 300 },
                itens: [
                    { tipo: "Retangulo", x: 0, y: 250, largura: 400, altura: 50,
                      estilo: estilo({ preenchimento: "verde" }) },
                    { tipo: "Retangulo", x: 100, y: 150, largura: 150, altura: 100,
                      estilo: estilo({ traco: "preto", preenchimento: "#F5DEB3", espessura: 2 }) },
                    { tipo: "Reta", x1: 100, y1: 150, x2: 175, y2: 90,
                      estilo: estilo({ traco: "#8B0000", espessura: 3 }) },
                    { tipo: "Reta", x1: 175, y1: 90, x2: 250, y2: 150,
                      estilo: estilo({ traco: "#8B0000", espessura: 3 }) },
                    { tipo: "Retangulo", x: 160, y: 200, largura: 30, altura: 50,
                      estilo: estilo({ preenchimento: "roxo" }) },
                    {
                        tipo: "Grupo",
                        modificadores: [{ tipo: "Deslocamento", dx: 330, dy: 60 }],
                        itens: [
                            { tipo: "Circulo", cx: 0, cy: 0, raio: 30,
                              estilo: estilo({ traco: "laranja", preenchimento: "amarelo" }) },
                            {
                                tipo: "Grupo",
                                modificadores: [{ tipo: "Rotacao", angulo: 45 }],
                                itens: [
                                    { tipo: "Reta", x1: 35, y1: 0, x2: 50, y2: 0,
                                      estilo: estilo({ traco: "laranja", espessura: 2 }) },
                                ],
                            },
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
                tela: { tipo: "Tela", largura: 400, altura: 300 },
                itens: [
                    { tipo: "Retangulo", x: 50, y: 150, largura: 200, altura: 60,
                      estilo: estilo({ preenchimento: "azul" }) },
                    {
                        tipo: "Grupo",
                        modificadores: [{ tipo: "Deslocamento", dx: 70, dy: 190 }],
                        itens: [
                            { tipo: "Circulo", cx: 0, cy: 0, raio: 25,
                              estilo: estilo({ preenchimento: "preto" }) },
                            {
                                tipo: "Grupo",
                                modificadores: [{ tipo: "Rotacao", angulo: 45 }],
                                itens: [
                                    { tipo: "Reta", x1: 0, y1: 0, x2: 20, y2: 0,
                                      estilo: estilo({ traco: "branco", espessura: 2 }) },
                                ],
                            },
                        ],
                    },
                    {
                        tipo: "Grupo",
                        modificadores: [{ tipo: "Deslocamento", dx: 200, dy: 190 }],
                        itens: [
                            { tipo: "Circulo", cx: 0, cy: 0, raio: 25,
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
                tela: { tipo: "Tela", largura: 300, altura: 200 },
                itens: [
                    { tipo: "Reta", x1: 0, y1: 0, x2: 300, y2: 200, estilo: estilo() },
                    { tipo: "Reta", x1: 0, y1: 200, x2: 300, y2: 0,
                      estilo: estilo({ traco: "#FF0000", espessura: 3 }) },
                    { tipo: "Circulo", cx: 150, cy: 100, raio: 40,
                      estilo: estilo({ traco: "preto", preenchimento: "amarelo", espessura: 0 }) },
                    { tipo: "Retangulo", x: 10, y: 10, largura: 80, altura: 50,
                      estilo: estilo({ traco: "cinza", preenchimento: "#00ff7f" }) },
                    { tipo: "Retangulo", x: 210, y: 140, largura: 80, altura: 50,
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
                tela: { tipo: "Tela", largura: 500, altura: 500 },
                itens: [
                    {
                        tipo: "Grupo",
                        modificadores: [],
                        itens: [
                            { tipo: "Grupo", modificadores: [], itens: [] },
                        ],
                    },
                    {
                        tipo: "Grupo",
                        modificadores: [
                            { tipo: "Deslocamento", dx: 250, dy: 250 },
                            { tipo: "Rotacao", angulo: 30 },
                        ],
                        itens: [
                            { tipo: "Retangulo", x: 0, y: 0, largura: 100, altura: 20,
                              estilo: estilo({ preenchimento: "vermelho" }) },
                            {
                                tipo: "Grupo",
                                modificadores: [
                                    { tipo: "Rotacao", angulo: 90 },
                                    { tipo: "Deslocamento", dx: 10, dy: 0 },
                                    { tipo: "Rotacao", angulo: 0 },
                                ],
                                itens: [
                                    {
                                        tipo: "Grupo",
                                        modificadores: [{ tipo: "Deslocamento", dx: 0, dy: 0 }],
                                        itens: [
                                            { tipo: "Circulo", cx: 0, cy: 0, raio: 5,
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
                tela: { tipo: "Tela", largura: 10, altura: 10 },
                itens: [
                    { tipo: "Reta", x1: 0, y1: 0, x2: 10, y2: 10, estilo: estilo() },
                    { tipo: "Reta", x1: 10, y1: 0, x2: 0, y2: 10, estilo: estilo() },
                    { tipo: "Circulo", cx: 5, cy: 5, raio: 5, estilo: estilo() },
                    { tipo: "Retangulo", x: 0, y: 0, largura: 10, altura: 10,
                      estilo: estilo({ traco: "rosa" }) },
                    { tipo: "Grupo", modificadores: [], itens: [] },
                    {
                        tipo: "Grupo",
                        modificadores: [{ tipo: "Rotacao", angulo: 0 }],
                        itens: [
                            { tipo: "Reta", x1: 0, y1: 0, x2: 0, y2: 0,
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
];
