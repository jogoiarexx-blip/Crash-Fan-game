# Crash Bandicoot Fã Game — Auditoria técnica v1.26
**Data:** 10/11/2026  
**Repositório:** https://github.com/jogoiarexx-blip/Crash-Fan-game  
**Jogo publicado:** https://jogoiarexx-blip.github.io/Crash-Fan-game/  
**Escopo:** HTML5 Canvas, JavaScript, dez fases, IA, colisões, controles, pistas em perspectiva, carregamento, saves, áudio, gráficos e mobile.

## 1. Critérios de evidência
- **Corrigido:** alteração concreta no código do jogo, seguida de teste automatizado pertinente.
- **Validado automaticamente:** verificado por harness Node ou Chromium real, não substitui jogar até zerar.
- **Pendente de playtest:** necessita trajetória real, inspeção visual/controle físico, FPS prolongado ou dispositivo específico.
- Testes históricos de v1.02–1.16 não foram tratados como prova automática para a v1.26.
- Não afirmar "todos os bugs corrigidos" nem "jogo zerado": não foi executado um playthrough manual integral fase a fase.

## 2. Problemas constatados e correções implantadas
| Prioridade | Subsistema | Problema encontrado | Correção v1.26 | Evidência |
|---|---|---|---|---|
| P0 | Controle / fases 6 e 8 | `updateAvalanche` ignorava `pad()` para esquerda, direita e pulo. | Leitura unificada com controles de gamepad já presentes nas fases 7 e 9. | `tests/special-gamepad-test.js` valida direcional e pulo nas fases 6–9. |
| P1 | Perspectiva pseudo-3D | Máscara da estrada formava quadrilátero de bordas retas em curvas, cortando o traçado. | Recorte acompanha amostras das curvas nas duas laterais da pista. | Chromium carrega/desenha fases 6–9; inspeção visual ainda recomendada durante movimentação. |
| P1 | Textura da pista | Faixa de textura que passava da linha 512 era truncada, criando potencial emenda visual. | Textura é dividida em duas parcelas, retomando a amostragem em Y=0. | Smoke test browser e sintaxe. |
| P2 | Objetos às margens | Sombra não acompanhava corretamente a base dos objetos; sprite tinha deslocamento vertical. | Base do sprite alinhada ao plano da pista e sombra projetada na base. | Smoke test browser; inspeção de posições durante corrida pendente. |
| P1 | Controles virtuais desktop | Detectar `(hover:none)` isoladamente podia ativar joystick virtual num ambiente sem toque. | Detecção só por ponteiro coarse ou `navigator.maxTouchPoints`. | Testes de Chromium desktop + mobile. |
| P2 | Legibilidade de HUD de abertura | Texto da introdução tinha baixo contraste em alguns fundos. | Gradiente escuro discreto atrás do título, objetivo e subtítulo. | Renderização real em Chromium. |
| P2 | Gráficos / Cânion Rubro | Composição da fase 5 mais plana que demais biomas. | Duas silhuetas de cânion com deslocamentos parallax e iluminação radial, sem novo asset. | Smoke test browser da fase 5; comprovação visual antes/depois pendente. |
| P1 | Regressão de testes | Novo gradiente radial não era implementado pelo mock do Canvas e quebrou teste de runtime. | Fallback seguro para gradiente linear em Canvas limitado, preservando radial no navegador real. | Regressões de runtime e browser após ajuste. |
| P2 | Atualização publicada | Arquivos scripts e PWA mantinham identidade v1.25 após as mudanças. | Versão v1.26 em `game.js`, `index.html`, querystrings e `manifest.webmanifest`. | Conferência da branch e Pages. |

## 3. Auditoria geométrica — fases de plataforma (1–5)
Implementado `tests/full-layout-audit-test.js`. Valida:
- Números/limites espaciais das caixas e TNT.
- Sobreposição caixa × caixa, TNT × TNT, caixa × TNT.
- Caixa sobre checkpoint, caixas sem superfície de apoio e penetração na geometria.
- Checkpoint com chão, intervalos inválidos de patrulha e suporte de inimigos terrestres.
- Portal sobre solo.
**Resultado da primeira execução no GitHub Actions:** 0 erros, 0 avisos nas regras automatizadas.

Contagens detectadas no runtime:
| Fase | Superfícies | Caixas | TNT | Inimigos | Frutas |
|---|---:|---:|---:|---:|---:|
| 1 Ilha Selvagem | 31 | 22 | 4 | 7 | 58 |
| 2 Templo Perdido | 31 | 27 | 5 | 7 | 48 |
| 3 Pântano Sombrio | 19 | 23 | 4 | 10 | 19 |
| 4 Picos Congelados | 18 | 24 | 4 | 9 | 19 |
| 5 Cânion Rubro | 21 | 27 | 4 | 9 | 24 |

