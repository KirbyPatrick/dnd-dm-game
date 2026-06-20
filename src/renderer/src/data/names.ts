// Barovian-flavored names for random party-member generation. Deliberately
// avoids canonical NPC names (Ireena, Ismark, etc.) so companions feel distinct.
export type Gender = 'Male' | 'Female' | 'Nonbinary'

export const GENDERS: Gender[] = ['Male', 'Female', 'Nonbinary']

const NAMES: Record<Gender, string[]> = {
  Male: [
    'Aleksei',
    'Dragomir',
    'Emeric',
    'Florian',
    'Grigor',
    'Lazlo',
    'Marek',
    'Nikol',
    'Petras',
    'Radomir',
    'Stefan',
    'Vadim',
    'Yorick',
    'Anton'
  ],
  Female: [
    'Anezka',
    'Bela',
    'Corina',
    'Dorina',
    'Faina',
    'Greta',
    'Iulia',
    'Katarin',
    'Lenka',
    'Mira',
    'Nadya',
    'Ottilie',
    'Rusalka',
    'Sevda'
  ],
  Nonbinary: ['Ash', 'Corvin', 'Lupei', 'Mihai', 'Sasha', 'Vesna', 'Wren', 'Zinta']
}

export function randomName(gender?: Gender): string {
  const g = gender ?? GENDERS[Math.floor(Math.random() * GENDERS.length)]
  const pool = NAMES[g]
  return pool[Math.floor(Math.random() * pool.length)]
}
