---
title: "Linguagem de Desenho: especificação da Fase 1"
subtitle: "Do texto à AST · Teoria da Computação e Compiladores"
author:
  - Gabriel Almeida Portela (825233281)
  - Daniel Almeida Portela
lang: pt-BR
---

# 1. Descrição da linguagem

A **Linguagem de Desenho** descreve um desenho como uma lista de comandos. Todo programa começa
declarando o tamanho da **tela** e, em seguida, lista **formas** (reta, círculo e retângulo) e
**grupos**. Um grupo reúne formas e outros grupos, pode ser aninhado em qualquer profundidade e
pode ter **modificadores** (girar e mover).

A sintaxe segue o estilo de **chamada de função**: os números de cada comando ficam entre
parênteses, separados por vírgulas, e os atributos de estilo são escritos como `nome: valor`
depois da forma. O corpo de um grupo fica entre chaves.

| Elemento | Forma geral | Observações |
|---|---|---|
| Tela | `tela(largura, altura)` | Obrigatória, a primeira e única. |
| Reta | `reta(x1, y1, x2, y2)` | Dois pontos: o início e o fim. |
| Círculo | `circulo(cx, cy, raio)` | Centro e raio. |
| Retângulo | `retangulo(x, y, largura, altura)` | (x, y) é o canto superior esquerdo, como no SVG. |
| Estilo | `traco: cor`, `preenchimento: cor`, `espessura: n` | Opcionais, só depois de uma forma, em qualquer ordem, no máximo uma vez cada. |
| Grupo | `grupo modificadores { itens }` | Reúne formas e grupos. Pode ser vazio. |
| Modificadores | `girar(ângulo)`, `mover(dx, dy)` | Opcionais, só em grupos, entre `grupo` e `{`. Podem se repetir; a ordem é preservada. |
| Comentário | `// texto` | Vai do `//` até o fim da linha e é ignorado pelo léxico. |
| Número | `0`, `7`, `250` | Inteiro sem sinal. O zero é aceito; zeros à esquerda não. |
| Cor | `azul`, `#1A2B3C` | Um de 10 nomes ou hexadecimal `#RRGGBB`. |

Os 10 nomes de cor são: `vermelho`, `verde`, `azul`, `amarelo`, `laranja`, `roxo`, `rosa`,
`preto`, `branco` e `cinza`.

## 1.1 Exemplo 1: carro

O exemplo do enunciado, escrito nesta linguagem. O corpo é um retângulo e cada roda é um grupo
deslocado; a primeira roda tem dentro um grupo girado com um raio.

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

## 1.2 Exemplo 2: casa com sol

Usa as três formas, cores por nome e em hexadecimal, os três atributos (em ordens diferentes),
comentários no fim das linhas e um grupo dentro de outro.

```
// Uma casa com sol
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
}
```

# 2. Definição léxica

O analisador léxico percorre o texto da esquerda para a direita. Em cada posição, testa as regras
**na ordem da tabela** e a primeira que casar exatamente naquela posição gera o token (as
expressões usam a flag `y`, *sticky*). Os tokens marcados como ignorados são consumidos, mas não
entram na lista de tokens.

As palavras-chave, os nomes de cor, as cores hexadecimais e os números terminam com
`(?![\p{L}\p{N}_])`: o caractere seguinte **não** pode ser letra (inclusive acentuada), dígito
ou `_`. Isso garante que uma regra só casa com a palavra inteira. Sem esse sufixo, `reta`
casaria com o começo de `retangulo` e de `retas`, `0` casaria com o começo de `05`, e `azul` com
o começo de `azulado`. As regras com `\p{...}` usam também a flag `u` (Unicode).

