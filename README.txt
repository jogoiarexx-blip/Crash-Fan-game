CRASH BANDICOOT FÃ GAME — V1.16

V1.16 — CINEMÁTICA DE ABERTURA
- Nova abertura em vídeo de 18 segundos e resolução 1280×720 a 30 fps.
- Três cenas apresentam a Ilha Selvagem, a perseguição pela pedra e o Guardião das Nove Gemas.
- Movimento suave de câmera, transições, trilha original e rugido sincronizado do Guardião.
- Títulos narrativos e crédito final: Criado e desenvolvido por Luis Paulo Alves.
- O vídeo usa H.264 + AAC, possui apenas 1,7 MiB e está preparado para reprodução em navegadores e celulares.
- A cinemática inicia ao criar uma nova campanha; pode ser pulada por botão, ENTER, ESPAÇO, ESC ou gamepad.
- preload metadata evita baixar o vídeo inteiro no menu; a Fase 1 só é carregada após a abertura.
- Dispositivos com preferência de movimento reduzido seguem diretamente para o jogo.

V1.15 — GUARDIÃO DAS NOVE GEMAS
- O Templo da Conquista agora é a décima fase jogável e a batalha final da campanha.
- Novo chefe original em sprite-sheet WebP transparente 4×3: repouso, impacto, gemas, fogo, gelo, dano e derrota.
- A luta possui 9 pontos de vida e três estágios coerentes: Selva Ancestral, Cânion Ardente e Gelo Eterno.
- O Guardião alterna ondas de impacto, rajadas de gemas, colunas de fogo e espinhos de gelo.
- Após cada ataque, o núcleo abre por tempo limitado e recebe dano do giro do Crash.
- Arena WebP exclusiva, barra de vida, avisos de ataque, cinemática de entrada e sequência de vitória.
- Música própria de 16 segundos e sete efeitos exclusivos, todos mono 22,05 kHz/16-bit.
- Recursos do chefe são carregados somente na fase 10 e liberados ao sair.
- Progresso do chefe e troféu Guardião Vencido ficam registrados no save.
- Créditos e final exibem: Criado e desenvolvido por Luis Paulo Alves.

V1.14 — PROGRESSÃO INDIVIDUAL E TEMPLO DA CONQUISTA
- Gemas agora são permanentes e registradas separadamente para cada uma das nove fases.
- Cada fase guarda conclusão, cristal, melhor tempo, pontuação, caixas, mortes, colisões, combo e esquivas.
- Saves V1.13 são migrados automaticamente sem apagar vidas, frutas, cristais ou troféus.
- Seletor mostra gema, cristal e conclusão diretamente em cada pedestal.
- Painel lateral exibe os recordes reais da fase selecionada, em vez dos números da última fase jogada.
- Preview do seletor é carregado independentemente e continua visível após liberar os assets da fase anterior.
- Botão VOLTAR visível foi incluído no seletor para mouse e celular.
- O décimo pedestal virou o Templo da Conquista e abre após concluir as nove fases.
- Nova tela de conclusão calcula o progresso total entre fases, gemas e cristais.
- Troféus agora possuem três páginas sem ultrapassar a tela e sete novas conquistas de campanha.
- Nova campanha inicia corretamente com nove posições de cristal.
- Suíte automatizada cobre migração V1.13 e progresso individual por fase.

V1.13 — TRILHA SONORA E EFEITOS ORIGINAIS
- As nove fases receberam músicas próprias de 16 segundos, compostas para repetição contínua.
- Selva, templo, pântano, gelo, cânion, avalanche, corrida polar, pedra e javali possuem ritmo e timbres coerentes com o bioma.
- Quatorze efeitos foram refeitos: pulo, giro, caixa, TNT, explosão, fruta, Aku Aku, checkpoint, dano, morte, inimigo, portal, menu e pouso.
- A invencibilidade ganhou uma camada musical própria de 8 segundos.
- Volumes são equilibrados individualmente para efeitos fortes não encobrirem a música.
- Um pool de áudio reutiliza vozes e reduz alocações, atraso e microtravadas durante ações repetidas.
- Todos os WAV são mono, 22,05 kHz e 16-bit, mantendo qualidade adequada com tamanho reduzido.

