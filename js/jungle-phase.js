// Gerado a partir de assets/jungle/manifest.json para a versão 1.02.
window.JUNGLE_SCALE = 0.72;
window.JUNGLE_ASSETS = {"waterfall":{"id":"waterfall_cliff_large","file":"assets/jungle/01_waterfall_cliff_large.png","category":"environment","width":425,"height":684,"role":"background environment"},"platformLongRoots":{"id":"platform_long_roots","file":"assets/jungle/02_platform_long_roots.png","category":"platform","width":244,"height":233,"role":"solid grass-top platform"},"platformLong":{"id":"platform_extra_long_vines","file":"assets/jungle/03_platform_extra_long_vines.png","category":"platform","width":392,"height":178,"role":"solid grass-top platform — replaced sprite 2026-08-27"},"platformTall":{"id":"platform_tall_vine","file":"assets/jungle/04_platform_tall_vine.png","category":"platform","width":170,"height":330,"role":"solid grass-top platform"},"platformMedium":{"id":"platform_medium_hanging_vines","file":"assets/jungle/05_platform_medium_hanging_vines.png","category":"platform","width":237,"height":216,"role":"solid grass-top platform"},"platformMediumRock":{"id":"platform_medium_stalactite","file":"assets/jungle/06_platform_medium_stalactite.png","category":"platform","width":176,"height":176,"role":"solid grass-top platform"},"stoneBlock":{"id":"stone_block_single","file":"assets/jungle/07_stone_block_single.png","category":"terrain","width":62,"height":55,"role":"solid terrain/stone"},"platformSmall":{"id":"platform_small","file":"assets/jungle/08_platform_small.png","category":"platform","width":161,"height":128,"role":"solid grass-top platform"},"slopeDown":{"id":"slope_down_long","file":"assets/jungle/09_slope_down_long.png","category":"slope","width":432,"height":263,"role":"walkable sloped terrain"},"stairPlatform":{"id":"stair_platform","file":"assets/jungle/10_stair_platform.png","category":"platform","width":286,"height":235,"role":"solid grass-top platform"},"stoneBlocksPair":{"id":"stone_blocks_pair","file":"assets/jungle/11_stone_blocks_pair.png","category":"terrain","width":85,"height":76,"role":"solid terrain/stone"},"floatingRock":{"id":"floating_rock_small","file":"assets/jungle/12_floating_rock_small.png","category":"terrain","width":62,"height":82,"role":"solid terrain/stone"},"steppedPlatform":{"id":"stepped_platform","file":"assets/jungle/13_stepped_platform.png","category":"platform","width":207,"height":161,"role":"solid grass-top platform"},"vinePole1":{"id":"vine_pole_01","file":"assets/jungle/14_vine_pole_01.png","category":"climbable","width":31,"height":341,"role":"decoration until climbing exists"},"vinePole2":{"id":"vine_pole_02","file":"assets/jungle/15_vine_pole_02.png","category":"climbable","width":52,"height":327,"role":"decoration until climbing exists"},"vinePole3":{"id":"vine_pole_03","file":"assets/jungle/16_vine_pole_03.png","category":"climbable","width":51,"height":295,"role":"decoration until climbing exists"},"bridgeSmall":{"id":"rope_bridge_small","file":"assets/jungle/17_rope_bridge_small.png","category":"bridge","width":233,"height":162,"role":"one-way wooden surface"},"palmLarge":{"id":"palm_tree_large","file":"assets/jungle/18_palm_tree_large.png","category":"decoration","width":250,"height":320,"role":"non-colliding scenery"},"flowerRed":{"id":"flower_red_small","file":"assets/jungle/19_flower_red_small.png","category":"decoration","width":97,"height":81,"role":"non-colliding scenery"},"bush1":{"id":"foliage_bush_01","file":"assets/jungle/20_foliage_bush_01.png","category":"decoration","width":108,"height":104,"role":"non-colliding scenery"},"bush2":{"id":"foliage_bush_02","file":"assets/jungle/21_foliage_bush_02.png","category":"decoration","width":143,"height":97,"role":"non-colliding scenery"},"foliageRed":{"id":"foliage_flower_red","file":"assets/jungle/22_foliage_flower_red.png","category":"decoration","width":126,"height":102,"role":"non-colliding scenery"},"palmSmall":{"id":"palm_tree_small","file":"assets/jungle/23_palm_tree_small.png","category":"decoration","width":189,"height":197,"role":"non-colliding scenery"},"mushrooms":{"id":"mushrooms_red","file":"assets/jungle/24_mushrooms_red.png","category":"decoration","width":144,"height":163,"role":"non-colliding scenery"},"clusterRed":{"id":"foliage_cluster_red","file":"assets/jungle/25_foliage_cluster_red.png","category":"decoration","width":216,"height":109,"role":"non-colliding scenery"},"foliagePurple":{"id":"foliage_flower_purple","file":"assets/jungle/26_foliage_flower_purple.png","category":"decoration","width":95,"height":86,"role":"non-colliding scenery"},"grass1":{"id":"grass_tuft_01","file":"assets/jungle/27_grass_tuft_01.png","category":"decoration","width":68,"height":53,"role":"non-colliding scenery"},"grass2":{"id":"grass_tuft_02","file":"assets/jungle/28_grass_tuft_02.png","category":"decoration","width":64,"height":45,"role":"non-colliding scenery"},"torch":{"id":"torch_fire","file":"assets/jungle/29_torch_fire.png","category":"object","width":51,"height":160,"role":"decorative or optional obstacle"},"bridgeLarge":{"id":"rope_bridge_large","file":"assets/jungle/30_rope_bridge_large.png","category":"bridge","width":408,"height":160,"role":"one-way wooden surface"},"signRight":{"id":"sign_arrow_right","file":"assets/jungle/31_sign_arrow_right.png","category":"object","width":92,"height":148,"role":"decorative or optional obstacle"},"rock1":{"id":"rock_formation_01","file":"assets/jungle/32_rock_formation_01.png","category":"decoration","width":160,"height":149,"role":"non-colliding scenery"},"totem":{"id":"stone_totem","file":"assets/jungle/33_stone_totem.png","category":"object","width":126,"height":149,"role":"decorative or optional obstacle"},"fallenLog":{"id":"fallen_log","file":"assets/jungle/34_fallen_log.png","category":"decoration","width":247,"height":108,"role":"non-colliding scenery"},"rock2":{"id":"rock_formation_02","file":"assets/jungle/35_rock_formation_02.png","category":"decoration","width":191,"height":107,"role":"non-colliding scenery"},"rock3":{"id":"rock_formation_03","file":"assets/jungle/36_rock_formation_03.png","category":"decoration","width":118,"height":100,"role":"non-colliding scenery"}};
window.JUNGLE_ASSET_GROUP = Object.fromEntries(Object.entries(window.JUNGLE_ASSETS).map(([k,v])=>["jungle_"+k,v.file]));
window.JUNGLE_COLLISION_PROFILES = {"platformLong":{"top":49,"left":8,"right":8,"depth":64},"platformLongRoots":{"top":28,"left":7,"right":7,"depth":62},"platformTall":{"top":22,"left":8,"right":8,"depth":58},"platformMedium":{"top":22,"left":7,"right":7,"depth":58},"platformMediumRock":{"top":26,"left":8,"right":8,"depth":58},"platformSmall":{"top":16,"left":7,"right":7,"depth":50},"slopeDown":{"leftTop":20,"rightTop":205,"left":8,"right":9,"depth":48},"bridgeSmall":{"top":76,"left":25,"right":25,"depth":16},"bridgeLarge":{"top":74,"left":30,"right":30,"depth":16},"stairPlatform":{"top":20,"left":6,"right":7,"depth":48,"segments":[[0,0,86],[83,34,90],[172,72,107]]},"steppedPlatform":{"top":12,"left":5,"right":5,"depth":48,"segments":[[0,98,67],[60,52,69],[125,8,77]]},"totem":{"top":0,"left":22,"right":22,"depth":125},"stoneBlock":{"top":1,"left":2,"right":2,"depth":50},"stoneBlocksPair":{"top":2,"left":3,"right":3,"depth":58},"floatingRock":{"top":3,"left":4,"right":4,"depth":54}};
window.JUNGLE_SECTORS = [
 {id:1,name:'INTRODUÇÃO',x0:0,x1:800,goal:'movimento e leitura'},
 {id:2,name:'PRIMEIROS DESAFIOS',x0:800,x1:1700,goal:'ponte, TNT e inclinação leve'},
 {id:3,name:'SUBIDA DA SELVA',x0:1700,x1:2700,goal:'subida natural e checkpoint'},
 {id:4,name:'DESAFIO VERTICAL',x0:2700,x1:3600,goal:'degraus + rota alta opcional'},
 {id:5,name:'DESCIDA / VELOCIDADE',x0:3600,x1:4500,goal:'retorno gradual à linha principal'},
 {id:6,name:'RETA FINAL',x0:4500,x1:5600,goal:'leitura limpa até o portal'}
];

