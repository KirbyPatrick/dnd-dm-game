// Each sprite is a ~12x12 grid. Every char maps to a color in `palette`;
// '.' (or any char not in the palette) is transparent. Rendered as crisp SVG
// rects by <PixelSprite>, so they scale to any size without blurring.
export interface SpriteDef {
  palette: Record<string, string>
  rows: string[]
}

// Party member sprite kinds (class-based). Keep in sync with src/main/index.ts.
export const PARTY_KINDS = [
  'fighter',
  'wizard',
  'rogue',
  'cleric',
  'ranger',
  'bard',
  'ally'
] as const

// Curse of Strahd enemy roster. Keep in sync with ENEMY_KINDS in src/main/index.ts.
export const ENEMY_KINDS = [
  'strahd',
  'vampire',
  'vampire-spawn',
  'werewolf',
  'wolf',
  'zombie',
  'skeleton',
  'ghost',
  'wraith',
  'bat',
  'spider',
  'vistani',
  'villager',
  'raven',
  'scarecrow',
  'mist',
  'default'
] as const

export const SPRITES: Record<string, SpriteDef> = {
  // ----- Curse of Strahd foes -----
  strahd: {
    palette: { k: '#101014', s: '#d6d0d4', e: '#e23b3b', r: '#8f1717' },
    rows: [
      '..kkkkkkkk..',
      '.kkkkkkkkkk.',
      '.kssssssssk.',
      '.ssssssssss.',
      '.ssessssess.',
      '.ssssssssss.',
      '.sssrrrrsss.',
      '.ssssssssss.',
      '.rrrrrrrrrr.',
      '.krrrrrrrrk.',
      '.kk......kk.',
      '............'
    ]
  },
  vampire: {
    palette: { k: '#1a1430', s: '#cfc6cf', e: '#cc2222', m: '#7a1010', w: '#ffffff' },
    rows: [
      '............',
      '..kkkkkkkk..',
      '.kkkkkkkkkk.',
      '.kssssssssk.',
      '.ssessssess.',
      '.ssssssssss.',
      '.sssmwwmsss.',
      '.ssssssssss.',
      '..ssssssss..',
      '...kkkkkk...',
      '............',
      '............'
    ]
  },
  'vampire-spawn': {
    palette: { s: '#aeb39a', e: '#dd3333', w: '#ffffff', k: '#1a1a1a' },
    rows: [
      '............',
      '..ssssssss..',
      '.ssssssssss.',
      '.ssessssess.',
      '.ssssssssss.',
      '.swwwwwwwws.',
      '.swkwkwkkws.',
      '.ssssssssss.',
      '..ssssssss..',
      'k..k....k..k',
      '............',
      '............'
    ]
  },
  werewolf: {
    palette: { f: '#6b5a45', d: '#33291f', y: '#e8d24a', w: '#ffffff', k: '#120f0a' },
    rows: [
      '.d........d.',
      '.df......fd.',
      '..ffffffff..',
      '.ffffffffff.',
      '.fyffffffyf.',
      '.ffffffffff.',
      '..ffffffff..',
      '...fkkkkf...',
      '..fwkkkkwf..',
      '..fwwwwwwf..',
      '...dffffd...',
      '............'
    ]
  },
  wolf: {
    palette: { f: '#5b5560', d: '#2b2731', y: '#d9c24a', k: '#111111', w: '#ffffff' },
    rows: [
      '.d........d.',
      '.df......fd.',
      '..ffffffff..',
      '.ffffffffff.',
      '.fyffffffyf.',
      '.ffffffffff.',
      '..ffffffff..',
      '...ffkkff...',
      '...fkkkkf...',
      '...fwffwf...',
      '....ffff....',
      '............'
    ]
  },
  zombie: {
    palette: { g: '#6e7d5a', d: '#46532f', k: '#161616', b: '#8a1f1f' },
    rows: [
      '............',
      '..gggggggg..',
      '.gggggggggg.',
      '.gdgggggddg.',
      '.gkgggggkkg.',
      '.gggggggggg.',
      '.gggdgggggg.',
      '.ggggggggkg.',
      '.gbggggkggg.',
      '..gggggggg..',
      '...g....g...',
      '............'
    ]
  },
  skeleton: {
    palette: { b: '#ececec', k: '#161616', s: '#bdbdbd' },
    rows: [
      '...bbbbbb...',
      '..bbbbbbbb..',
      '.bbbbbbbbbb.',
      '.bkkbbbbkkb.',
      '.bkkbbbbkkb.',
      '.bbbbbbbbbb.',
      '.bbbbkkbbbb.',
      '.bbbbbbbbbb.',
      '..bbbbbbbb..',
      '..bkbkbkbk..',
      '..bbbbbbbb..',
      '............'
    ]
  },
  ghost: {
    palette: { w: '#eef0ff', s: '#c3c8e8', k: '#2a2a3a' },
    rows: [
      '...wwwwww...',
      '..wwwwwwww..',
      '.wwwwwwwwww.',
      '.wwkkwwkkww.',
      '.wwkkwwkkww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.w.ww.ww.ww.',
      '............'
    ]
  },
  wraith: {
    palette: { k: '#15131c', d: '#2a2636', e: '#9b5cff' },
    rows: [
      '...kkkkkk...',
      '..kkkkkkkk..',
      '.kkkkkkkkkk.',
      '.kkdddddkkk.',
      '.kkdeddedkk.',
      '.kkddddddkk.',
      '.kkkkkkkkkk.',
      '.kkkkkkkkkk.',
      '.kkkkkkkkkk.',
      '..kkkkkkkk..',
      '...k.kk.k...',
      '............'
    ]
  },
  bat: {
    palette: { p: '#4a2f63', b: '#291839', e: '#e74c3c', w: '#ffffff' },
    rows: [
      '............',
      '.p..bbbb..p.',
      'pppbbbbbbppp',
      'pppbebbebppp',
      '.pbbbbbbbbp.',
      '...bbwwbb...',
      '....bbbb....',
      '............',
      '............',
      '............',
      '............',
      '............'
    ]
  },
  spider: {
    palette: { b: '#15151a', e: '#c0392b', l: '#26262e' },
    rows: [
      'l..........l',
      '.l..bbbb..l.',
      '..l.bbbb.l..',
      '...bbbbbb...',
      '..bebbbbeb..',
      '..bbbbbbbb..',
      '...bbbbbb...',
      '..l.bbbb.l..',
      '.l..bbbb..l.',
      'l...bbbb...l',
      '............',
      '............'
    ]
  },
  vistani: {
    palette: { s: '#c9a47a', h: '#9c2b3e', g: '#d4af37', k: '#161616' },
    rows: [
      '...hhhhhh...',
      '..hhhhhhhh..',
      '.hhgggggghh.',
      '.hssssssssh.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.sssskkssss.',
      '.ssssssssss.',
      '..ssssssss..',
      '...hhhhhh...',
      '............',
      '............'
    ]
  },
  villager: {
    palette: { s: '#c2a07a', h: '#433427', c: '#544b40', k: '#161616' },
    rows: [
      '............',
      '..hhhhhhhh..',
      '.hhhhhhhhhh.',
      '.hssssssssh.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.sssskkssss.',
      '.ssssssssss.',
      '.cccccccccc.',
      '.cccccccccc.',
      '..cccccccc..',
      '............'
    ]
  },
  raven: {
    palette: { k: '#0e0e12', b: '#2a2a32', y: '#d9a23a', e: '#d33333' },
    rows: [
      '............',
      '....kk......',
      '...kkkk.....',
      '...kekk.....',
      '..kkkkkyy...',
      '.kkkkkkk....',
      'kkkkkkkk....',
      'bkkkkkkkk...',
      '.bkkkkkk....',
      '..kkkk......',
      '...kk.kk....',
      '............'
    ]
  },
  scarecrow: {
    palette: { b: '#b08a4a', d: '#5a4326', k: '#1a1410', h: '#3a2a1a', s: '#d9c27a' },
    rows: [
      '...hhhhhh...',
      '..hhhhhhhh..',
      '.sbbbbbbbbs.',
      '.bbbbbbbbbb.',
      '.bkbbbbbkbb.',
      '.bbbbbbbbbb.',
      '.bbbdddbbbb.',
      '.bdbdbdbdbb.',
      '.bbbbbbbbbb.',
      '..sbbbbbbs..',
      '...s....s...',
      '............'
    ]
  },
  mist: {
    palette: { m: '#8e94a1', l: '#c4c9d2' },
    rows: [
      '............',
      '...llll.....',
      '..mllmmll...',
      '.mmllmmmllm.',
      'lmmmmmmmmmml',
      '.mmmllmmmmm.',
      'mmmllmmmmmll',
      '.mmmmmmmmmm.',
      '..llmmmll...',
      '...mmmm.....',
      '............',
      '............'
    ]
  },
  default: {
    palette: { p: '#5a3f6e', w: '#cbbbe0' },
    rows: [
      '............',
      '...pppppp...',
      '..pppppppp..',
      '.pppppppppp.',
      '.ppwppppwpp.',
      '.pppppppppp.',
      '.pppppppppp.',
      '.pppppppppp.',
      '.pppppppppp.',
      '..pppppppp..',
      '...pppppp...',
      '............'
    ]
  },

  // ----- Party members (humanoid portraits, distinguished by headgear) -----
  fighter: {
    palette: { s: '#c9a47a', k: '#161616', m: '#9aa0a8' },
    rows: [
      '..mmmmmmmm..',
      '.mmmmmmmmmm.',
      '.mmmmmmmmmm.',
      '.mmmmmmmmmm.',
      '.mssssssssm.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  },
  wizard: {
    palette: { s: '#c9a47a', k: '#161616', b: '#3f6fd1' },
    rows: [
      '.....bb.....',
      '....bbbb....',
      '...bbbbbb...',
      '..bbbbbbbb..',
      '.bbbbbbbbbb.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  },
  rogue: {
    palette: { s: '#c9a47a', k: '#161616', d: '#2e2a3a' },
    rows: [
      '...dddddd...',
      '..dddddddd..',
      '.dddddddddd.',
      '.dddddddddd.',
      '.dssssssssd.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  },
  cleric: {
    palette: { s: '#c9a47a', k: '#161616', w: '#eef0f0', g: '#d4af37' },
    rows: [
      '............',
      '..wwwwwwww..',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.gggggggggg.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  },
  ranger: {
    palette: { s: '#c9a47a', k: '#161616', g: '#3f7a3f' },
    rows: [
      '...gggggg...',
      '..gggggggg..',
      '.gggggggggg.',
      '.gggggggggg.',
      '.gssssssssg.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  },
  bard: {
    palette: { s: '#c9a47a', k: '#161616', p: '#9b59b6', a: '#e74c3c' },
    rows: [
      '........a...',
      '...ppppppa..',
      '..pppppppp..',
      '.pppppppppp.',
      '.pssssssssp.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  },
  ally: {
    palette: { s: '#c9a47a', k: '#161616', h: '#6b4a2a' },
    rows: [
      '............',
      '..hhhhhhhh..',
      '.hhhhhhhhhh.',
      '.hhhhhhhhhh.',
      '.hssssssssh.',
      '.ssssssssss.',
      '.ssssssssss.',
      '.ssksssskss.',
      '.ssssssssss.',
      '.ssskkkksss.',
      '..ssssssss..',
      '............'
    ]
  }
}
