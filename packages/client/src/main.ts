// Blobverse Client — Entry Point
import { Game } from './game';

console.log('🟢 Blobverse client starting...');

async function main() {
  try {
    const game = await Game.create();
    game.start();

    // Expose game instance for debugging
    (window as any).game = game;

    console.log('✨ Blobverse ready! Use mouse to pan, scroll to zoom.');
    console.log('   Press SPACE to reset camera to blob, R to reset to center.');
  } catch (error) {
    console.error('❌ Failed to start Blobverse:', error);
  }
}

main();
