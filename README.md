# Abstract Syntax Tree

Gabriel Almeida Portela &mdash; 825233281

Daniel Almeida Portela  &mdash; 825234443

## Linguagem de Desenho: Fases 1 e 2

Uma pequena linguagem para descrever desenhos e, em JavaScript puro, o compilador completo:

```
programa → tokens → AST → verificação semântica → SVG
```

A Fase 1 fez o léxico, o parser descendente recursivo e a AST. A Fase 2 fez a verificação
semântica e o gerador de SVG: ao clicar em **Analisar**, o SVG aparece na coluna da direita, já
desenhado.

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

<img src="saidas/F1-moinho-de-vento.png" width="400" alt="Desenho final: um moinho de vento num campo, com sol, nuvens, pássaros e flores">

## Como usar

**Página.** Os arquivos usam módulos ES, que o navegador não carrega direto do disco
(`file://`). Sirva a pasta por HTTP e abra <http://localhost:8000>:

```bash
python3 -m http.server 8000
```

(O Live Server do VS Code também funciona.) À esquerda ficam o editor, o botão **Analisar** (ou
Ctrl+Enter), a lista de casos de teste, o resultado de cada fase (erros léxicos, o erro
sintático ou os erros semânticos, com a linha), a AST em JSON e os tokens. À direita ficam o SVG
gerado, que também pode ser editado à mão (**Desenhar** ou Ctrl+Enter), o botão **Baixar .svg** e
a imagem. Com erro em qualquer fase, nenhum SVG é gerado.

**Testes no terminal** (Node 18 ou mais novo):

```bash
node testes.js
```

Roda os 11 casos oficiais (5 válidos, 1 erro léxico, 2 sintáticos e 3 semânticos), os casos
extras da Fase 1 e os testes da Fase 2: linha nos nós, as três verificações em toda a AST, os
padrões de estilo, a tabela de cores, os grupos aninhados, a ordem dos modificadores e o SVG do
exemplo do enunciado, que precisa sair igual caractere por caractere.

**Arquivos de saída** (`.svg`, `.png` e o programa do desenho final, na pasta `saidas/`):

```bash
node gerar-saidas.js
```

As imagens `.png` usam o `rsvg-convert` (librsvg) ou o `resvg`. Os testes conferem que os `.svg`
da pasta são iguais ao que o compilador gera; depois de mudar o gerador ou um caso, rode este
comando de novo.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `tokens.js` | Regras léxicas: tipo do token e expressão regular. |
| `lexer.js` | `analisarLexico(texto)` → `{ tokens, erros }`. |
| `parser.js` | `analisarSintatico(tokens)` → AST (cada nó com a sua `linha`), ou lança `ErroSintatico`. |
| `semantica.js` | `verificar(ast)` → `[ { linha, mensagem }, ... ]`: as três verificações semânticas. |
| `gerador.js` | `gerarSVG(ast)` → texto SVG, percorrendo a AST recursivamente; tabela de cores. |
| `compilador.js` | `compilar(texto)`: as quatro fases em ordem, parando na primeira com erro. |
| `svg.js` | Da página-base, sem alteração: valida, desenha e baixa o SVG. |
| `main.js`, `index.html` | A página. |
| `casos.js` | Os 11 casos de teste, com o resultado esperado, e o desenho final. |
| `testes.js` | Executa os testes no Node. |
| `gerar-saidas.js` | Grava os arquivos da pasta `saidas/`. |
| `saidas/` | `.svg` e `.png` dos 5 programas válidos (V1 a V5) e do desenho final (F1), e o programa do desenho final (`.txt`). |
| `docs/semantica.docx` | Documento de semântica (entregável 5.1 da Fase 2): mapeamento da AST para o SVG, tabela de cores e decisões de projeto. |
| `docs/semantica.md` | Fonte do documento de semântica. |
| `docs/testes-fase2.md` | Testes da Fase 2 (entregáveis 5.4 e 5.5): SVG e imagem dos válidos, erros semânticos com as mensagens e o desenho final. |
| `docs/especificacao.docx` | Especificação da Fase 1: linguagem, tokens, gramática, AST e decisões de projeto. |
| `docs/especificacao.md` | Fonte da especificação. |
| `docs/casos-de-teste.md` | Casos de teste da Fase 1, com o resultado esperado de cada um. |

Para gerar os `.docx` de novo depois de editar os `.md`:

```bash
pandoc -f gfm+yaml_metadata_block docs/especificacao.md --lua-filter docs/tabelas.lua --reference-doc docs/referencia.docx -o docs/especificacao.docx
```

```bash
pandoc -f gfm+yaml_metadata_block docs/semantica.md --lua-filter docs/tabelas.lua --reference-doc docs/referencia.docx -o docs/semantica.docx
```

`docs/referencia.docx` define os estilos (A4, tabelas, código) e `docs/tabelas.lua` define a
largura das colunas das tabelas.