| Token | Expressão regular | Descrição | Ignorado |
|---|---|---|---|
| ESPACO | `\s+` | Espaços, tabulações e quebras de linha. | Sim |
| COMENTARIO | `//[^\n]*` | Comentário: de `//` até o fim da linha. | Sim |
| TELA | `tela(?![\p{L}\p{N}_])` | Palavra-chave da declaração da tela. | Não |
| RETA | `reta(?![\p{L}\p{N}_])` | Palavra-chave da reta. | Não |
| CIRCULO | `circulo(?![\p{L}\p{N}_])` | Palavra-chave do círculo. | Não |
| RETANGULO | `retangulo(?![\p{L}\p{N}_])` | Palavra-chave do retângulo. | Não |
| GRUPO | `grupo(?![\p{L}\p{N}_])` | Palavra-chave do grupo. | Não |
| TRACO | `traco(?![\p{L}\p{N}_])` | Atributo: cor do traço. | Não |
| PREENCHIMENTO | `preenchimento(?![\p{L}\p{N}_])` | Atributo: cor do preenchimento. | Não |
| ESPESSURA | `espessura(?![\p{L}\p{N}_])` | Atributo: espessura do traço. | Não |
| GIRAR | `girar(?![\p{L}\p{N}_])` | Modificador de grupo: rotação. | Não |
| MOVER | `mover(?![\p{L}\p{N}_])` | Modificador de grupo: deslocamento. | Não |
| COR_NOME | `(?:vermelho\|verde\|azul\|amarelo\|laranja\|roxo\|rosa\|preto\|branco\|cinza)(?![\p{L}\p{N}_])` | Cor pela lista fechada de 10 nomes. | Não |
| COR_HEX | `#[0-9A-Fa-f]{6}(?![\p{L}\p{N}_])` | Cor hexadecimal `#RRGGBB` (maiúsculas ou minúsculas). | Não |
| NUM | `(?:0\|[1-9][0-9]*)(?![\p{L}\p{N}_])` | Inteiro sem sinal: `0` ou um número sem zero à esquerda. | Não |
| ABRE_PAR | `\(` | Abre parênteses. | Não |
| FECHA_PAR | `\)` | Fecha parênteses. | Não |
| VIRGULA | `,` | Separa argumentos. | Não |
| DOIS_PONTOS | `:` | Separa o atributo do seu valor. | Não |
| ABRE_CHAVE | `\{` | Abre o corpo de um grupo. | Não |
| FECHA_CHAVE | `\}` | Fecha o corpo de um grupo. | Não |

Cada token guarda o **tipo**, o **lexema** (o texto casado) e a **linha** onde começa. A linha é
contada somando as quebras de linha (`\n`) dos trechos consumidos, inclusive os ignorados.

**Erro léxico.** Quando nenhuma regra casa na posição atual, o léxico registra um erro com a
**linha** e o **trecho inválido**: do caractere que falhou até o próximo espaço em branco,
delimitador (`(`, `)`, `{`, `}`, `,`, `:`) ou início de comentário (`//`). Depois, pula esse
trecho e continua, de modo que **todos** os erros léxicos do programa são relatados de uma vez.
Exemplos: `05`, `retangulos`, `#12345G`, `círculo`, `Tela`, `12px`, `@`.

# 3. Definição sintática

A gramática abaixo é livre de contexto. Os **não-terminais** estão em minúsculas, os
**terminais** são os tipos de token da seção 2 (em maiúsculas) e `ε` é a palavra vazia.
O **símbolo inicial** é `programa`.

```
programa       → decl_tela itens

decl_tela      → TELA ABRE_PAR NUM VIRGULA NUM FECHA_PAR

itens          → item itens
               | ε

item           → forma
               | grupo

forma          → reta
               | circulo
               | retangulo

reta           → RETA ABRE_PAR NUM VIRGULA NUM VIRGULA NUM VIRGULA NUM
                 FECHA_PAR estilo

circulo        → CIRCULO ABRE_PAR NUM VIRGULA NUM VIRGULA NUM FECHA_PAR estilo

retangulo      → RETANGULO ABRE_PAR NUM VIRGULA NUM VIRGULA NUM VIRGULA NUM
                 FECHA_PAR estilo

estilo         → atr_traco estilo_t
               | atr_preench estilo_p
               | atr_espessura estilo_e
               | ε

estilo_t       → atr_preench estilo_tp
               | atr_espessura estilo_te
               | ε

estilo_p       → atr_traco estilo_tp
               | atr_espessura estilo_pe
               | ε

estilo_e       → atr_traco estilo_te
               | atr_preench estilo_pe
               | ε

estilo_tp      → atr_espessura
               | ε

estilo_te      → atr_preench
               | ε

estilo_pe      → atr_traco
               | ε

atr_traco      → TRACO DOIS_PONTOS cor

atr_preench    → PREENCHIMENTO DOIS_PONTOS cor

atr_espessura  → ESPESSURA DOIS_PONTOS NUM

cor            → COR_NOME
               | COR_HEX

grupo          → GRUPO modificadores ABRE_CHAVE itens FECHA_CHAVE

modificadores  → modificador modificadores
               | ε

modificador    → GIRAR ABRE_PAR NUM FECHA_PAR
               | MOVER ABRE_PAR NUM VIRGULA NUM FECHA_PAR
```

