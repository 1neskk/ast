# Casos de teste

Linguagem de Desenho, Fase 1. Cinco programas válidos e três inválidos (um com erro léxico e dois com erros sintáticos diferentes), cada um com o resultado esperado.

> **Fase 2.** As ASTs abaixo estão como na Fase 1. Desde a Fase 2, todo nó, menos o `Programa`, também guarda o campo `linha` (veja as ASTs completas em `casos.js`). O SVG e a imagem de cada programa válido, os casos com erro semântico e o desenho final estão em [`testes-fase2.md`](testes-fase2.md).

Os mesmos casos estão em `casos.js`. Para conferir:

- **Na página de teste**: escolha o caso na lista "Carregar caso de teste". A página analisa o programa e diz se o resultado confere com o esperado.
- **No terminal**: `node testes.js` roda os 8 casos e mais casos extras (zeros à esquerda, palavras-chave com sufixo, grupo sem fechar etc.).

## Resumo

| Caso | Nome | Resultado esperado |
|---|---|---|
| V1 | Casa com sol | Válido: gera a AST |
| V2 | Carro | Válido: gera a AST |
| V3 | Formas e estilos | Válido: gera a AST |
| V4 | Grupos e modificadores | Válido: gera a AST |
| V5 | Formato livre | Válido: gera a AST |
| I1 | Erro léxico | 3 erros léxicos (linhas 2, 3, 4); sem análise sintática |
| I2 | Erro sintático: argumento faltando | Erro sintático na linha 3 |
| I3 | Erro sintático: atributo repetido | Erro sintático na linha 2 |

## Cobertura dos elementos pelos casos válidos

Os cinco válidos, juntos, usam todos os elementos da linguagem.

| Elemento | V1 | V2 | V3 | V4 | V5 |
|---|:-:|:-:|:-:|:-:|:-:|
| Tela | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reta | ✓ | ✓ | ✓ |  | ✓ |
| Círculo | ✓ | ✓ | ✓ | ✓ | ✓ |
| Retângulo | ✓ | ✓ | ✓ | ✓ | ✓ |
| Traço | ✓ | ✓ | ✓ |  | ✓ |
| Preench. | ✓ | ✓ | ✓ | ✓ |  |
| Espessura | ✓ | ✓ | ✓ |  |  |
| Grupo | ✓ | ✓ |  | ✓ | ✓ |
| Grupo aninhado | ✓ | ✓ |  | ✓ |  |
| Grupo vazio |  |  |  | ✓ | ✓ |
| Girar | ✓ | ✓ |  | ✓ | ✓ |
| Mover | ✓ | ✓ |  | ✓ |  |
| Comentário | ✓ | ✓ | ✓ | ✓ | ✓ |
| Número 0 | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cor nome | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cor hex | ✓ |  | ✓ |  |  |

## V1: Casa com sol

Comentário antes da tela e no fim das linhas, as três formas, cores por nome e hexadecimais, os três atributos e um grupo dentro de outro.

```
// Uma casa com sol
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
}
```

**Resultado esperado:** programa válido. AST:

```json
{
  "tipo": "Programa",
  "tela": { "tipo": "Tela", "largura": 400, "altura": 300 },
  "itens": [
    {
      "tipo": "Retangulo", "x": 0, "y": 250, "largura": 400, "altura": 50,
      "estilo": { "traco": null, "preenchimento": "verde", "espessura": null }
    },
    {
      "tipo": "Retangulo", "x": 100, "y": 150, "largura": 150, "altura": 100,
      "estilo": { "traco": "preto", "preenchimento": "#F5DEB3", "espessura": 2 }
    },
    {
      "tipo": "Reta", "x1": 100, "y1": 150, "x2": 175, "y2": 90,
      "estilo": { "traco": "#8B0000", "preenchimento": null, "espessura": 3 }
    },
    {
      "tipo": "Reta", "x1": 175, "y1": 90, "x2": 250, "y2": 150,
      "estilo": { "traco": "#8B0000", "preenchimento": null, "espessura": 3 }
    },
    {
      "tipo": "Retangulo", "x": 160, "y": 200, "largura": 30, "altura": 50,
      "estilo": { "traco": null, "preenchimento": "roxo", "espessura": null }
    },
    {
      "tipo": "Grupo",
      "modificadores": [ { "tipo": "Deslocamento", "dx": 330, "dy": 60 } ],
      "itens": [
        {
          "tipo": "Circulo", "cx": 0, "cy": 0, "raio": 30,
          "estilo": { "traco": "laranja", "preenchimento": "amarelo", "espessura": null }
        },
        {
          "tipo": "Grupo",
          "modificadores": [ { "tipo": "Rotacao", "angulo": 45 } ],
          "itens": [
            {
              "tipo": "Reta", "x1": 35, "y1": 0, "x2": 50, "y2": 0,
              "estilo": { "traco": "laranja", "preenchimento": null, "espessura": 2 }
            }
          ]
        }
      ]
    }
  ]
}
```

