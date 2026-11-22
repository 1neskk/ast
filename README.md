# Abstract Syntax Tree

Gabriel Almeida Portela &mdash; 825233281

Daniel Almeida Portela  &mdash; 

## Linguagem de Desenho: Fase 1

Uma pequena linguagem para descrever desenhos e, em JavaScript puro, as fases de análise léxica,
análise sintática (descendente recursiva) e geração da AST. A conversão da AST para SVG fica para
a Fase 2.

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

## Como usar

**Página de teste.** Os arquivos usam módulos ES, que o navegador não carrega direto do disco
(`file://`). Sirva a pasta por HTTP e abra <http://localhost:8000>:

```bash
python3 -m http.server 8000
```

(O Live Server do VS Code também funciona.) A página tem uma caixa de texto, o botão
**Analisar** (ou Ctrl+Enter) e uma lista para carregar os casos de teste. Ela mostra os tokens
(tipo, lexema e linha) e, conforme o caso, os erros léxicos, o erro sintático ou a AST em JSON.

**Testes no terminal** (Node 18 ou mais novo):

```bash
node testes.js
```

Roda os 8 casos oficiais e mais 30 testes extras (zeros à esquerda, palavras-chave com sufixo,
cores inválidas, grupo sem fechar, aninhamento profundo etc.).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `tokens.js` | Regras léxicas: tipo do token e expressão regular. |
| `lexer.js` | `analisarLexico(texto)` → `{ tokens, erros }`. |
| `parser.js` | `analisarSintatico(tokens)` → AST, ou lança `ErroSintatico` (linha, esperado, encontrado). |
| `main.js`, `index.html` | Página de teste. |
| `casos.js` | Os 5 programas válidos e 3 inválidos, com o resultado esperado. |
| `testes.js` | Executa os casos de teste no Node. |
| `docs/especificacao.docx` | Especificação (entregável 4.1): linguagem, tokens, gramática, AST e decisões de projeto. |
| `docs/especificacao.md` | Fonte da especificação. |
| `docs/casos-de-teste.md` | Casos de teste com o resultado esperado de cada um (entregável 4.4). |

Para gerar o `.docx` de novo depois de editar `docs/especificacao.md`:

```bash
pandoc -f gfm+yaml_metadata_block docs/especificacao.md --lua-filter docs/tabelas.lua --reference-doc docs/referencia.docx -o docs/especificacao.docx
```

`docs/referencia.docx` define os estilos (A4, tabelas, código) e `docs/tabelas.lua` define a
largura das colunas das tabelas.
