export default defineEventHandler(
  async () => await $fetch('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95368/world.json')
);