## V2: Carro

O exemplo do enunciado escrito nesta linguagem: dois grupos deslocados (rodas), o primeiro com um grupo girado dentro.

```
tela(400, 300)
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
}
```

**Resultado esperado:** programa válido. AST:

```json
{
  "tipo": "Programa",
  "tela": { "tipo": "Tela", "largura": 400, "altura": 300 },
  "itens": [
    {
      "tipo": "Retangulo", "x": 50, "y": 150, "largura": 200, "altura": 60,
      "estilo": { "traco": null, "preenchimento": "azul", "espessura": null }
    },
    {
      "tipo": "Grupo",
      "modificadores": [ { "tipo": "Deslocamento", "dx": 70, "dy": 190 } ],
      "itens": [
        {
          "tipo": "Circulo", "cx": 0, "cy": 0, "raio": 25,
          "estilo": { "traco": null, "preenchimento": "preto", "espessura": null }
        },
        {
          "tipo": "Grupo",
          "modificadores": [ { "tipo": "Rotacao", "angulo": 45 } ],
          "itens": [
            {
              "tipo": "Reta", "x1": 0, "y1": 0, "x2": 20, "y2": 0,
              "estilo": { "traco": "branco", "preenchimento": null, "espessura": 2 }
            }
          ]
        }
      ]
    },
    {
      "tipo": "Grupo",
      "modificadores": [ { "tipo": "Deslocamento", "dx": 200, "dy": 190 } ],
      "itens": [
        {
          "tipo": "Circulo", "cx": 0, "cy": 0, "raio": 25,
          "estilo": { "traco": null, "preenchimento": "preto", "espessura": null }
        }
      ]
    }
  ]
}
```

## V3: Formas e estilos

Formas sem estilo, atributos em ordens diferentes, hexadecimal em maiúsculas, minúsculas e misto, e o número 0 em coordenadas e na espessura.

```
// as três formas, sem estilo e com estilo em ordens diferentes
tela(300, 200)
reta(0, 0, 300, 200)
reta(0, 200, 300, 0) espessura: 3 traco: #FF0000
circulo(150, 100, 40) traco: preto preenchimento: amarelo espessura: 0
retangulo(10, 10, 80, 50) preenchimento: #00ff7f traco: cinza
retangulo(210, 140, 80, 50) espessura: 5 preenchimento: azul traco: #1a2B3c
```

**Resultado esperado:** programa válido. AST:

```json
{
  "tipo": "Programa",
  "tela": { "tipo": "Tela", "largura": 300, "altura": 200 },
  "itens": [
    {
      "tipo": "Reta", "x1": 0, "y1": 0, "x2": 300, "y2": 200,
      "estilo": { "traco": null, "preenchimento": null, "espessura": null }
    },
    {
      "tipo": "Reta", "x1": 0, "y1": 200, "x2": 300, "y2": 0,
      "estilo": { "traco": "#FF0000", "preenchimento": null, "espessura": 3 }
    },
    {
      "tipo": "Circulo", "cx": 150, "cy": 100, "raio": 40,
      "estilo": { "traco": "preto", "preenchimento": "amarelo", "espessura": 0 }
    },
    {
      "tipo": "Retangulo", "x": 10, "y": 10, "largura": 80, "altura": 50,
      "estilo": { "traco": "cinza", "preenchimento": "#00ff7f", "espessura": null }
    },
    {
      "tipo": "Retangulo", "x": 210, "y": 140, "largura": 80, "altura": 50,
      "estilo": { "traco": "#1a2B3c", "preenchimento": "azul", "espessura": 5 }
    }
  ]
}
```

## V4: Grupos e modificadores

Grupo sem modificadores, grupo vazio, três níveis de aninhamento e modificadores repetidos e misturados, que ficam na AST na ordem em que foram escritos.

```
// grupos aninhados, grupo vazio e modificadores na ordem escrita
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
}
```

**Resultado esperado:** programa válido. AST:

