import { analisarLexico } from "./lexer.js";
import { analisarSintatico, ErroSintatico } from "./parser.js";
import { casos } from "./casos.js";

const entrada = document.getElementById("entrada");
const numeros = document.getElementById("numeros");
const seletor = document.getElementById("casos");
const descricaoCaso = document.getElementById("descricao-caso");
const status = document.getElementById("status");
const conferencia = document.getElementById("conferencia");
const tabelaTokens = document.getElementById("tokens");
const qtdTokens = document.getElementById("qtd-tokens");
const blocoLexico = document.getElementById("bloco-lexico");
const tabelaErrosLexicos = document.getElementById("erros-lexicos");
const blocoSintatico = document.getElementById("bloco-sintatico");
const blocoAst = document.getElementById("bloco-ast");
const saidaAst = document.getElementById("ast");
const botaoCopiar = document.getElementById("copiar");

const ALTURA_LINHA = 21;    // igual ao line-height do editor no CSS
let jsonAtual = "";

// ---------------------------------------------------------------- análise

function analisar() {
    const texto = entrada.value;
    const { tokens, erros } = analisarLexico(texto);
    mostrarTokens(tokens);

    blocoLexico.hidden = true;
    blocoSintatico.hidden = true;
    blocoAst.hidden = true;

    let resultado;
    let linhasComErro = [];

    if (erros.length > 0) {
        // Ordem das fases: com erro léxico, a análise sintática não roda.
        resultado = { errosLexicos: erros };
        mostrarErrosLexicos(erros);
        linhasComErro = erros.map(e => e.linha);
    } else {
        try {
            const ast = analisarSintatico(tokens);
            resultado = { ast };
            mostrarAst(ast, tokens.length);
        } catch (falha) {
            if (!(falha instanceof ErroSintatico)) {
                throw falha;
            }
            resultado = {
                erroSintatico: { linha: falha.linha, esperado: falha.esperado, encontrado: falha.encontrado },
            };
            mostrarErroSintatico(falha);
            linhasComErro = [falha.linha];
        }
    }

    atualizarNumeros(linhasComErro);
    conferir(texto, resultado);
}

// ---------------------------------------------------------------- saída

function mostrarStatus(tipo, titulo, detalhe) {
    status.className = "status " + tipo;
    status.replaceChildren(titulo, elemento("small", detalhe));
}

function mostrarTokens(tokens) {
    qtdTokens.textContent = "(" + tokens.length + ")";
    tabelaTokens.replaceChildren(...tokens.map((token, k) => {
        const linha = elemento("tr", [
            elemento("td", String(k + 1), "num"),
            elemento("td", String(token.linha), "num"),
            elemento("td", token.tipo, "mono"),
            elemento("td", token.lexema, "mono"),
        ], "clicavel");
        linha.addEventListener("click", () => irParaLinha(token.linha));
        return linha;
    }));
}

function mostrarErrosLexicos(erros) {
    const plural = erros.length === 1 ? "1 erro léxico" : erros.length + " erros léxicos";
    mostrarStatus("erro", plural, "A análise sintática não foi executada.");
    tabelaErrosLexicos.replaceChildren(...erros.map(erro => {
        const linha = elemento("tr", [
            elemento("td", String(erro.linha), "num"),
            elemento("td", erro.trecho, "mono"),
        ], "clicavel");
        linha.addEventListener("click", () => irParaLinha(erro.linha));
        return linha;
    }));
    blocoLexico.hidden = false;
}

function mostrarErroSintatico(falha) {
    mostrarStatus("erro", "Erro sintático", "O parser parou no primeiro erro e a AST não foi gerada.");
    document.getElementById("sint-linha").textContent = falha.linha;
    document.getElementById("sint-esperado").textContent = falha.esperado;
    document.getElementById("sint-encontrado").textContent = falha.encontrado;
    document.getElementById("sint-mensagem").textContent = falha.message;
    blocoSintatico.hidden = false;
}

function mostrarAst(ast, quantidadeTokens) {
    mostrarStatus("ok", "Programa válido", quantidadeTokens + " tokens, nenhum erro. AST gerada.");
    jsonAtual = JSON.stringify(ast, null, 2);
    saidaAst.innerHTML = destacarJson(jsonAtual);
    blocoAst.hidden = false;
}