Essas regras NÃO comprovam alinhamento pixel-perfect, todas as passagens possíveis, ausência de pop-in nem alcançabilidade de cada collectible com física de jogador.

## 4. Fases pseudo-3D (6–9)
Criado `tests/special-gamepad-test.js`: valida gamepad por entrada simulada do navegador, pulo, definição de faixas, tipo/posição dos obstáculos e extensão do percurso.

| Fase | Modo | Obstáculos | Distância total | Teste |
|---|---|---:|---:|---|
| 6 Avalanche Alpina | avalanche | 22 | 6500 | controle/pulo aprovado |
| 7 Corrida Polar | montaria | 24 | 7200 | controle/pulo aprovado |
| 8 Pedra da Selva | avalanche | 22 | 6700 | controle/pulo aprovado |
| 9 Corrida do Javali | montaria | 24 | 7300 | controle/pulo aprovado |

Os testes simulados verificam deslocamento e pulo, mas não a ergonomia do controle físico, cadência da corrida, reação do jogador humano ou nitidez de colisões em todos os obstáculos.

## 5. Navegador real, assets e interface
Criado `tests/browser-smoke-test.cjs`, executado no **Chromium** pelo GitHub Actions:
- Abre e carrega as 10 fases no DOM/canvas de um navegador real.
- Verifica se entra no estado `play`, se há desenho não vazio e ausência de `pageerror`.
- Captura respostas HTTP 4xx/5xx de assets do jogo.
- Gera screenshots PNG por fase e anexos de auditoria como artefatos de CI.
- Verifica retrato mobile 390×844 e paisagem 844×390, inclusive botões durante gameplay (joystick, giro, pulo).

Resultados anteriores à última alteração: **10/10 fases com renderização e carregamento válidos, nenhum erro JS e nenhum arquivo HTTP ausente**. Verificar execução do commit final do v1.26 em GitHub Actions para confirmação da versão exata.

## 6. Carregamento, performance e gerenciamento de memória
- `js/level-loader.js` tem grupos `core`, `shared` e `phaseN`; teste de runtime verifica liberação dos grupos antigos entre fases.
- Árvores, trilhas e tiles exclusivos entram por fase, evitando carregar tudo no início.
- O repositório possui ~**26,9 MiB** de arquivos: ~16,4 MiB WebP, ~7,7 MiB WAV, ~1,6 MiB MP4. Os valores são tamanho no repositório, NÃO medição de download do primeiro acesso.
- Otimizações sugeridas: atlas grande de chefe (~2,13 MiB), portal (~1,5 MiB), tiles do pântano (~1,48 MiB), compressão de música em formato suportado por navegadores, cenas em canvas offscreen e redução de efeitos para dispositivos lentos.
- Nenhum FPS real prolongado nem orçamento de VRAM/GPU de aparelhos foi medido neste relatório.

## 7. Pendências priorizadas — próximos lotes
### P0 — validação funcional
1. Executar **playthrough completo**, chegar ao portal e finalizar todas as fases e chefe, verificando que o progress/save, rotas, TNT e cristais não criam softlocks.
2. Automatizar sequências com entradas de movimento e amostragem de colisões em fases 1–5; o smoke test de inicialização não percorre a fase inteira.
3. Validar save/load e pause retomando gameplay em refresh real de navegador, não apenas DOM simulado.
### P1 — acabamento e física
4. Comparar hitbox vs. arte de jogadores, inimigos e veículos em todos os frames de animação.
5. Rever posicionamento de checkpoints, caixas, armadilhas e cristais contra screenshots ao longo de cada setor.
6. Testar controle real Xbox/PlayStation, teclado simultâneo, touch multitouch, foco perdido e orientação mobile.
7. Verificar clipping, z-order e flicker das curvas pseudo-3D com câmera em movimento e obstáculos próximos.
### P2 — fidelidade gráfica/áudio e desempenho
8. Homogeneizar qualidade visual entre os cinco biomas de plataforma e as quatro corridas em perspectiva.
9. Testar efeitos sonoros, volume, mixagem, restart de música, áudio após retornar do pause em Chrome/Firefox/Safari.
10. Registrar FPS p50/p95, uso de memória e tempo de carregamento em PC básico e celular intermediário; otimizar gargalos comprovados.
11. Revisar UX de seleção de fases, opções gráficas, acessibilidade, texto em HUD e legibilidade em telas pequenas.
12. Monitorar WebP grandes, cache de assets e download total com rede lenta (3G/4G).

