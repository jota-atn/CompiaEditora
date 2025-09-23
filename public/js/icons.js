export const IconCart = (classes = "w-5 h-5 text-gray-400 absolute left-3 top-2.5") => `
<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
</svg>
`

export const IconIA = (classes = "w-6 h-6") => `
<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M12 4.354a4 4 0 010 7.292M6.343 6.343a8 8 0 1111.314 11.314"/>
</svg>
`;

export const IconCode = (classes = "w-6 h-6") => `
<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M8 9l3 3-3 3m5 0h3m-9 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
</svg>
`;

export const IconLock = (classes = "w-6 h-6") => `
<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
</svg>
`;

export const IconBlockchain = (classes = "w-6 h-6") => `
<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M13 10V3L4 14h7v7l9-11h-7z"/>
</svg>
`;

export const Icons = {
  ia: IconIA,
  code: IconCode,
  lock: IconLock,
  blockchain: IconBlockchain
};