// Colore chaves, textos, números e null do JSON. O texto é escapado antes.
function destacarJson(json) {
    const escapado = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escapado.replace(/("(?:[^"\\]|\\.)*")(\s*:)?|\b\d+\b|\bnull\b/g, (m, texto, doisPontos) => {
        if (texto && doisPontos) {
            return '<span class="j-chave">' + texto + "</span>" + doisPontos;
        }
        if (texto) {
            return '<span class="j-texto">' + texto + "</span>";
        }
        return '<span class="' + (m === "null" ? "j-nulo" : "j-numero") + '">' + m + "</span>";
    });
}

// Se o texto do editor é exatamente um dos casos de teste, compara com o resultado esperado.
function conferir(texto, resultado) {
    const caso = casos.find(c => c.programa === texto);
    if (!caso) {
        conferencia.textContent = "";
        return;
    }
    const ok = iguais(resultado, caso.esperado);
    conferencia.className = "conferencia " + (ok ? "ok" : "erro");
    conferencia.textContent = ok
        ? "✓ Caso " + caso.id + ": confere com o resultado esperado."
        : "✗ Caso " + caso.id + ": diferente do resultado esperado.";
}

function iguais(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
        return false;
    }
    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }
    const chavesA = Object.keys(a);
    const chavesB = Object.keys(b);
    return chavesA.length === chavesB.length && chavesA.every(k => iguais(a[k], b[k]));
}

// ---------------------------------------------------------------- editor

function atualizarNumeros(linhasComErro = []) {
    const marcadas = new Set(linhasComErro);
    const quantidade = entrada.value.split("\n").length;
    const spans = [];
    for (let n = 1; n <= quantidade; n++) {
        spans.push(elemento("span", String(n), marcadas.has(n) ? "erro" : ""));
    }
    numeros.replaceChildren(...spans);
    numeros.scrollTop = entrada.scrollTop;
}

function irParaLinha(n) {
    const linhas = entrada.value.split("\n");
    let inicio = 0;
    for (let k = 0; k < n - 1 && k < linhas.length; k++) {
        inicio = inicio + linhas[k].length + 1;
    }
    const fim = inicio + (linhas[n - 1] ?? "").length;
    entrada.focus();
    entrada.setSelectionRange(inicio, fim);
    entrada.scrollTop = Math.max(0, (n - 4) * ALTURA_LINHA);
}

function carregarCaso(id) {
    const caso = casos.find(c => c.id === id);
    if (!caso) {
        return;
    }
    entrada.value = caso.programa;
    descricaoCaso.textContent = caso.id + " · " + caso.nome + ". " + caso.descricao;
    entrada.scrollTop = 0;
    analisar();
}

function elemento(tag, conteudo, classe = "") {
    const el = document.createElement(tag);
    if (classe) {
        el.className = classe;
    }
    if (Array.isArray(conteudo)) {
        el.append(...conteudo);
    } else {
        el.textContent = conteudo;
    }
    return el;
}

// ---------------------------------------------------------------- eventos

for (const caso of casos) {
    const tipo = caso.esperado.ast ? "válido" : "inválido";
    seletor.append(new Option(caso.id + " · " + caso.nome + " (" + tipo + ")", caso.id));
}

seletor.addEventListener("change", () => carregarCaso(seletor.value));

document.getElementById("botao").addEventListener("click", analisar);

entrada.addEventListener("keydown", evento => {
    if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) {
        evento.preventDefault();
        analisar();
    }
});

entrada.addEventListener("input", () => {
    atualizarNumeros();
    const caso = casos.find(c => c.programa === entrada.value);
    if (!caso) {
        seletor.value = "";
        descricaoCaso.textContent = "";
    }
});

entrada.addEventListener("scroll", () => {
    numeros.scrollTop = entrada.scrollTop;
});

botaoCopiar.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(jsonAtual);
        botaoCopiar.textContent = "Copiado";
    } catch {
        botaoCopiar.textContent = "Não foi possível copiar";
    }
    setTimeout(() => { botaoCopiar.textContent = "Copiar"; }, 1500);
});

seletor.value = "V2";
carregarCaso("V2");
