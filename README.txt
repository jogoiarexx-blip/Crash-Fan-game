CRASH BANDICOOT FÃ GAME — V1.02


V1.02 — FLORESTA RECONSTRUÍDA COM JUNGLE_TILES_SEPARADOS
- 36 PNGs integrados em assets/jungle/, todos registrados e utilizados na Fase 1.
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
  - boxes/                 -> caixas, TNT e checkpoint
  - traps/                 -> armadilhas
  - tiles/                 -> tilesets e cenário modular
  - backgrounds/           -> backgrounds e ruína do portal
  - ui/                    -> menu e seletor de fases
  - effects/               -> sprites de efeitos/morte
  - environment/           -> portal e objetos de ambiente
  - audio/                 -> músicas e efeitos sonoros
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
2. Templo Perdido
3. Pântano Sombrio
4. Picos Congelados
5. Cânion Rubro — fase inédita com rajadas de vento, sequências de TNT, prensas e plataformas alternadas

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
