---
title: "Linguagem de Desenho: semântica da Fase 2"
subtitle: "Da AST ao SVG · Teoria da Computação e Compiladores"
author:
  - Gabriel Almeida Portela (825233281)
  - Daniel Almeida Portela
lang: pt-BR
---

# 1. Visão geral

Na Fase 2 o compilador ficou completo:

```
programa → tokens → AST → verificação semântica → SVG
```

As fases rodam nessa ordem e, em cada fase com erro, as seguintes não rodam. A AST da Fase 1
(seção 4 da especificação) passou a guardar a **linha** de cada nó, a verificação semântica
(`semantica.js`) procura os erros que a gramática não pega e o gerador (`gerador.js`) percorre a
AST recursivamente e devolve o texto SVG. Se houver qualquer erro semântico, nenhum SVG é gerado.

# 2. Mapeamento da AST para o SVG

| Nó da AST | SVG gerado | Observações |
|---|---|---|
| `Programa` com `Tela` | `<svg xmlns="http://www.w3.org/2000/svg" width="L" height="A" viewBox="0 0 L A">` … `</svg>` | L e A são a largura e a altura da tela. Os itens do programa viram os filhos do `<svg>`, na ordem do programa. |
| `Reta` | `<line x1 y1 x2 y2 fill stroke stroke-width/>` | `x1`, `y1`, `x2`, `y2` passam direto. |
| `Circulo` | `<circle cx cy r fill stroke stroke-width/>` | `raio` vira `r`. |
| `Retangulo` | `<rect x y width height fill stroke stroke-width/>` | `largura` vira `width` e `altura` vira `height`. (x, y) é o canto superior esquerdo nos dois. |
| `Grupo` | `<g transform="…">` filhos `</g>` | Os filhos usam coordenadas locais, com a origem no ponto do grupo. Sem modificadores, sai `<g>` sem `transform`. Sem filhos, sai `<g/>`. |
| `Rotacao` | `rotate(N)` no `transform` do grupo | N graus, no sentido horário, em torno da origem atual. |
| `Deslocamento` | `translate(X Y)` no `transform` do grupo | X para a direita e Y para baixo. |

Um grupo com vários modificadores leva todos no mesmo `transform`, separados por espaço, **na
ordem em que foram escritos**: `grupo girar(90) mover(40, 0) { … }` gera
`<g transform="rotate(90) translate(40 0)">`, e `grupo mover(40, 0) girar(90) { … }` gera
`<g transform="translate(40 0) rotate(90)">`, que desenha em outro lugar.

Toda forma recebe **sempre os três atributos de estilo**. O campo `null` da AST (atributo
omitido no programa) vira o padrão:

| Campo do estilo | Atributo SVG | Quando omitido |
|---|---|---|
| `preenchimento` | `fill` | `none` (sem preenchimento) |
| `traco` | `stroke` | `black` (traço preto) |
| `espessura` | `stroke-width` | `1` |

# 3. Tabela de cores

Os 10 nomes da linguagem viram nomes de cor do SVG. Uma cor `#RRGGBB` passa direto, exatamente
como foi escrita (maiúsculas e minúsculas, que o SVG aceita igualmente).

| Cor na linguagem | Cor no SVG | Valor no SVG |
|---|---|---|
| `vermelho` | `red` | `#FF0000` |
| `verde` | `green` | `#008000` |
| `azul` | `blue` | `#0000FF` |
| `amarelo` | `yellow` | `#FFFF00` |
| `laranja` | `orange` | `#FFA500` |
| `roxo` | `purple` | `#800080` |
| `rosa` | `pink` | `#FFC0CB` |
| `preto` | `black` | `#000000` |
| `branco` | `white` | `#FFFFFF` |
| `cinza` | `gray` | `#808080` |

O léxico só aceita esses 10 nomes, então nenhuma cor sem correspondente chega ao gerador.

# 4. Verificação semântica

A gramática aceita o zero em qualquer número, então alguns programas passam pelo parser mas não
fazem sentido. `verificar(ast)` faz três verificações:

| Verificação | Erro quando | Mensagem (exemplo) |
|---|---|---|
| Tela | largura ou altura igual a 0 | `linha 2: a tela precisa ter largura e altura maiores que zero, mas a altura é 0` |
| Círculo | raio igual a 0 | `linha 7: o círculo precisa ter raio maior que zero` |
| Retângulo | largura ou altura igual a 0 | `linha 2: o retângulo precisa ter largura e altura maiores que zero, mas a largura é 0` |

A verificação percorre a **AST inteira**, recursivamente, inclusive dentro de grupos aninhados em
qualquer profundidade, e devolve **todos** os erros, na ordem em que aparecem no programa, cada um
com a linha: `[ { linha, mensagem }, … ]`. O vetor vazio significa que não há erro. A página
mostra cada erro com a sua linha e marca a linha no editor.

