import { compilar, resumir } from "./compilador.js";
import { desenharSvg, baixarSvg } from "./svg.js";
import { casos, desenhoFinal } from "./casos.js";

const entrada = document.getElementById("entrada");
const numeros = document.getElementById("numeros");
const seletor = document.getElementById("casos");
const descricaoCaso = document.getElementById("descricao-caso");
const fases = document.getElementById("fases");
const status = document.getElementById("status");
const conferencia = document.getElementById("conferencia");
const tabelaTokens = document.getElementById("tokens");
const qtdTokens = document.getElementById("qtd-tokens");
const blocoLexico = document.getElementById("bloco-lexico");
const tabelaErrosLexicos = document.getElementById("erros-lexicos");
const blocoSintatico = document.getElementById("bloco-sintatico");
const blocoSemantico = document.getElementById("bloco-semantico");
const tabelaErrosSemanticos = document.getElementById("erros-semanticos");
const saidaAst = document.getElementById("ast");
const infoAst = document.getElementById("info-ast");
const botaoCopiar = document.getElementById("copiar");
const saida = document.getElementById("saida");
const msgSvg = document.getElementById("msg-svg");
const figura = document.getElementById("figura");
const tamanhoTela = document.getElementById("tamanho-tela");
const ajustar = document.getElementById("ajustar");

const ALTURA_LINHA = 21;    // igual ao line-height do editor no CSS
const exemplos = [...casos, desenhoFinal];
let jsonAtual = "";

// ---------------------------------------------------------------- análise

// Roda as quatro fases na ordem (léxico, sintático, semântico e gerador) e mostra o resultado.
// Em cada fase com erro, as seguintes não rodam e nenhum SVG é gerado (ver compilador.js).
function analisar() {
    const texto = entrada.value;
    blocoLexico.hidden = true;
    blocoSintatico.hidden = true;
    blocoSemantico.hidden = true;

    let resultado;
    try {
        resultado = compilar(texto);
    } catch (falha) {
        // Erro interno (bug em alguma fase): mostra em vez de quebrar a página.
        mostrarTokens([]);
        mostrarAst(null);
        marcarFases("gerador");
        mostrarStatus("erro", "Erro interno", falha.message);
        limparSaida("Nenhum SVG gerado: houve um erro interno.");
        atualizarNumeros();
        conferir(texto, { falha: falha.message });
        return;
    }

    mostrarTokens(resultado.tokens);
    mostrarAst(resultado.ast ?? null);
    let linhasComErro = [];

    if (resultado.errosLexicos) {
        mostrarErrosLexicos(resultado.errosLexicos);
        linhasComErro = resultado.errosLexicos.map(e => e.linha);
    } else if (resultado.erroSintatico) {
        mostrarErroSintatico(resultado.erroSintatico);
        linhasComErro = [resultado.erroSintatico.linha];
    } else if (resultado.errosSemanticos) {
        mostrarErrosSemanticos(resultado.errosSemanticos);
        linhasComErro = resultado.errosSemanticos.map(e => e.linha);
    } else {
        marcarFases(null);
        mostrarStatus("ok", "SVG gerado", resultado.tokens.length + " tokens, " + contarNos(resultado.ast) +
            " nós na AST, nenhum erro. O desenho está na coluna da direita.");
        saida.value = resultado.svg;
        desenhar();
    }

    atualizarNumeros(linhasComErro);
    conferir(texto, resumir(resultado));
}

// ---------------------------------------------------------------- saída: análise

// Marca a fase que falhou (as anteriores passaram, as seguintes não rodaram).
// Com "falhou" null, todas passaram.
function marcarFases(falhou) {
    let depois = false;
    for (const li of fases.children) {
        const fase = li.dataset.fase;
        li.className = depois ? "pulada" : fase === falhou ? "erro" : "ok";
        li.title = depois ? "não executada" : fase === falhou ? "com erro" : "ok";
        if (fase === falhou) {
            depois = true;
        }
    }
}

function mostrarStatus(tipo, titulo, detalhe) {
    status.className = "status " + tipo;
    status.replaceChildren(titulo, elemento("small", detalhe));
}

function mostrarTokens(tokens) {
    qtdTokens.textContent = "(" + tokens.length + ")";
    tabelaTokens.replaceChildren(...tokens.map((token, k) => linhaClicavel(token.linha, [
        elemento("td", String(k + 1), "num"),
        elemento("td", String(token.linha), "num"),
        elemento("td", token.tipo, "mono"),
        elemento("td", token.lexema, "mono"),
    ])));
}

function mostrarErrosLexicos(erros) {
    marcarFases("lexico");
    const plural = erros.length === 1 ? "1 erro léxico" : erros.length + " erros léxicos";
    mostrarStatus("erro", plural, "As análises sintática e semântica não foram executadas e o SVG não foi gerado.");
    tabelaErrosLexicos.replaceChildren(...erros.map(erro => linhaClicavel(erro.linha, [
        elemento("td", String(erro.linha), "num"),
        elemento("td", erro.trecho, "mono"),
    ])));
    blocoLexico.hidden = false;
    limparSaida();
}