V1.12 — ARTE COMPLETA DAS FASES ESPECIAIS
- Avalanche Alpina, Corrida Polar, Pedra da Selva e Corrida do Javali agora possuem backgrounds exclusivos.
- Duas cartelas WebP transparentes adicionam oito obstáculos de gelo e oito obstáculos tropicais.
- Obstáculos provisórios desenhados por formas foram substituídos pelos novos sprites nas pistas pseudo-3D.
- As quatro fases especiais receberam músicas próprias de 12 segundos, originais e preparadas para repetição.
- Fundo, obstáculos, veículo/perseguidor e música entram na memória somente junto da fase atual.
- A campanha mantém as nove fases e a ordem coerente por biomas.

V1.11 — DOIS NOVOS DESAFIOS E CAMPANHA POR BIOMAS
- O jogo agora possui 9 fases completas; somente a posição 10 permanece como EM BREVE.
- Nova Pedra da Selva: perseguição frontal por uma pedra ancestral coberta de musgo.
- Nova Corrida do Javali: montaria tropical em três faixas com corrida, desvio, salto, pouso e queda.
- Os dois sprites são inéditos, recortados em células de 256×256, ancorados e convertidos para WebP transparente.
- Pedra da Selva usa seis quadros de rotação; Corrida do Javali usa oito poses próprias.
- Obstáculos tropicais usam troncos, pedras, caixas e frutas, com paleta e vegetação da selva.
- As fases novas têm padrões e dificuldade próprios; não são apenas cópias visuais das fases de gelo.
- Ordem da campanha reorganizada: Selva 1–3, Templo/Pântano/Cânion 4–6 e Gelo 7–9.
- IDs internos foram preservados, evitando quebrar assets e lógica existentes.
- Saves V1.10 e anteriores são migrados automaticamente para a nova ordem de progressão.
- Cada uma das 9 fases possui cristal persistente; seletor, slots, HUD, introduções e resultados foram atualizados.
- Os assets exclusivos das fases 8 e 9 são carregados apenas quando usados e liberados ao trocar de fase.
- Projeto agora possui 98 mídias válidas, sem duplicatas ou arquivos sem referência.

V1.10 — COMBOS, ESQUIVAS E CÂMERA DINÂMICA
- Avalanche Alpina e Corrida Polar agora possuem corrente de combo com multiplicador de pontos.
- Coletar frutas mantém a corrente; saltar perto de um obstáculo registra uma esquiva arriscada e dá bônus.
- O combo expira se o jogador ficar sem coletar ou esquivar e é interrompido ao colidir.
- HUD mostra o combo em tempo real; resultados exibem esquivas e o melhor combo da tentativa.
- Obstáculos perigosos na faixa escolhida recebem alerta visual conforme se aproximam.
- A câmera inclina suavemente durante a troca de faixa e reage à proximidade da avalanche.
- Movimento reduzido desativa a inclinação; qualidade Baixa remove esse custo visual.
- Fragmentos de caixas agora respeitam a opção gráfica: menos partículas em aparelhos modestos.
- Esquivas e colisões das fases especiais são preservadas corretamente nos checkpoints e saves.
- Nenhum asset novo ou duplicado foi necessário; as 96 mídias continuam organizadas e referenciadas.

V1.09 — MORTES ESPECÍFICAS E QUALIDADE ADAPTATIVA
- Nove causas de morte agora possuem linguagem visual própria: impacto, queda, espinhos, explosão, prensa, congelamento, veneno, avalanche e tombo do urso.
- Queda despenca; espinhos enrijecem; explosão lança e gira; prensa achata; gelo congela; veneno cambaleia; colisão comum dá cambalhota.
- A avalanche cobre e comprime o Crash na direção da câmera; na Corrida Polar, Crash e urso tombam juntos com neve levantada.
- A alma alada só é carregada nas fases 1–5, onde aparece. Avalanche Alpina e Corrida Polar não reservam esse asset.
- Nova opção GRÁFICOS em Configurações e no pause: Auto, Baixa, Média e Alta.
- O modo Auto considera memória, núcleos do dispositivo e preferência de movimento reduzido.
- Partículas, detalhes de cenário, neve, sombras e densidade do efeito Mode 7 se adaptam à qualidade escolhida.
- Configuração gráfica fica salva no navegador.
- 96 mídias continuam organizadas, todas referenciadas, sem duplicatas exatas e com raster de gameplay em WebP.