## 8. Execução reproduzível
Rodar na raiz em ambiente Node:
```bash
node --check js/game.js
node tests/jungle-data-test.js
node tests/platform-route-test.js
node tests/loader-runtime-test.js
node tests/final-boss-logic-test.js
node tests/phase345-data-test.js
node tests/asset-organization-test.js
node tests/audio-bank-test.js
node tests/cinematic-test.js
node tests/full-layout-audit-test.js
node tests/special-gamepad-test.js
```
Chromium real via workflow `.github/workflows/tests.yml`, que instala `puppeteer-core@24` para executar `tests/browser-smoke-test.cjs` e anexa `crash-auditoria-visual` com screenshots.

## 9. Conclusão e limitações
O projeto tem arquitetura de carregamento por fases, sistemas de save e controles, conteúdo de 10 fases e agora uma cobertura mais ampla de testes geométricos, de controle e de execução em navegador real. Os bugs de gamepad das avalanches e o recorte da pista foram corrigidos no código; melhorias de interface e cenário foram aplicadas.

**Ainda não está certificado como "zerado 100%" nem "sem todos os bugs"**: é indispensável jogar caminhos completos, testar performance real e observar colisões/arte em movimento. A distinção entre correções verificadas e testes pendentes é intencional.


---

## 10. Continuação — v1.27 (10/11/2026)

### Certificação automatizada de percurso
- Teste adicionado: `tests/playthrough-probe-test.js`.
- A instrumentação `qaStep` em `js/game.js` percorre quadros reais de atualização, usando os controles normais, sem teletransportar Crash, desativar dano ou alterar saves.
- Workflow dedicado `.github/workflows/qa-routes.yml` executa a simulação sem a sobrecarga do pipeline de assets.
- **Fases 6, 7, 8 e 9:** concluídas integralmente na simulação, com **0 mortes e 0 impactos**, registrando checkpoint. O CI agora falha caso esses quatro percursos deixem de terminar nessas condições.
- **Fase 2:** o piloto chegou à tela de resultado após **3 mortes** em uma execução; teste exploratório, sem certificação repetida nem garantia de rota ótima.
- **Fases 1, 3, 4 e 5:** o piloto não concluiu os percursos com segurança. As falhas podem decorrer da estratégia limitada de salto e desvio; ainda não são defeitos confirmados do jogo.
- **Fase 10:** piloto de combate real chegou a acertar o chefe pela primeira vez (**9 → 8 HP**), mas perdeu as quatro vidas; a vitória integral não está certificada.

### Correções técnicas de QA
- Corrigidas as dimensões do canvas simulado para `width:960` e `height:540`. Antes, o limite vertical de queda usava `H=undefined`, permitindo relatórios falsos de Crash abaixo do mundo sem morrer. Após o ajuste, a morte por queda é detectada corretamente no teste.
- Implementada telemetria de posição, velocidade, estado, checkpoints, portal e ataques do Guardião.
- O relatório distingue o que foi comprovado pelo teste completo de uma rota de testes de abertura/colisão.

### Ajuste real de gameplay — chefe final
- Segunda onda do ataque *slam* do Guardião acelerada de `-300` para `-440` unidades/segundo.
- Objetivo: concentrar as duas ondas em uma janela que pode ser esquivada com um salto bem sincronizado próximo do núcleo, sem remover a ameaça.
- Novo teste `tests/final-boss-logic-test.js` verifica o intervalo geométrico da segunda onda e evita regressão dessa janela.
- **Limite:** o chefe ainda não foi vencido no piloto automático; só a primeira redução de HP foi reproduzida. A alteração não equivale à certificação da luta.

### Prioridade seguinte
1. Melhorar/validar o percurso completo das fases 1, 3, 4 e 5 com entradas reais e simulações reproduzíveis; tratar trechos como bugs somente após reprodução independente.
2. Desenvolver estratégia de esquiva/ataque do Guardião até nove acertos e vitória, testar save e créditos finais.
3. Rodar as trajetórias aprovadas no Chromium com controle real de frames, medir FPS e capturar screenshots dos trechos críticos.
4. Manter o relatório concentrado neste documento, sem multiplicar changelogs por ajuste.

**Situação geral:** v1.27 com melhorias no chefe e testes de progressão. Não foi certificado o jogo inteiro de ponta a ponta.
