-- Filtro do pandoc para as tabelas da especificação no Word:
--   1. define a largura relativa das colunas de cada tabela, identificada pelo texto da
--      primeira célula do cabeçalho (sem isso, o pandoc divide as colunas em partes iguais);
--   2. deixa o cabeçalho em negrito também como formatação direta, para editores que
--      ignoram o estilo condicional de "primeira linha" da tabela.
--
-- Uso: pandoc -f gfm+yaml_metadata_block docs/especificacao.md --lua-filter docs/tabelas.lua \
--             --reference-doc docs/referencia.docx -o docs/especificacao.docx

local larguras = {
  ["Elemento"]          = { 0.17, 0.36, 0.47 },
  ["Token"]             = { 0.17, 0.47, 0.26, 0.10 },
  ["Não-terminal"]      = { 0.17, 0.48, 0.35 },
  ["Programa (trecho)"] = { 0.34, 0.66 },
  ["Nó (tipo)"]         = { 0.15, 0.43, 0.42 },
  ["Campo de estilo"]   = { 0.20, 0.20, 0.60 },
  ["Arquivo"]           = { 0.24, 0.76 },
}

local function negrito(bloco)
  if bloco.t == "Plain" or bloco.t == "Para" then
    bloco.content = { pandoc.Strong(bloco.content) }
  end
  return bloco
end

function Table(tabela)
  local primeira = pandoc.utils.stringify(tabela.head.rows[1].cells[1].contents)
  local w = larguras[primeira]
  if w == nil then
    io.stderr:write("tabelas.lua: tabela sem larguras definidas: " .. primeira .. "\n")
  else
    for i, coluna in ipairs(tabela.colspecs) do
      tabela.colspecs[i] = { coluna[1], w[i] }
    end
  end
  for _, linha in ipairs(tabela.head.rows) do
    for _, celula in ipairs(linha.cells) do
      celula.contents = celula.contents:map(negrito)
    end
  end
  return tabela
end