V1.08 — PERSEGUIÇÃO FRONTAL E INTRODUÇÃO DO URSO
- Avalanche Alpina refeita como corrida em direção à câmera, com perspectiva pseudo-3D.
- Três faixas, salto, obstáculos em profundidade, velocidade crescente e checkpoint.
- A bola de neve aparece atrás do Crash, cresce e avança visualmente conforme o perigo aumenta.
- Colisões reduzem a distância segura; o medidor do HUD avisa quando a avalanche está perto.
- Corrida Polar começa com Crash se aproximando, saltando para o urso e fazendo a expressão de sobrancelha.
- A introdução pode ser pulada com ENTER/ESPAÇO e respeita a preferência de movimento reduzido.
- Nenhuma mídia defeituosa ou repetida foi adicionada; os assets continuam carregados por fase.

V1.07 — AVALANCHE, CORRIDA POLAR E MORTES ESPECÍFICAS
- O jogo agora possui 7 fases jogáveis; apenas as posições 8–10 permanecem como EM BREVE.
- Fase 6, Avalanche Alpina: perseguição lateral por uma bola de neve animada que acelera gradualmente.
- Fase 7, Corrida Polar: Crash monta no urso em pista pseudo-3D estilo Mode 7, com três faixas, salto, obstáculos, frutas, velocidade crescente e checkpoint.
- Sprite WebP da avalanche com seis quadros exclusivos e recortados.
- Sprite WebP de Crash no urso com oito poses: corrida, desvio, salto e aterrissagem.
- Os novos sprites pertencem somente aos grupos phase6 e phase7 e são liberados da memória ao trocar de fase.
- Mortes específicas para queda, espinhos, explosão, prensa, gelo, veneno, avalanche, tombo do urso e colisão comum.
- Saves antigos que já concluíram a Fase 5 liberam automaticamente a Fase 6.
- Menu Como Jogar, seletor, resultados, cristais e progressão atualizados para sete fases.
- Testes cobrem carregamento das sete fases, perseguição, corrida, controles, conclusão e 137/137 superfícies técnicas alcançáveis.

V1.06 — MORTE CINEMATOGRÁFICA E RESPAWN SINCRONIZADO
- A animação de morte agora tem reação ao dano, tombo com vários quadros do Crash, impacto e achatamento no chão.
- Fragmentos pixelados, onda de impacto e clarão reforçam o momento sem adicionar imagens duplicadas.
- A alma alada ganhou seis quadros animados, balanço lateral, aceleração suave, rastro, auréola e fade.
- Barras cinematográficas e mensagens distinguem perda de vida e fim da tentativa.
- Quedas fora do mapa reposicionam a animação verticalmente para ela não acontecer fora da tela.
- Respawn e game over agora obedecem ao mesmo relógio da animação, removendo a janela de controle indevida.
- prefers-reduced-motion usa uma versão curta e sem partículas de dispersão.
- Novo teste automatizado valida início, perda de vida, conclusão e respawn.

V1.05 — PADRÃO VISUAL E ORGANIZAÇÃO DE ASSETS
- Tatu, besouro de magma e morcego de brasa refeitos no padrão 32-bit do Crash.
- Nova animação transparente de sete quadros para Crash equipando Aku Aku.
- Todos os novos quadros usam recorte individual e ancoragem estável.
- Cartela tropical duplicada removida; fases 2 e 5 reutilizam os sprites individuais de assets/jungle/.
- Fallbacks antigos de prensa e tronco e tilesets sem uso foram removidos.
- Auditoria automática garante zero arquivos de mídia duplicados, ausentes ou sem uso.
- Pastas seguem função única: characters, enemies, boxes, traps, tiles, jungle, backgrounds, effects, environment, items, ui e audio.

