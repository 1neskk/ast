// Gera os arquivos de saída da Fase 2 na pasta saidas/ (entregáveis 5.4 e 5.5):
//   - para cada programa válido de casos.js (V1 a V5) e para o desenho final (F1):
//     o .svg gerado pelo compilador e uma imagem .png desse SVG;
//   - para o desenho final, também o programa na linguagem (.txt).
//
// Uso: node gerar-saidas.js   (ou npm run saidas)
//
// O .png é feito pelo rsvg-convert (librsvg) ou, se ele não existir, pelo resvg, com fundo
// branco e ampliado (pelo menos 2x, e telas pequenas até uns 600 pixels). Sem nenhum dos dois,
// só os .svg são gravados. testes.js confere que os .svg da pasta são iguais aos gerados.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compilar } from "./compilador.js";
import { casos, desenhoFinal, nomeDeArquivo } from "./casos.js";

const pasta = path.join(path.dirname(fileURLToPath(import.meta.url)), "saidas");
fs.mkdirSync(pasta, { recursive: true });

// Os conversores de SVG para PNG que sabemos usar, na ordem de preferência.
const CONVERSORES = [
    { programa: "rsvg-convert", argumentos: (svg, png, zoom) => ["-z", String(zoom), "-b", "white", "-o", png, svg] },
    { programa: "resvg",        argumentos: (svg, png, zoom) => ["--zoom", String(zoom), "--background", "white", svg, png] },
];

function acharConversor() {
    for (const conversor of CONVERSORES) {
        try {
            execFileSync(conversor.programa, ["--version"], { stdio: "ignore" });
            return conversor;
        } catch {
            // não instalado: tenta o próximo
        }
    }
    return null;
}

const conversor = acharConversor();
if (!conversor) {
    console.warn("Aviso: nem rsvg-convert nem resvg foram encontrados; as imagens .png não serão geradas.");
}

const programas = [...casos.filter(c => c.esperado.ast), desenhoFinal];
for (const caso of programas) {
    const resultado = compilar(caso.programa);
    if (!resultado.svg) {
        throw new Error(caso.id + ": o programa deveria ser válido, mas não gerou SVG");
    }
    const base = path.join(pasta, nomeDeArquivo(caso));
    fs.writeFileSync(base + ".svg", resultado.svg + "\n");
    const gravados = [".svg"];

    if (caso === desenhoFinal) {
        fs.writeFileSync(base + ".txt", caso.programa + "\n");
        gravados.push(".txt");
    }

    if (conversor) {
        const { largura, altura } = resultado.ast.tela;
        const zoom = Math.max(2, Math.ceil(600 / Math.max(largura, altura)));
        execFileSync(conversor.programa, conversor.argumentos(base + ".svg", base + ".png", zoom));
        gravados.push(".png (" + zoom + "x)");
    }

    console.log("saidas/" + nomeDeArquivo(caso) + "  " + gravados.join(", "));
}