```json
{
  "tipo": "Programa",
  "tela": { "tipo": "Tela", "largura": 500, "altura": 500 },
  "itens": [
    {
      "tipo": "Grupo",
      "modificadores": [],
      "itens": [ { "tipo": "Grupo", "modificadores": [], "itens": [] } ]
    },
    {
      "tipo": "Grupo",
      "modificadores": [
        { "tipo": "Deslocamento", "dx": 250, "dy": 250 },
        { "tipo": "Rotacao", "angulo": 30 }
      ],
      "itens": [
        {
          "tipo": "Retangulo", "x": 0, "y": 0, "largura": 100, "altura": 20,
          "estilo": { "traco": null, "preenchimento": "vermelho", "espessura": null }
        },
        {
          "tipo": "Grupo",
          "modificadores": [
            { "tipo": "Rotacao", "angulo": 90 },
            { "tipo": "Deslocamento", "dx": 10, "dy": 0 },
            { "tipo": "Rotacao", "angulo": 0 }
          ],
          "itens": [
            {
              "tipo": "Grupo",
              "modificadores": [ { "tipo": "Deslocamento", "dx": 0, "dy": 0 } ],
              "itens": [
                {
                  "tipo": "Circulo", "cx": 0, "cy": 0, "raio": 5,
                  "estilo": { "traco": null, "preenchimento": "verde", "espessura": null }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## V5: Formato livre

Espaços são opcionais entre tokens: comandos colados na mesma linha, comentário colado no código, tabulações, linhas em branco e espaços dentro dos parênteses.

```
tela(10,10)// sem espaços, comentário colado
reta(0,0,10,10)reta(10,0,0,10) circulo(5,5,5)
		retangulo  (  0 ,  0 , 10 , 10  )   traco:rosa


grupo{}grupo girar(0){reta(0,0,0,0)traco:branco}
```

**Resultado esperado:** programa válido. AST:

```json
{
  "tipo": "Programa",
  "tela": { "tipo": "Tela", "largura": 10, "altura": 10 },
  "itens": [
    {
      "tipo": "Reta", "x1": 0, "y1": 0, "x2": 10, "y2": 10,
      "estilo": { "traco": null, "preenchimento": null, "espessura": null }
    },
    {
      "tipo": "Reta", "x1": 10, "y1": 0, "x2": 0, "y2": 10,
      "estilo": { "traco": null, "preenchimento": null, "espessura": null }
    },
    {
      "tipo": "Circulo", "cx": 5, "cy": 5, "raio": 5,
      "estilo": { "traco": null, "preenchimento": null, "espessura": null }
    },
    {
      "tipo": "Retangulo", "x": 0, "y": 0, "largura": 10, "altura": 10,
      "estilo": { "traco": "rosa", "preenchimento": null, "espessura": null }
    },
    { "tipo": "Grupo", "modificadores": [], "itens": [] },
    {
      "tipo": "Grupo",
      "modificadores": [ { "tipo": "Rotacao", "angulo": 0 } ],
      "itens": [
        {
          "tipo": "Reta", "x1": 0, "y1": 0, "x2": 0, "y2": 0,
          "estilo": { "traco": "branco", "preenchimento": null, "espessura": null }
        }
      ]
    }
  ]
}
```

## I1: Erro léxico

Zero à esquerda, palavra-chave com sufixo (retangulos) e cor hexadecimal com dígito inválido. O lexer relata os três erros e a análise sintática não roda.

```
tela(400, 300)
circulo(05, 50, 20) preenchimento: azul
retangulos(0, 0, 10, 10)
reta(0, 0, 10, 10) traco: #12345G
```

**Resultado esperado:** erros léxicos (a análise sintática não roda, não há AST).

| Linha | Trecho inválido | Motivo |
|---|---|---|
| 2 | `05` | zero à esquerda |
| 3 | `retangulos` | palavra-chave seguida de mais letras não é palavra-chave |
| 4 | `#12345G` | G não é dígito hexadecimal |

## I2: Erro sintático: argumento faltando

Uma reta com só três números. Depois do terceiro número o parser espera a vírgula do quarto argumento e encontra o fecha-parênteses.

```
tela(200, 200)
grupo mover(10, 10) {
    reta(0, 0, 50) traco: azul
}
```

**Resultado esperado:** erro sintático (o parser para no primeiro erro, não há AST).

| Linha | Esperado | Encontrado |
|---|---|---|
| 3 | "," | ")" |

Mensagem:

```
Erro sintático na linha 3: esperado ",", encontrado ")"
```

## I3: Erro sintático: atributo repetido

O círculo usa traco duas vezes. Depois de traco e preenchimento, só espessura, uma nova forma, um grupo ou o fim do programa podem vir.

```
tela(200, 200)
circulo(100, 100, 50) traco: preto preenchimento: branco traco: vermelho
```

**Resultado esperado:** erro sintático (o parser para no primeiro erro, não há AST).

| Linha | Esperado | Encontrado |
|---|---|---|
| 2 | "espessura", "reta", "circulo", "retangulo", "grupo" ou o fim do programa | "traco" (atributo repetido nesta forma) |

Mensagem:

```
Erro sintático na linha 2: esperado "espessura", "reta", "circulo", "retangulo", "grupo" ou o fim do programa, encontrado "traco" (atributo repetido nesta forma)
```