V1.04 — SPRITES, RECORTES, WEBP E CINEMÁTICAS
- Novas folhas animadas para tatu, besouro de magma e morcego de brasa.
- Tatu alterna caminhada/rolagem; besouro alterna caminhada/carga; morcego alterna voo/ataque.
- Recortes individuais e ancoragem inferior eliminam tremor, achatamento e variação dos pés.
- Agachar e deslizar do Crash usam os limites reais de cada quadro da folha existente.
- Assets raster de gameplay convertidos para WebP; PNG mantido somente nos ícones PWA.
- Introdução cinematográfica por fase e transição cinematográfica no portal.
- Cinemática pode ser pulada e respeita prefers-reduced-motion.
- Plataformas elevadas receberam borda visual de pouso sem alterar a colisão validada.
- Todas as 120 superfícies das cinco fases permanecem alcançáveis nos testes.

V1.03 — ESTABILIDADE DE GAMEPLAY E CONTROLES
- Corrigido o carry-over de frutas: morrer antes do checkpoint não apaga mais as frutas trazidas da fase anterior.
- O valor inicial de frutas de cada fase agora também é salvo e restaurado com compatibilidade para saves antigos.
- Caixa de vida credita a vida imediatamente; interromper a animação não perde mais a recompensa e não duplica vidas.
- Ao perder foco, minimizar ou trocar de aplicativo, o jogo pausa e limpa teclado/joystick para evitar movimento preso.
- Configurações de controles corrompidas são normalizadas automaticamente para padrões seguros.
- Abrir CONTROLES pelo pause não descarrega mais a fase e VOLTAR retorna ao pause.
- REINICIAR FASE preserva somente as frutas trazidas ao início, impedindo duplicação de coletáveis.
- Teste automatizado ampliado para movimento, pulo, renderização, pausa, recompensa de vida e carry-over.


V1.02 — FLORESTA RECONSTRUÍDA COM JUNGLE_TILES_SEPARADOS
- 36 imagens WebP integradas em assets/jungle/, todas registradas e utilizadas na Fase 1.
- assets/jungle/manifest.json enriquecido com key, role e collision_profile.
- js/jungle-phase.js centraliza registry, escala global, dados da fase e gameplay da floresta.
- escala global JUNGLE_SCALE = 0.72; nenhuma imagem é esticada por eixo.
- plataformas/terrain usam colisão apenas na área sólida sob a grama.
- ponte pequena/grande: colisão one-way apenas na madeira; é possível passar por baixo.
- rampa slope_down_long: colisão inclinada real, acompanhada pelo personagem e inimigo configurado para a rampa.
- climbables permanecem decorativos enquanto não houver mecânica de escalada.
- cachoeira fica no background e não cria piso sobre a água.
- objetos decorativos não bloqueiam; totem usa apenas obstáculo coerente com o corpo de pedra.
- ordem: background > ambiente distante > terreno > decoração traseira > gameplay > Crash > foreground > HUD.
- caixas, TNT e patrulhas foram auditadas para permanecer apoiadas.

COMO ABRIR
1. Extraia o ZIP inteiro.
2. Mantenha as pastas index.html, css/, js/ e assets/ juntas.
3. Recomendado no Windows: execute INICIAR-JOGO.bat.
4. O jogo abrirá em http://127.0.0.1:8000/ e evita as restrições de segurança do file://.
5. Abrir index.html diretamente ainda pode funcionar, mas alguns navegadores exibem avisos de origem local.

ESTRUTURA DO PROJETO
- index.html               -> entrada única do jogo
- css/style.css            -> todo o visual da página/canvas
- js/game.js               -> gameplay, menus, saves, AssetManager e fases
- assets/                  -> recursos organizados por categoria
  - characters/            -> Crash e Aku Aku
  - enemies/               -> inimigos
  - bosses/                -> chefe final e suas animações
  - boxes/                 -> caixas, TNT e checkpoint
  - traps/                 -> armadilhas
  - tiles/                 -> tilesets e cenário modular
  - obstacles/             -> cartelas de obstáculos das pistas pseudo-3D
  - backgrounds/           -> backgrounds e ruína do portal
  - ui/                    -> menu e seletor de fases
  - effects/               -> sprites de efeitos/morte
  - environment/           -> portal e objetos de ambiente
  - audio/                 -> músicas e efeitos sonoros
  - cinematics/            -> vídeo de abertura otimizado
