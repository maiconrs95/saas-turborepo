export function createSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\w]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLocaleLowerCase()
}

export default {
  createSlug,
}