function mostrarErroSintatico(falha) {
    marcarFases("sintatico");
    mostrarStatus("erro", "Erro sintático", "O parser parou no primeiro erro: a AST e o SVG não foram gerados.");
    document.getElementById("sint-linha").textContent = falha.linha;
    document.getElementById("sint-esperado").textContent = falha.esperado;
    document.getElementById("sint-encontrado").textContent = falha.encontrado;
    document.getElementById("sint-mensagem").textContent = falha.message;
    blocoSintatico.hidden = false;
    limparSaida();
}

function mostrarErrosSemanticos(erros) {
    marcarFases("semantico");
    const plural = erros.length === 1 ? "1 erro semântico" : erros.length + " erros semânticos";
    mostrarStatus("erro", plural, "A AST foi gerada, mas o programa não faz sentido: o SVG não foi gerado.");
    tabelaErrosSemanticos.replaceChildren(...erros.map(erro => linhaClicavel(erro.linha, [
        elemento("td", String(erro.linha), "num"),
        elemento("td", erro.mensagem),
    ])));
    blocoSemantico.hidden = false;
    limparSaida();
}

// Mostra a AST em JSON (ou limpa, com null).
function mostrarAst(ast) {
    if (ast === null) {
        jsonAtual = "";
        saidaAst.textContent = "";
        infoAst.textContent = "A AST não foi gerada.";
        botaoCopiar.hidden = true;
        return;
    }
    jsonAtual = JSON.stringify(ast, null, 2);
    saidaAst.innerHTML = destacarJson(jsonAtual);
    infoAst.textContent = contarNos(ast) + " nós. Cada nó guarda a linha em que começa.";
    botaoCopiar.hidden = false;
}

function contarNos(no) {
    let total = 1;
    for (const filho of [no.tela, ...(no.modificadores ?? []), ...(no.itens ?? [])]) {
        if (filho) {
            total = total + contarNos(filho);
        }
    }
    return total;
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

// ---------------------------------------------------------------- saída: SVG e imagem

// Valida e desenha o texto da caixa "Saída (SVG)", escrito pelo gerador ou à mão.
function desenhar() {
    const resultado = desenharSvg(saida.value, figura);
    let nivel = "ok";
    if (!resultado.ok) {
        nivel = "erro";
    } else if (resultado.aviso) {
        nivel = "aviso";
    }
    mostrarMsgSvg(nivel, resultado.mensagem);

    const svg = figura.querySelector("svg");
    const largura = svg?.getAttribute("width");
    const altura = svg?.getAttribute("height");
    tamanhoTela.textContent = largura && altura ? "(" + largura + " × " + altura + ")" : "";
}

// Com erro em qualquer fase, nenhum SVG é gerado: a saída e o desenho anteriores somem.
function limparSaida(mensagem = "Nenhum SVG gerado: corrija os erros do programa.") {
    saida.value = "";
    figura.replaceChildren();
    tamanhoTela.textContent = "";
    mostrarMsgSvg("aviso", mensagem);
}

function mostrarMsgSvg(nivel, texto) {
    msgSvg.className = "msg " + nivel;
    msgSvg.textContent = texto;
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
    const caso = exemplos.find(c => c.id === id);
    if (!caso) {
        return;
    }
    entrada.value = caso.programa;
    descricaoCaso.textContent = caso.id + " · " + caso.nome + ". " + caso.descricao;
    entrada.scrollTop = 0;
    analisar();
}

function linhaClicavel(linha, celulas) {
    const tr = elemento("tr", celulas, "clicavel");
    tr.addEventListener("click", () => irParaLinha(linha));
    return tr;
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

// Lista de casos, separada em grupos pelo resultado esperado.
const GRUPOS = [
    ["Válidos (Fase 1)", c => c.esperado?.ast],
    ["Erros léxicos e sintáticos (Fase 1)", c => c.esperado?.errosLexicos || c.esperado?.erroSintatico],
    ["Erros semânticos (Fase 2)", c => c.esperado?.errosSemanticos],
    ["Desenho final (Fase 2)", c => c === desenhoFinal],
];
for (const [rotulo, pertence] of GRUPOS) {
    const grupo = document.createElement("optgroup");
    grupo.label = rotulo;
    for (const caso of exemplos.filter(pertence)) {
        grupo.append(new Option(caso.id + " · " + caso.nome, caso.id));
    }
    seletor.append(grupo);
}

seletor.addEventListener("change", () => carregarCaso(seletor.value));

document.getElementById("botao").addEventListener("click", analisar);
document.getElementById("btn-desenhar").addEventListener("click", desenhar);
document.getElementById("btn-baixar").addEventListener("click", () => baixarSvg(saida.value));

entrada.addEventListener("keydown", evento => {
    if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) {
        evento.preventDefault();
        analisar();
    }
});

saida.addEventListener("keydown", evento => {
    if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) {
        evento.preventDefault();
        desenhar();
    }
});

entrada.addEventListener("input", () => {
    atualizarNumeros();
    const caso = exemplos.find(c => c.programa === entrada.value);
    if (!caso) {
        seletor.value = "";
        descricaoCaso.textContent = "";
    }
});

entrada.addEventListener("scroll", () => {
    numeros.scrollTop = entrada.scrollTop;
});

ajustar.addEventListener("change", () => {
    figura.classList.toggle("ajustar", ajustar.checked);
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