# 5. Exemplo: o carro

Programa (caso V2):

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

SVG gerado, igual caractere por caractere ao SVG esperado do enunciado:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect x="50" y="150" width="200" height="60" fill="blue" stroke="black" stroke-width="1"/>
  <g transform="translate(70 190)">
    <circle cx="0" cy="0" r="25" fill="black" stroke="black" stroke-width="1"/>
    <g transform="rotate(45)">
      <line x1="0" y1="0" x2="20" y2="0" fill="none" stroke="white" stroke-width="2"/>
    </g>
  </g>
  <g transform="translate(200 190)">
    <circle cx="0" cy="0" r="25" fill="black" stroke="black" stroke-width="1"/>
  </g>
</svg>
```

# 6. Decisões de projeto

**AST e verificação**

1. **Linha nos nós.** Todo nó da AST, menos o `Programa`, ganhou o campo `linha`: a linha da
   palavra-chave que o começa (`tela`, `reta`, `circulo`, `retangulo`, `grupo`, `girar`,
   `mover`). Um comando escrito em várias linhas é informado pela linha em que começa.
2. **Um erro por nó.** Uma tela ou um retângulo com as duas medidas iguais a zero gera um erro só,
   e a mensagem diz qual medida falhou ("mas a largura e a altura são 0"). Dois erros na mesma
   linha (duas formas) aparecem separados.
3. **O que não é erro.** Só as três verificações obrigatórias rejeitam um programa. Reta de
   comprimento zero, `espessura: 0`, coordenadas 0, formas fora da tela, `girar(0)`,
   `mover(0, 0)`, ângulos acima de 360 e grupos vazios são aceitos: o SVG que eles geram é
   válido.
4. **Atributo repetido.** O enunciado diz que, se um atributo se repete na mesma forma, vale o
   último. Nesta linguagem a repetição já é **erro sintático** desde a Fase 1 (decisão 16 da
   especificação: `traco: azul traco: preto` não é gerado pela gramática). Por isso cada campo
   do estilo chega ao gerador com no máximo um valor e a regra nunca precisa ser aplicada.

**Gerador**

5. **Sempre os três atributos de estilo**, em toda forma, com os padrões da seção 2. Uma reta
   também recebe `fill="none"`. Assim nenhuma reta some (sem `stroke`) e nenhuma forma sai preta
   (sem `fill`).
6. **Espessura 0** gera `stroke-width="0"`: uma forma sem contorno. O desenho final usa isso no
   céu, no chão e nas nuvens.
7. **Grupo sem modificadores** vira `<g>` sem `transform`, e não é removido: a árvore do SVG fica
   igual à da AST. **Grupo vazio** vira `<g/>` (ou `<g transform="…"/>`): não desenha nada, mas
   fica no SVG.
8. **Modificadores sem simplificação.** Todos vão para o `transform`, na ordem escrita, mesmo os
   que não mudam nada (`girar(0)`, `mover(0, 0)`) e os repetidos (`girar(30) girar(30)` não vira
   `rotate(60)`). Como os números não têm sinal, uma rotação no sentido anti-horário de N graus se
   escreve `girar(360 - N)`.
9. **Ordem dos elementos**: a do programa, então o que vem depois fica por cima. O desenho final
   usa isso no telhado do moinho: um quadrado girado 45 graus cuja metade de baixo fica escondida
   atrás da torre, desenhada depois.
10. **Formatação do texto.** Um elemento por linha, 2 espaços de indentação por nível de grupo;
    em cada forma, os atributos de geometria vêm primeiro e depois `fill`, `stroke` e
    `stroke-width`. O SVG não tem fundo: a página mostra a tela como um papel branco e as imagens
    `.png` são geradas com fundo branco.
11. **Recursão.** `gerar(no, nivel)` trata cada tipo de nó e chama a si mesma para cada filho, um
    nível de indentação abaixo, como o `paraMermaid` da aula de AST. A verificação semântica segue
    a mesma ideia.

**Página e testes**

12. **Sem SVG quando há erro.** Com erro em qualquer fase, a página limpa a caixa de SVG e o
    desenho, em vez de deixar o desenho do programa anterior na tela, e mostra em qual fase o
    compilador parou.
13. **Funções sem DOM.** `verificar` e `gerarSVG` só recebem a AST e devolvem dados, então rodam
    também no Node. O caminho completo fica em `compilador.js`, usado pela página, pelos testes
    (`node testes.js`) e por `gerar-saidas.js`, que grava o `.svg` e o `.png` de cada programa
    válido na pasta `saidas/`. A validação e o desenho do SVG na página são os do `svg.js` da
    página-base, sem alteração.