- ASSET-MANIFEST.txt       -> relação dos assets carregados

V0.6 — FASE 1 REFEITA
A Ilha Selvagem foi redesenhada em medidas padronizadas para combinar colisão e arte:
- chão em 7 blocos contínuos;
- buracos padronizados em 128 px;
- plataformas baixas em y=365: alcançáveis com salto normal;
- plataformas altas em y=335: rota superior, alcançada pelas baixas;
- espaço suficiente para passar por baixo das plataformas altas;
- túnel em y=370: só passa agachado/escorregando;
- caixas e TNT apoiadas exatamente no piso/plataformas;
- inimigos patrulham somente trechos com chão e não entram em buracos;
- checkpoint com área livre;
- armadilhas têm espaço de leitura antes/depois;
- tiles de chão/plataforma são desenhados como peças contínuas para reduzir cortes visuais.

FÍSICA DE REFERÊNCIA
- Crash em pé: 78 px
- Crash agachado: 48 px
- salto máximo aproximado: 102 px
- plataforma baixa: 90 px acima do chão
- plataforma alta: 120 px acima do chão, 30 px acima da plataforma baixa
- túnel: 57 px de vão (passa agachado, não passa em pé)
- buracos: 128 px; alcance horizontal aproximado do salto em velocidade máxima: 218 px

FASES
1. Ilha Selvagem — refeita
2. Pedra da Selva — perseguição frontal pela pedra ancestral
3. Corrida do Javali — montaria tropical em câmera Mode 7
4. Templo Perdido
5. Pântano Sombrio
6. Cânion Rubro — rajadas de vento, TNT, prensas e plataformas alternadas
7. Picos Congelados
8. Avalanche Alpina — perseguição frontal pela bola de neve gigante
9. Corrida Polar — Crash montado no urso em pista pseudo-3D estilo Mode 7
10. Templo da Conquista — batalha final contra o Guardião das Nove Gemas

OUTROS RECURSOS
- 3 slots de save
- auto-save em checkpoint/fim da fase
- seletor de fases
- teclado configurável
- gamepad PlayStation/Xbox/genérico
- menu de pause
- tela de resultado, gema e troféus
- AssetManager com carregamento sob demanda
- assets WebP otimizados quando apropriado

Observação: projeto de fã, não oficial.

CORREÇÕES DE GAMEPLAY — ARMADILHAS / MORTE
- Espinhos retráteis com janela segura, aviso visual e hitbox sincronizada.
- Tronco balançando refeito com pivô, corda, movimento pendular e hitbox coerente.
- Prensa de pedra reprogramada: espera, aviso, queda rápida, pausa e retorno lento.
- Animação de morte refeita: corpo tomba e a alma azul do Crash com asas + auréola sobe antes do respawn.
- Tartaruga usa sprite completo e animação de caminhada corrigida.
- Plataformas finas usam colisão de cima para permitir passar por baixo.
- Inimigos agora respeitam caixas/TNT e viram ao encontrar obstáculos.

V0.7 — MELHORIAS DE ARMADILHAS E ESTABILIDADE
- novos sprites transparentes para espinhos retráteis, tronco pendular e prensa de pedra;
- novos sprites de superfície venenosa e espinhos de gelo;
- carregamento de imagens via Blob com timeout e fallback de fundo;
- gamepad conectado localizado em qualquer índice, não apenas no primeiro;
- saves normalizados e protegidos contra valores inválidos;
- desbloqueio ajustado às cinco fases implementadas;
- arquivos JPEG corrigidos para extensão .jpg e MIME compatível.

Os novos sprites ficam em assets/traps/trap_* e são carregados junto dos recursos compartilhados.

V0.8 — CÂNION RUBRO
A quinta fase usa os tiles existentes em uma composição inédita de cânion vulcânico, com filtro cromático, rajadas que empurram Crash, plataformas alternadas, três troncos, duas prensas, trechos de espinhos, quatro TNTs em sequência, rota superior e novos posicionamentos de inimigos e colecionáveis.