## 3.1 Os não-terminais de estilo

Os atributos podem vir em qualquer ordem, mas cada um no máximo uma vez. Para a gramática dizer
isso sem ambiguidade, cada não-terminal `estilo_...` lembra quais atributos **já foram usados**
pelas letras do seu nome: `t` = traço, `p` = preenchimento, `e` = espessura. `estilo` é o estado
inicial (nenhum usado) e `estilo_tp`, por exemplo, é o estado em que traço e preenchimento já
apareceram, então só falta a espessura. Nenhum estado tem uma alternativa para um atributo que
já foi usado, por isso `traco: azul traco: preto` não é gerado pela gramática. Depois que os três
foram usados, só resta `ε`, por isso `estilo_tp`, `estilo_te` e `estilo_pe` terminam após o
último atributo.

No parser, os sete não-terminais são implementados por uma única função `estilo(estiloAtual)`,
em que o parâmetro (os campos já preenchidos) faz o papel das letras do nome.

## 3.2 Por que a gramática serve para um parser descendente recursivo

**Sem recursão à esquerda.** Nenhuma produção começa com o próprio não-terminal. As únicas
recursões (`itens → item itens`, `modificadores → modificador modificadores` e, indiretamente,
`grupo → ... itens ...`) são à direita ou ficam depois de um terminal. No parser, as recursões à
direita de `itens` e `modificadores` viram laços `while`.

**Escolha pelo próximo token (LL(1)).** Para cada não-terminal com mais de uma alternativa, os
conjuntos de tokens que iniciam cada alternativa são disjuntos. Nas alternativas `ε`, o token
seguinte pertence ao conjunto FOLLOW do não-terminal, que também não se cruza com as outras
alternativas:

- FIRST(item) = { RETA, CIRCULO, RETANGULO, GRUPO }
- FOLLOW(itens) = { FECHA_CHAVE, \$ } (\$ é o fim do programa)
- FOLLOW(forma) = FOLLOW(estilo...) = FIRST(item) ∪ FOLLOW(itens) = { RETA, CIRCULO, RETANGULO, GRUPO, FECHA_CHAVE, \$ }
- FOLLOW(modificadores) = { ABRE_CHAVE }

| Não-terminal | Próximo token | Alternativa escolhida |
|---|---|---|
| itens | RETA, CIRCULO, RETANGULO, GRUPO | item itens |
| itens | FECHA_CHAVE, \$ | ε |
| item | RETA, CIRCULO, RETANGULO | forma |
| item | GRUPO | grupo |
| forma | RETA · CIRCULO · RETANGULO | reta · circulo · retangulo |
| estilo... | TRACO (se o traço ainda não foi usado) | atr_traco estilo_... |
| estilo... | PREENCHIMENTO (se ainda não foi usado) | atr_preench estilo_... |
| estilo... | ESPESSURA (se ainda não foi usada) | atr_espessura estilo_... |
| estilo... | RETA, CIRCULO, RETANGULO, GRUPO, FECHA_CHAVE, \$ | ε |
| cor | COR_NOME · COR_HEX | COR_NOME · COR_HEX |
| modificadores | GIRAR, MOVER | modificador modificadores |
| modificadores | ABRE_CHAVE | ε |
| modificador | GIRAR · MOVER | alternativa de GIRAR · de MOVER |

Qualquer outro token é erro sintático.

## 3.3 Erros sintáticos

O parser **para no primeiro erro** e informa a **linha** do token problemático, o que **era
esperado** (os tokens que a gramática aceitaria naquele ponto) e o que foi **encontrado** (o
lexema, ou "o fim do programa"). Quando o programa termina antes da hora, a linha informada é a
do último token. Exemplos:

| Programa (trecho) | Mensagem |
|---|---|
| `circulo(0, 0, 5)` sem tela | `Erro sintático na linha 1: esperado "tela", encontrado "circulo"` |
| `reta(0, 0, 50)` | `Erro sintático na linha 3: esperado ",", encontrado ")"` |
| `traco azul` | `Erro sintático na linha 2: esperado ":", encontrado "azul"` |
| `circulo(0, 0, 5) girar(45)` | `Erro sintático na linha 2: esperado "traco", "preenchimento", "espessura", "reta", "circulo", "retangulo", "grupo" ou o fim do programa, encontrado "girar"` |
| `traco: preto preenchimento: branco traco: vermelho` | `Erro sintático na linha 2: esperado "espessura", "reta", "circulo", "retangulo", "grupo" ou o fim do programa, encontrado "traco" (atributo repetido nesta forma)` |
| `grupo {` sem fechar | `Erro sintático na linha 2: esperado "reta", "circulo", "retangulo", "grupo" ou "}", encontrado o fim do programa` |

Se houve qualquer erro léxico, a análise sintática **não roda**.

# 4. Árvore sintática abstrata (AST)

A AST só é gerada quando não há erro léxico nem sintático. Ela é um objeto JavaScript (mostrado
em JSON) em que todo nó tem o campo `tipo`. Os números são do tipo `number` (não texto), nenhuma
pontuação ou delimitador é guardado, os grupos aninham exatamente como no código e os
modificadores ficam em uma lista, na ordem em que foram escritos.

**Fase 2:** todo nó, menos o `Programa`, também tem o campo `linha`, com a linha da palavra-chave
que o começa (`tela`, `reta`, `circulo`, `retangulo`, `grupo`, `girar` ou `mover`). A verificação
semântica usa essa linha nas mensagens de erro (ver `docs/semantica.md`).

| Nó (`tipo`) | Campos | O que representa |
|---|---|---|
| `Programa` | `tela`: nó `Tela`; `itens`: lista de formas e grupos | O programa inteiro. `itens` está na ordem do código e pode ser vazia. |
| `Tela` | `largura`, `altura`: número | A declaração `tela(largura, altura)`. |
| `Reta` | `x1`, `y1`, `x2`, `y2`: número; `estilo` | Reta do ponto (x1, y1) ao ponto (x2, y2). |
| `Circulo` | `cx`, `cy`, `raio`: número; `estilo` | Círculo de centro (cx, cy) e o raio dado. |
| `Retangulo` | `x`, `y`, `largura`, `altura`: número; `estilo` | Retângulo com canto superior esquerdo em (x, y). |
| `Grupo` | `modificadores`: lista de `Rotacao` e `Deslocamento`; `itens`: lista de formas e grupos | Um bloco `grupo ... { ... }`. As duas listas podem ser vazias. |
| `Rotacao` | `angulo`: número | O modificador `girar(angulo)`. |
| `Deslocamento` | `dx`, `dy`: número | O modificador `mover(dx, dy)`: deslocamento horizontal e vertical. |

O campo `estilo` das formas é um objeto com os três atributos, sempre presentes:

| Campo de `estilo` | Valor | O que representa |
|---|---|---|
| `traco` | cor ou `null` | Cor do traço. `null` quando o atributo foi omitido. |
| `preenchimento` | cor ou `null` | Cor do preenchimento. `null` quando omitido. |
| `espessura` | número ou `null` | Espessura do traço. `null` quando omitida. |

Uma **cor** é guardada como texto, exatamente como foi escrita: um dos nomes (`"azul"`) ou o
hexadecimal com o `#` (`"#1A1A1A"`). A tradução dos nomes para cores do SVG fica para a Fase 2.

## 4.1 AST do Exemplo 1 (carro)

Estrutura da árvore:

```
Programa
├── Tela  400 × 300
├── Retangulo  (50, 150) 200 × 60   preenchimento: azul
├── Grupo  [Deslocamento(70, 190)]
│   ├── Circulo  (0, 0) raio 25   preenchimento: preto
│   └── Grupo  [Rotacao(45)]
│       └── Reta  (0, 0) → (20, 0)   traco: branco, espessura: 2
└── Grupo  [Deslocamento(200, 190)]
    └── Circulo  (0, 0) raio 25   preenchimento: preto
```

AST em JSON, como a página de teste mostra (com o campo `linha`, acrescentado na Fase 2):

