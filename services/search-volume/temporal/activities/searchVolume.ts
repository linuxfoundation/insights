export async function runSearchVolume() {
  const { main } = await import('../../search-volume.js');
  await main();
}