Inimigos exclusivos do Cânion Rubro:
- Besouro de magma: patrulha o solo em velocidade variável, possui carapaça incandescente e não pode ser derrotado apenas pulando; exige giro ou escorregão.
- Morcego de brasa: inimigo aéreo que oscila verticalmente sobre as plataformas e exige temporização de salto ou giro.
- Ambos usam sprites transparentes próprios e mensagens de derrota específicas.



V0.9.1 — ESTABILIZAÇÃO
- Corrigida a função ausente isSemiPlatform, eliminando o ReferenceError durante colisões.
- Semi-plataformas agora permanecem atravessáveis por baixo/lateral e sólidas ao cair por cima.
- Crash não volta à altura em pé quando existe teto, caixa, TNT ou obstáculo sólido sobre ele.
- Colisão vertical usa o bottom anterior do personagem para reduzir engates e teleporte em bordas.
- Saves passam a usar namespace crashV091Slot e continuam lendo saves antigos V0.6/V0.5.
- Fases 6 a 10 aparecem explicitamente como EM BREVE no seletor.
- Controles multitouch adicionados para celular: esquerda, direita, agachar/slide, pulo e giro podem ser combinados.
- Culling visual reduz desenhos de objetos muito fora da câmera.
- Incluído INICIAR-JOGO.bat para iniciar servidor local e evitar problemas do protocolo file://.
- Identificação interna atualizada para V0.9.1.


V0.9.4 - CONTROLES MOBILE
- Joystick virtual com zona morta e movimento deslizante.
- Multitouch real: mover + pular + girar simultaneamente.
- Botao de pausa dedicado.
- Reset automatico de toques para evitar comandos presos.
- Layout responsivo com safe areas para celulares com notch.


V0.9.7 - CORREÇÃO DE SOBREPOSIÇÃO DE ARMADILHAS
- Fase 1: espinhos e armadilha suspensa foram afastados.
- Caixa e TNT do corredor foram reposicionadas.
- Nova verificação automática remove caixas/TNT de zonas de ação de armadilhas.


V1.0.4 — REVISÃO ESTRUTURAL DE COLISÕES
- física separada por eixo X e eixo Y;
- colisão lateral não pode mais cancelar ou inverter o pulo;
- plataformas, pedras, caixas e TNT usam resolução consistente;
- posição do frame anterior define contato por cima/baixo;
- jump buffer e coyote time mantidos;
- correção de quinas e micro-penetrações sem empurrar Crash para baixo;
- encaixe automático de até 4 px no chão para estabilidade sem criar piso sobre buracos;
- casco da tartaruga corrigido para distinguir lado, topo e parte inferior;
- formato de save mantido para preservar compatibilidade com saves anteriores.


V1.0.7 — ORGANIZAÇÃO DE CAIXAS / TNT / CHECKPOINT
- Checkpoint agora possui posição própria por fase e nunca é desenhado sobre buraco ou dentro de plataforma.
- Caixa normal, TNT e checkpoint não podem ocupar o mesmo espaço.
- Objetos são validados para ficar totalmente apoiados em uma superfície válida.
- Conflitos com pedras, espinhos, prensas e armadilhas são reposicionados em vez de apagados.
- A contagem original de caixas e TNT é preservada em todas as fases.
- Fase 1: removida a sobreposição direta entre checkpoint e TNT.


V1.0.8 — BACKGROUND DE FASE TRAVADO
- Background sempre obtido pelo currentLevel; nunca reutiliza imagem da fase anterior.
- Removido fallback bgImg anterior em bindPhaseAssets.
- Fase 5 agora possui background_fase5.webp próprio para CÂNION RUBRO.
- Pré-carregamento da próxima fase não altera o cenário visível da fase atual.

v1.02 - Cristais por fase
- Adicionado 1 cristal azul coletável em cada uma das 5 fases.
- Cristais são registrados individualmente no save e permanecem obtidos após coleta.
- HUD, resultados e seletor de fases exibem o progresso dos cristais.
- Asset: assets/items/crystal_blue.webp.