```json
{
  "tipo": "Programa",
  "tela": { "tipo": "Tela", "linha": 1, "largura": 400, "altura": 300 },
  "itens": [
    {
      "tipo": "Retangulo", "linha": 3, "x": 50, "y": 150, "largura": 200, "altura": 60,
      "estilo": { "traco": null, "preenchimento": "azul", "espessura": null }
    },
    {
      "tipo": "Grupo", "linha": 4,
      "modificadores": [ { "tipo": "Deslocamento", "linha": 4, "dx": 70, "dy": 190 } ],
      "itens": [
        {
          "tipo": "Circulo", "linha": 5, "cx": 0, "cy": 0, "raio": 25,
          "estilo": { "traco": null, "preenchimento": "preto", "espessura": null }
        },
        {
          "tipo": "Grupo", "linha": 6,
          "modificadores": [ { "tipo": "Rotacao", "linha": 6, "angulo": 45 } ],
          "itens": [
            {
              "tipo": "Reta", "linha": 7, "x1": 0, "y1": 0, "x2": 20, "y2": 0,
              "estilo": { "traco": "branco", "preenchimento": null, "espessura": 2 }
            }
          ]
        }
      ]
    },
    {
      "tipo": "Grupo", "linha": 10,
      "modificadores": [ { "tipo": "Deslocamento", "linha": 10, "dx": 200, "dy": 190 } ],
      "itens": [
        {
          "tipo": "Circulo", "linha": 11, "cx": 0, "cy": 0, "raio": 25,
          "estilo": { "traco": null, "preenchimento": "preto", "espessura": null }
        }
      ]
    }
  ]
}
```

# 5. Decisões de projeto

**Sintaxe**

1. **Estilo de chamada de função.** Os argumentos ficam entre parênteses e separados por
   vírgulas: `circulo(0, 0, 25)`. Os delimitadores deixam claro onde a lista de números termina e
   permitem mensagens de erro precisas (por exemplo, "esperado `,`, encontrado `)`" quando falta
   um argumento). Nenhum deles vai para a AST.
2. **Atributos como `nome: valor`**, depois dos argumentos da forma. **Modificadores** como
   chamadas (`girar(45)`, `mover(70, 190)`), entre a palavra `grupo` e a `{`.
3. **Delimitadores de grupo: chaves `{ }`.**
4. **Marcador de comentário: `//`**, até o fim da linha. Não conflita com o `#` das cores
   hexadecimais, que fica reservado só para elas. Não há comentário de bloco; uma `/` sozinha é
   erro léxico.
5. **Espaços em branco não têm significado**, inclusive as quebras de linha: vários comandos
   podem ficar na mesma linha (`reta(0,0,1,1) circulo(5,5,5)`), um comando pode ocupar várias
   linhas e os espaços entre tokens são opcionais (`grupo{}` é válido).
6. **Palavras-chave em minúsculas e sem acento**: `circulo`, `retangulo`, `traco`. `Tela`, `TELA`,
   `círculo` e `traço` são erros léxicos.
7. **Nomes dos comandos.** A forma do enunciado chamada "reta" usa a palavra-chave `reta`.
   Rotação e deslocamento usam verbos: `girar` e `mover`.
8. **Ordem dos argumentos**: `reta(x1, y1, x2, y2)`, `circulo(cx, cy, raio)`,
   `retangulo(x, y, largura, altura)` com (x, y) no canto superior esquerdo, como no SVG,
   `tela(largura, altura)` e `mover(dx, dy)`.

**Léxico**

9. **Palavra-chave dentro de palavra maior.** Toda palavra-chave e nome de cor só casa se a
   palavra terminar ali. Assim `retangulo` vira um único token RETANGULO (e não RETA + "ngulo"),
   e `retas`, `linhas`, `azulado` e `grupos` são erros léxicos.
10. **Números.** Só inteiros sem sinal. O `0` é aceito. **Zeros à esquerda são erro léxico**
    (`05`, `007`, `00`): o número tem uma única forma de escrita. Um número colado em letras
    (`12px`) também é erro léxico. Não há limite superior; valores acima de 2⁵³ perdem precisão
    ao virar `number` no JavaScript.
11. **Cores.** Lista fechada de 10 nomes (vermelho, verde, azul, amarelo, laranja, roxo, rosa,
    preto, branco, cinza) e hexadecimal com **exatamente** 6 dígitos, em maiúsculas ou
    minúsculas. `#FFF`, `#FFFFFFF` e `#12345G` são erros léxicos. A cor vai para a AST como foi
    escrita.