window.JUNGLE_LEVEL_DATA = {
 scale:0.72,
 background:[
  {asset:'palmLarge',x:120,surfaceY:455,layer:'background'},
  {asset:'palmLarge',x:980,surfaceY:455,layer:'background'},
  {asset:'waterfall',x:2180,surfaceY:520,layer:'background',scaleMul:.92},
  {asset:'palmLarge',x:2780,surfaceY:455,layer:'background'},
  {asset:'palmLarge',x:3850,surfaceY:455,layer:'background'},
  {asset:'palmLarge',x:4860,surfaceY:455,layer:'background'},
  {asset:'vinePole1',x:2050,surfaceY:455,layer:'background'},
  {asset:'vinePole2',x:3380,surfaceY:455,layer:'background'},
  {asset:'vinePole3',x:4660,surfaceY:455,layer:'background'}
 ],
 terrain:[
  // SETOR 1 — linha principal quase plana, um buraco curto.
  {type:'platform',asset:'platformLong',x:0,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLong',x:260,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLong',x:635,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformMedium',x:890,surfaceY:455,collision:'solid'},

  // SETOR 2 — chão baixo + ponte + início de subida.
  {type:'platform',asset:'platformLong',x:1045,surfaceY:455,collision:'solid'},
  {type:'bridge',asset:'bridgeSmall',x:1300,surfaceY:455,collision:'oneWay'},
  {type:'platform',asset:'platformLong',x:1440,surfaceY:455,collision:'solid'},
  {type:'slope',asset:'slopeDown',x:1715,surfaceY:455,collision:'slopeUp',flipX:true,scaleMul:.52},

  // SETOR 3 — topo suave, pequena descida e área segura do checkpoint.
  {type:'platform',asset:'platformLong',x:1865,surfaceY:386,collision:'solid'},
  {type:'platform',asset:'platformMedium',x:2130,surfaceY:400,collision:'solid'},
  {type:'slope',asset:'slopeDown',x:2275,surfaceY:400,collision:'slopeDown',scaleMul:.42},
  {type:'platform',asset:'platformLong',x:2395,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLong',x:2655,surfaceY:455,collision:'solid'},

  // SETOR 4 — subida e descida em degraus. A rota normal nunca exige superpulo.
  {type:'platform',asset:'platformSmall',x:2915,surfaceY:430,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3010,surfaceY:405,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3105,surfaceY:380,collision:'solid'},
  {type:'platform',asset:'platformLong',x:3200,surfaceY:380,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3460,surfaceY:405,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3555,surfaceY:430,collision:'solid'},
  {type:'platform',asset:'platformLong',x:3650,surfaceY:455,collision:'solid'},

  // ROTA ALTA OPCIONAL — recompensa, não substitui a rota principal.
  {type:'platform',asset:'platformSmall',x:3015,surfaceY:332,collision:'solid'},
  {type:'platform',asset:'platformMedium',x:3165,surfaceY:300,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3335,surfaceY:286,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3448,surfaceY:246,collision:'solid'},
  {type:'platform',asset:'platformSmall',x:3565,surfaceY:214,collision:'solid'},

  // SETOR 5 — volta à linha Y455, ponte curta e corrida.
  {type:'platform',asset:'platformLong',x:3910,surfaceY:455,collision:'solid'},
  {type:'bridge',asset:'bridgeSmall',x:4160,surfaceY:455,collision:'oneWay'},
  {type:'platform',asset:'platformLong',x:4310,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLongRoots',x:4580,surfaceY:455,collision:'solid'},

  // SETOR 6 — reta final, um último buraco curto e área segura do portal.
  {type:'platform',asset:'platformSmall',x:4740,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLong',x:4945,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLong',x:5215,surfaceY:455,collision:'solid'},
  {type:'platform',asset:'platformLongRoots',x:5430,surfaceY:455,collision:'solid'}
 ],
 back:[
  {asset:'bush1',x:410,surfaceY:455,layer:'back'},
  {asset:'flowerRed',x:720,surfaceY:455,layer:'back'},
  {asset:'palmSmall',x:1110,surfaceY:455,layer:'back'},
  {asset:'mushrooms',x:1580,surfaceY:455,layer:'back'},
  {asset:'clusterRed',x:1960,surfaceY:386,layer:'back',scaleMul:.75},
  {asset:'bush2',x:2480,surfaceY:455,layer:'back'},
  {asset:'foliagePurple',x:2870,surfaceY:455,layer:'back'},
  {asset:'palmSmall',x:3710,surfaceY:455,layer:'back'},
  {asset:'rock2',x:4030,surfaceY:455,layer:'back',scaleMul:.72},
  {asset:'bush1',x:4680,surfaceY:455,layer:'back'},
  {asset:'rock3',x:5110,surfaceY:455,layer:'back',scaleMul:.7}
 ],
 objects:[
  {asset:'signRight',x:150,surfaceY:455,layer:'back',collision:'none'},
  {asset:'torch',x:1210,surfaceY:455,layer:'back',collision:'none',animated:'torch'},
  {asset:'totem',x:2020,surfaceY:386,layer:'back',collision:'none',scaleMul:.72},
  {asset:'fallenLog',x:3715,surfaceY:455,layer:'back',collision:'none',scaleMul:.74},
  {asset:'torch',x:5260,surfaceY:455,layer:'back',collision:'none',animated:'torch'}
 ],
 front:[
  // Apenas elementos baixos e afastados das bordas/hazards.
  {asset:'grass1',x:330,surfaceY:455,layer:'front',scaleMul:.72},
  {asset:'grass2',x:980,surfaceY:455,layer:'front',scaleMul:.72},
  {asset:'foliageRed',x:2550,surfaceY:455,layer:'front',scaleMul:.56},
  {asset:'grass1',x:3860,surfaceY:455,layer:'front',scaleMul:.65},
  {asset:'foliageRed',x:4760,surfaceY:455,layer:'front',scaleMul:.52}
 ]
};

window.JUNGLE_GAMEPLAY_DATA = {
 // Caixas em pequenos encontros, não espaçadas mecanicamente.
 boxes:[
  [150,455,false],[208,455,false],[330,455,true],
  [1115,455,false],[1177,455,true],
  [1515,455,false],[1577,455,false],
  [1940,386,false],[2002,386,true],
  [2460,455,false],[2522,455,false],
  [2960,430,false],[3055,405,true],
  [3740,455,false],[3802,455,false],[3864,455,true],
  [4410,455,false],[4472,455,true],
  [5025,455,false],[5087,455,false]
 ],
 tnts:[[1245,455],[2200,400],[4000,455],[5160,455]],
 bounceBoxes:[[3235,300,10]],
 masks:[[2080,300],[3598,140]],
 fruits:[
  // S1: apresenta caminho e ensina o primeiro buraco.
  [95,390],[175,390],[255,390],[470,385],[520,360],[570,330],[620,360],[685,390],
  // S2: linha da ponte, TNT e rampa.
  [930,390],[1040,385],[1140,385],[1345,400],[1405,390],[1500,380],[1660,385],[1740,370],[1800,340],[1860,310],
  // S3: acompanha topo e retorno ao chão/checkpoint.
  [1940,310],[2030,305],[2120,320],[2220,335],[2320,355],[2420,385],[2530,390],[2650,390],
  // S4: escada principal + arco de recompensa na rota alta.
  [2910,360],[2990,344],[3070,324],[3160,305],[3260,292],[3360,278],[3465,244],[3555,214],
  [3065,286],[3150,272],[3240,258],[3330,244],[3420,224],[3505,198],[3588,170],
  // S5: descida terminada, ponte e velocidade.
  [3710,390],[3820,390],[3940,390],[4170,395],[4235,380],[4300,395],[4410,390],[4520,390],
  // S6: último obstáculo e indicação clara do portal.
  [4630,390],[4740,390],[4850,365],[4905,340],[4965,365],[5050,390],[5160,390],[5260,385],[5340,380]
 ],
 enemies:[
  {x:730,a:680,b:835,v:52,surfaceY:455,type:'turtle'},
  {x:1535,a:1490,b:1660,v:-56,surfaceY:455,type:'armadillo'},
  {x:1980,a:1920,b:2080,v:48,surfaceY:386,type:'armadillo'},
  // Tartaruga especial: serve apenas para alcançar o segredo em Y220.
  {x:3290,a:3230,b:3400,v:42,surfaceY:380,type:'turtle'},
  {x:3835,a:3720,b:3970,v:-56,surfaceY:455,type:'armadillo'},
  {x:4630,a:4595,b:4680,v:55,surfaceY:455,type:'turtle'},
  {x:5040,a:4990,b:5115,v:-58,surfaceY:455,type:'armadillo'}
 ],
 hazards:[
  {type:'pit',x:545,y:455,w:90,h:120},
  {type:'pit',x:1315,y:455,w:135,h:120},
  {type:'pit',x:4170,y:455,w:140,h:120},
  {type:'pit',x:4855,y:455,w:95,h:120}
 ],
 spikes:[[3675,.15]],
 swing:[[4460,105,.25]],
 press:[]
};
