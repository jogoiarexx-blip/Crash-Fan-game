// Configuração central de recursos exclusivos de cada fase — v1.16.
// CORE e SHARED ficam no game.js; apenas LEVEL ASSETS entram e saem da memória.
window.LEVEL_CONFIG = {
  1:{name:'ILHA SELVAGEM', tip:'Wumpas indicam caminhos e saltos seguros.', assets:{
    bg1:'assets/backgrounds/background_fase1.webp',
    ...(window.JUNGLE_ASSET_GROUP||{}),
    soul:'assets/effects/death_winged_soul.webp',music1:{type:'audio',url:'assets/audio/music_phase1.wav'}
  }},
  2:{name:'TEMPLO PERDIDO', tip:'Observe o ritmo das armadilhas antes de avançar.', assets:{
    bg2:'assets/backgrounds/background_fase2.webp',tile:'assets/tiles/tileset_ground_custom.webp',
    p2_totem:'assets/jungle/33_stone_totem.webp',p2_vine:'assets/jungle/15_vine_pole_02.webp',p2_tree2:'assets/jungle/23_palm_tree_small.webp',
    p2_flowers:'assets/jungle/22_foliage_flower_red.webp',p2_torch:'assets/jungle/29_torch_fire.webp',p2_mushroom:'assets/jungle/24_mushrooms_red.webp',
    p2_rockA:'assets/jungle/32_rock_formation_01.webp',p2_rockB:'assets/jungle/35_rock_formation_02.webp',p2_rockC:'assets/jungle/36_rock_formation_03.webp',
    soul:'assets/effects/death_winged_soul.webp',music2:{type:'audio',url:'assets/audio/music_phase2.wav'}
  }},
  3:{name:'PÂNTANO SOMBRIO', tip:'Alguns inimigos ficam mais fáceis quando atacados pelo alto.', assets:{
    bg3:'assets/backgrounds/background_fase3.webp',biomeTile3:'assets/tiles/swamp_tiles.webp',biomeEnemy3:'assets/enemies/swamp_enemies.webp',poisonAsset:'assets/traps/trap_poison_surface.webp',
    soul:'assets/effects/death_winged_soul.webp',music3:{type:'audio',url:'assets/audio/music_phase3.wav'}
  }},
  4:{name:'PICOS CONGELADOS', tip:'No gelo, planeje o salto antes de ganhar velocidade.', assets:{
    bg4:'assets/backgrounds/background_fase4.webp',biomeTile4:'assets/tiles/ice_tiles.webp',biomeEnemy4:'assets/enemies/ice_enemies.webp',iceSpikeAsset:'assets/traps/trap_ice_spikes.webp',
    soul:'assets/effects/death_winged_soul.webp',music4:{type:'audio',url:'assets/audio/music_phase4.wav'}
  }},
  5:{name:'CÂNION RUBRO', tip:'Use a direção do vento a seu favor nos saltos longos.', assets:{
    bg5:'assets/backgrounds/background_fase5.webp',tile:'assets/tiles/tileset_ground_custom.webp',p5_rockA:'assets/jungle/32_rock_formation_01.webp',p5_rockB:'assets/jungle/35_rock_formation_02.webp',p5_rockC:'assets/jungle/36_rock_formation_03.webp',p5_totem:'assets/jungle/33_stone_totem.webp',magmaBeetle:'assets/enemies/magma_beetle_sheet_v105.webp',emberBat:'assets/enemies/ember_bat_sheet_v105.webp',
    soul:'assets/effects/death_winged_soul.webp',music5:{type:'audio',url:'assets/audio/music_phase5.wav'}
  }},
  6:{name:'AVALANCHE ALPINA', tip:'Corra em direção à câmera, troque de faixa e não deixe a avalanche encostar.', assets:{
    bg6:'assets/backgrounds/background_fase6_avalanche.webp',roadObstacles:'assets/obstacles/ice_road_obstacles_v112.webp',
    snowball:'assets/traps/avalanche_snowball_sheet_v107.webp',
    music6:{type:'audio',url:'assets/audio/music_phase6.wav'}
  }},
  7:{name:'CORRIDA POLAR', tip:'Crash monta no urso antes da largada; depois, troque de faixa e pule.', assets:{
    bg7:'assets/backgrounds/background_fase7_polar.webp',roadObstacles:'assets/obstacles/ice_road_obstacles_v112.webp',bearRide:'assets/vehicles/polar_bear_ride_sheet_v107.webp',
    music7:{type:'audio',url:'assets/audio/music_phase7.wav'}
  }},
  8:{name:'PEDRA DA SELVA', tip:'Fuja da pedra ancestral, troque de faixa e use saltos próximos para criar combos.', assets:{
    bg8:'assets/backgrounds/background_fase8_pedra_selva.webp',roadObstacles:'assets/obstacles/jungle_road_obstacles_v112.webp',boulder:'assets/traps/jungle_boulder_sheet_v111.webp',
    music8:{type:'audio',url:'assets/audio/music_phase8.wav'}
  }},
  9:{name:'CORRIDA DO JAVALI', tip:'Monte no javali e desvie de pedras, caixas e troncos em três faixas.', assets:{
    bg9:'assets/backgrounds/background_fase9_javali.webp',roadObstacles:'assets/obstacles/jungle_road_obstacles_v112.webp',boarRide:'assets/vehicles/jungle_boar_ride_sheet_v111.webp',
    music9:{type:'audio',url:'assets/audio/music_phase9.wav'}
  }},
  10:{name:'TEMPLO DA CONQUISTA', tip:'Observe o ataque, desvie e use o giro quando o núcleo dourado ficar vulnerável.', assets:{
    bg10:'assets/backgrounds/temple_conquest_arena.webp',bossGuardian:'assets/bosses/guardian_nine_gems_sheet.webp',
    music10:{type:'audio',url:'assets/audio/music_boss_guardian.wav'},bossRoar:{type:'audio',url:'assets/audio/boss_roar.wav'},bossSlam:{type:'audio',url:'assets/audio/boss_slam.wav'},bossGem:{type:'audio',url:'assets/audio/boss_gem.wav'},bossFire:{type:'audio',url:'assets/audio/boss_fire.wav'},bossIce:{type:'audio',url:'assets/audio/boss_ice.wav'},bossHit:{type:'audio',url:'assets/audio/boss_hit.wav'},bossDefeat:{type:'audio',url:'assets/audio/boss_defeat.wav'}
  }}
};
window.LOADING_TIPS = Object.fromEntries(Object.entries(window.LEVEL_CONFIG).map(([k,v])=>[k,v.tip]));
window.LEVEL_ASSET_GROUPS = Object.fromEntries(Object.entries(window.LEVEL_CONFIG).map(([k,v])=>['phase'+k,v.assets]));