12. **Trecho do erro léxico.** Vai do caractere que falhou até o próximo espaço, delimitador
    (`( ) { } , :`) ou `//`. Os delimitadores entram porque nesta linguagem eles ficam colados às
    palavras: em `circulo(05, 0, 10)`, o trecho inválido é `05`, e não `05,`. O léxico continua
    depois do trecho e relata todos os erros, cada um com a sua linha.

**Gramática**

13. **Tela obrigatória, primeira e única.** É a primeira produção de `programa`. Comentários e
    linhas em branco antes dela são permitidos (o léxico os ignora). Uma segunda `tela` é erro
    sintático.
14. **Programa só com a tela é válido** (desenho vazio): `itens` pode ser `ε`.
15. **Grupo vazio é aceito** (`grupo { }`), assim como grupo sem modificadores (`grupo { ... }`).
    Um grupo vazio não desenha nada, mas pode servir de marcador para a Fase 2.
16. **Atributos repetidos são erro sintático.** Os atributos podem vir em qualquer ordem, mas cada
    um no máximo uma vez. A gramática garante isso com os não-terminais `estilo_...` (seção 3.1).
    A mensagem indica "atributo repetido nesta forma".
17. **Modificadores podem se repetir** e vir em qualquer ordem: `grupo girar(90) mover(10, 0)
    girar(0) { ... }` é válido e gera uma lista com três modificadores, na ordem escrita. Como a
    ordem das transformações importa na Fase 2, nenhum deles é descartado ou combinado.
18. **Atributos só em formas, modificadores só em grupos.** `circulo(0, 0, 5) girar(45)` e
    `grupo traco: azul { }` são erros sintáticos.
19. **Sem verificação de valores.** A Fase 1 não valida o significado dos números: `tela(0, 0)`,
    raio 0, espessura 0, ângulo 720 e coordenadas fora da tela são aceitos. Como os números não
    têm sinal, um deslocamento negativo ou uma rotação no sentido oposto não podem ser escritos
    diretamente (uma rotação de -45° pode ser escrita como `girar(315)`).

**Erros e AST**

20. **Ordem das fases.** Se há erro léxico, a página mostra todos eles e a análise sintática não
    roda. O parser para no primeiro erro sintático. A AST só aparece quando não há erros.
21. **Fim do programa inesperado.** Quando faltam tokens (por exemplo, um `}` que nunca vem), o
    erro aponta a linha do último token do programa e diz "encontrado o fim do programa".
22. **Estilo sempre completo na AST.** Toda forma tem `estilo` com os três campos; o atributo
    omitido vale `null`. Assim a Fase 2 não precisa testar se o campo existe.
23. **Linhas na AST.** Na Fase 1 a AST não guardava linhas, porque não havia verificação depois
    do parser. Na Fase 2 a verificação semântica precisa informar a linha de cada erro, então todo
    nó, menos o `Programa`, ganhou o campo `linha` (a linha da palavra-chave que o começa).

# 6. Implementação

Em JavaScript puro, com módulos ES e sem bibliotecas de análise:

| Arquivo | Conteúdo |
|---|---|
| `tokens.js` | A lista de regras léxicas da seção 2 e o nome de cada token nas mensagens. |
| `lexer.js` | `analisarLexico(texto)` devolve `{ tokens, erros }`. |
| `parser.js` | `analisarSintatico(tokens)` devolve a AST ou lança `ErroSintatico` (linha, esperado, encontrado). Uma função por não-terminal. |
| `main.js` e `index.html` | A página de teste: caixa de texto, botão, lista de tokens, erros e AST. |
| `casos.js` | Os 5 programas válidos e os 3 inválidos, com o resultado esperado. |
| `testes.js` | Roda os casos de teste e casos extras no terminal: `node testes.js`. |

Os casos de teste e o resultado esperado de cada um estão em `docs/casos-de-teste.md`.

A Fase 2 acrescentou `semantica.js` (verificação semântica), `gerador.js` (gerador de SVG),
`compilador.js` (as quatro fases em ordem), `svg.js` (da página-base: valida, desenha e baixa o
SVG) e `gerar-saidas.js`. O mapeamento da AST para o SVG, a tabela de cores e as decisões dessa
fase estão em `docs/semantica.md`, e os testes em `docs/testes-fase2.md`.
