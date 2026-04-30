let _hid = 100;

export function mkH(type, from, to, comment, category, agent, timestamp) {
  return { id: ++_hid, type, from, to, comment, category, agent, timestamp };
}
