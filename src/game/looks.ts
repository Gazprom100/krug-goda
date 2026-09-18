export type HairStyle =
  | 'short'
  | 'long'
  | 'bun'
  | 'curly'
  | 'undercut'
  | 'wave'
  | 'fade'
  | 'pony'

export type Accessory =
  | 'none'
  | 'glasses'
  | 'stethoscope'
  | 'cap'
  | 'earrings'
  | 'beard'
  | 'headset'
  | 'scarf'

export type PortraitMood = 'idle' | 'happy' | 'worried' | 'tired' | 'win'

export interface CharacterLook {
  skin: string
  skinShadow: string
  hair: string
  hairStyle: HairStyle
  top: string
  topDark: string
  accent: string
  bg: string
  accessory: Accessory
  eyeColor: string
  blush?: boolean
}

/** Визуальный ДНК каждого героя */
export const CHARACTER_LOOKS: Record<string, CharacterLook> = {
  alina: {
    skin: '#f0c7a8',
    skinShadow: '#e0a888',
    hair: '#2a1a12',
    hairStyle: 'long',
    top: '#c45c2a',
    topDark: '#8f3d18',
    accent: '#f3e2a8',
    bg: '#1a3d36',
    accessory: 'earrings',
    eyeColor: '#3d5c3a',
    blush: true,
  },
  igor: {
    skin: '#e8b896',
    skinShadow: '#d49a78',
    hair: '#4a3428',
    hairStyle: 'short',
    top: '#2f5f8a',
    topDark: '#1e4060',
    accent: '#e0b03a',
    bg: '#1a3040',
    accessory: 'glasses',
    eyeColor: '#3a4a5c',
  },
  marina: {
    skin: '#f2d0b4',
    skinShadow: '#e0b090',
    hair: '#1a1210',
    hairStyle: 'bun',
    top: '#e8f2f4',
    topDark: '#b8c8cc',
    accent: '#3ecf9a',
    bg: '#1a3840',
    accessory: 'stethoscope',
    eyeColor: '#4a6a8a',
    blush: true,
  },
  timur: {
    skin: '#c9956c',
    skinShadow: '#a87850',
    hair: '#1c1410',
    hairStyle: 'fade',
    top: '#d4a017',
    topDark: '#a07810',
    accent: '#3ecf9a',
    bg: '#2a2818',
    accessory: 'none',
    eyeColor: '#2a3a2a',
  },
  olga: {
    skin: '#f0c8ac',
    skinShadow: '#dca888',
    hair: '#8b3a2a',
    hairStyle: 'wave',
    top: '#2f6b5c',
    topDark: '#1e4a40',
    accent: '#3ecf9a',
    bg: '#1a302c',
    accessory: 'glasses',
    eyeColor: '#3a5a4c',
  },
  sergey: {
    skin: '#e0b090',
    skinShadow: '#c49070',
    hair: '#3a3028',
    hairStyle: 'short',
    top: '#2a4a3a',
    topDark: '#1a3028',
    accent: '#e0b03a',
    bg: '#1a2820',
    accessory: 'beard',
    eyeColor: '#3a4a3a',
  },
  daria: {
    skin: '#f5d4bc',
    skinShadow: '#e0b898',
    hair: '#c9a048',
    hairStyle: 'long',
    top: '#2a6a8a',
    topDark: '#1a4a60',
    accent: '#7ec8e8',
    bg: '#183040',
    accessory: 'glasses',
    eyeColor: '#4a6a8a',
    blush: true,
  },
  pavel: {
    skin: '#d4a888',
    skinShadow: '#b88868',
    hair: '#2a2018',
    hairStyle: 'undercut',
    top: '#8a4a2a',
    topDark: '#603018',
    accent: '#e0b03a',
    bg: '#2a2018',
    accessory: 'none',
    eyeColor: '#3a4a2a',
  },
  lena: {
    skin: '#ecc0a0',
    skinShadow: '#d4a080',
    hair: '#6a5a50',
    hairStyle: 'bun',
    top: '#3a5a6a',
    topDark: '#284048',
    accent: '#a8d4c8',
    bg: '#1a3030',
    accessory: 'glasses',
    eyeColor: '#4a5a5c',
  },
  nikita: {
    skin: '#e8c4a4',
    skinShadow: '#d0a484',
    hair: '#1a1a1a',
    hairStyle: 'curly',
    top: '#2a2a2a',
    topDark: '#111111',
    accent: '#3ecf9a',
    bg: '#1a2420',
    accessory: 'cap',
    eyeColor: '#2a4a3a',
  },
  vera: {
    skin: '#f0c8b0',
    skinShadow: '#dca890',
    hair: '#4a2030',
    hairStyle: 'wave',
    top: '#a83a5a',
    topDark: '#782838',
    accent: '#e0b03a',
    bg: '#2a1820',
    accessory: 'earrings',
    eyeColor: '#5c3a4a',
    blush: true,
  },
  anton: {
    skin: '#d8a888',
    skinShadow: '#b88868',
    hair: '#3a2818',
    hairStyle: 'short',
    top: '#4a5a6a',
    topDark: '#303840',
    accent: '#e0b03a',
    bg: '#222830',
    accessory: 'beard',
    eyeColor: '#3a4a5a',
  },
  sofia: {
    skin: '#f2d0b8',
    skinShadow: '#deb098',
    hair: '#8a6038',
    hairStyle: 'long',
    top: '#3a8a7a',
    topDark: '#286058',
    accent: '#a8e8d8',
    bg: '#183830',
    accessory: 'earrings',
    eyeColor: '#3a6a5a',
    blush: true,
  },
  roman: {
    skin: '#d4a080',
    skinShadow: '#b88060',
    hair: '#4a4038',
    hairStyle: 'fade',
    top: '#6a3a2a',
    topDark: '#482818',
    accent: '#e0b03a',
    bg: '#281c18',
    accessory: 'beard',
    eyeColor: '#4a3a2a',
  },
  kira: {
    skin: '#f0c8b0',
    skinShadow: '#dca890',
    hair: '#2a1a28',
    hairStyle: 'pony',
    top: '#e8d4a8',
    topDark: '#c8b488',
    accent: '#3ecf9a',
    bg: '#243028',
    accessory: 'headset',
    eyeColor: '#4a3a5c',
    blush: true,
  },
  gleb: {
    skin: '#d8b090',
    skinShadow: '#bc9474',
    hair: '#c8c0b8',
    hairStyle: 'short',
    top: '#2a3a4a',
    topDark: '#1a2830',
    accent: '#e0b03a',
    bg: '#1a2228',
    accessory: 'glasses',
    eyeColor: '#4a5a6a',
  },
}

export function getLook(characterId: string): CharacterLook {
  return CHARACTER_LOOKS[characterId] ?? CHARACTER_LOOKS.alina
}
