// Blobverse — Game Class
// Main game loop + player blob with movement

import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  INITIAL_MASS,
  BASE_SPEED,
  SPEED_DECAY_EXPONENT,
  MOVEMENT_SMOOTHING,
  MIN_MOVE_THRESHOLD,
  lerp,
  clamp,
  calculateRadius,
} from '@blobverse/shared';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { Input } from './Input';
import { BlobSprite, BLOB_PALETTE } from '../entities/BlobSprite';

// Player blob state
interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  mass: number;
  radius: number;
}

export class Game {
  private renderer: Renderer;
  private camera: Camera;
  private input: Input;

  // Game loop
  private running: boolean = false;
  private lastTime: number = 0;

  // Player blob
  private player: PlayerState;
  private playerSprite: BlobSprite;

  // Camera mode
  private cameraFollowsPlayer: boolean = true;

  private constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.camera = renderer.camera;
    this.input = new Input(renderer.getCanvas(), this.camera);

    // Initialize player state
    const initialMass = INITIAL_MASS;
    this.player = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      velocityX: 0,
      velocityY: 0,
      mass: initialMass,
      radius: calculateRadius(initialMass),
    };

    // Create player sprite
    this.playerSprite = new BlobSprite(initialMass, {
      color: BLOB_PALETTE[1], // Teal
      name: 'Player',
      isPlayer: true,
    });
    this.playerSprite.position.set(this.player.x, this.player.y);
    renderer.entityContainer.addChild(this.playerSprite);

    // Setup input callbacks
    this.input.onSplit = () => this.handleSplit();
    this.input.onEject = () => this.handleEject();
  }

  /**
   * Initialize the game (async factory)
   */
  static async create(): Promise<Game> {
    const renderer = await Renderer.create();

    // Attach canvas to DOM
    document.getElementById('root')?.appendChild(renderer.getCanvas());

    const game = new Game(renderer);

    // Setup keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'c':
          // Toggle camera follow
          game.cameraFollowsPlayer = !game.cameraFollowsPlayer;
          console.log(`Camera follow: ${game.cameraFollowsPlayer ? 'ON' : 'OFF'}`);
          break;
        case 'r':
          // Reset player to center
          game.player.x = WORLD_WIDTH / 2;
          game.player.y = WORLD_HEIGHT / 2;
          game.player.velocityX = 0;
          game.player.velocityY = 0;
          break;
        case '+':
        case '=':
          // Increase mass (for testing)
          game.setPlayerMass(game.player.mass + 10);
          break;
        case '-':
          // Decrease mass (for testing)
          game.setPlayerMass(Math.max(5, game.player.mass - 10));
          break;
      }
    });

    return game;
  }

  /**
   * Set player mass (for testing)
   */
  setPlayerMass(mass: number): void {
    this.player.mass = mass;
    this.player.radius = calculateRadius(mass);
    this.playerSprite.mass = mass;
    console.log(`Mass: ${mass.toFixed(1)}, Radius: ${this.player.radius.toFixed(1)}`);
  }

  /**
   * Handle split action
   */
  private handleSplit(): void {
    console.log('Split! (not implemented yet)');
    // TODO: Implement splitting
  }

  /**
   * Handle eject action
   */
  private handleEject(): void {
    console.log('Eject! (not implemented yet)');
    // TODO: Implement mass ejection
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
    console.log('🎮 Game started');
    console.log('   Move mouse to control blob');
    console.log('   C = Toggle camera follow');
    console.log('   R = Reset position');
    console.log('   +/- = Change mass (testing)');
    console.log('   SPACE/W = Split (TODO)');
    console.log('   E/Right-click = Eject (TODO)');
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
    console.log('🛑 Game stopped');
  }

  /**
   * Main game loop (requestAnimationFrame)
   */
  private gameLoop(currentTime: number): void {
    if (!this.running) return;

    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Convert to seconds for physics
    const dtSeconds = dt / 1000;

    // Update
    this.update(dtSeconds);

    // Render
    this.renderer.render(dt);

    // Schedule next frame
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * Update game state
   */
  private update(dt: number): void {
    // Get target position from input
    const target = this.input.getTargetPosition();

    // Update player movement
    this.updatePlayerMovement(target.x, target.y, dt);

    // Update player sprite
    this.playerSprite.position.set(this.player.x, this.player.y);

    // Update eye direction (look toward movement)
    const look = this.input.getLookDirection();
    this.playerSprite.setLookDirection(look.x, look.y);
    this.playerSprite.updateEyes(dt);

    // Update camera
    if (this.cameraFollowsPlayer) {
      this.camera.update(
        { x: this.player.x, y: this.player.y, mass: this.player.mass },
        dt
      );
    }

    // Update debug info
    const speed = Math.sqrt(
      this.player.velocityX ** 2 + this.player.velocityY ** 2
    );
    this.renderer.setDebugData('Mass', this.player.mass);
    this.renderer.setDebugData('Speed', speed);
    this.renderer.setDebugData('Pos', `(${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
  }

  /**
   * Update player blob movement
   * Formula from Section 4.2 of the design doc
   */
  private updatePlayerMovement(targetX: number, targetY: number, dt: number): void {
    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Don't move if cursor is too close to blob center
    if (distance < MIN_MOVE_THRESHOLD) {
      // Slow down gradually
      this.player.velocityX = lerp(this.player.velocityX, 0, MOVEMENT_SMOOTHING);
      this.player.velocityY = lerp(this.player.velocityY, 0, MOVEMENT_SMOOTHING);
    } else {
      // Calculate speed based on mass (bigger = slower)
      const maxSpeed = BASE_SPEED / Math.pow(this.player.mass, SPEED_DECAY_EXPONENT);

      // Normalize direction
      const dirX = dx / distance;
      const dirY = dy / distance;

      // Target velocity
      const targetVelX = dirX * maxSpeed;
      const targetVelY = dirY * maxSpeed;

      // Smooth velocity transition (lerp)
      this.player.velocityX = lerp(this.player.velocityX, targetVelX, MOVEMENT_SMOOTHING);
      this.player.velocityY = lerp(this.player.velocityY, targetVelY, MOVEMENT_SMOOTHING);
    }

    // Apply velocity
    this.player.x += this.player.velocityX * dt;
    this.player.y += this.player.velocityY * dt;

    // Boundary clamping (stay within world)
    this.player.x = clamp(this.player.x, this.player.radius, WORLD_WIDTH - this.player.radius);
    this.player.y = clamp(this.player.y, this.player.radius, WORLD_HEIGHT - this.player.radius);
  }

  /**
   * Destroy the game
   */
  destroy(): void {
    this.stop();
    this.input.destroy();
    this.playerSprite.destroy();
    this.renderer.destroy();
  }
}
