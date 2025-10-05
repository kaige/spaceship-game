# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 2D space shooter game built with TypeScript and Three.js. The player controls a spaceship at the bottom of the screen to shoot bullets at randomly appearing meteorites falling from the top.

## Game Controls

- **Arrow Keys**: Move spaceship left/right/up/down
- **Spacebar**: Fire bullets
- **Game Dimensions**: Long rectangular 2D canvas

## Technology Stack

- **Frontend**: TypeScript
- **Graphics**: Three.js (for 2D rendering)
- **Build Tool**: Vite (recommended)
- **Package Manager**: npm/yarn

## Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Run linter: `npm run lint`

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build project
npm run build

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── main.ts              # Game entry point
├── Game.ts              # Main game class
├── GameObjects/         # Game entity classes
│   ├── Spaceship.ts     # Player spaceship
│   ├── Bullet.ts        # Bullet objects
│   └── Meteorite.ts     # Enemy objects
├── Systems/             # Game systems
│   ├── InputSystem.ts   # Handle user input
│   ├── PhysicsSystem.ts # Movement and collisions
│   └── RenderSystem.ts  # Three.js rendering
├── Utils/               # Helper utilities
│   └── GameUtils.ts     # Common game utilities
└── types/               # TypeScript type definitions
    └── GameTypes.ts
```

## Game Architecture

- **Game Loop**: Main update loop using requestAnimationFrame
- **Entity-Component Pattern**: Modular game objects with systems
- **Input System**: Centralized keyboard input handling
- **Physics System**: Basic collision detection and movement
- **Render System**: Three.js scene management and rendering

## Key Components

1. **Spaceship**: Player-controlled entity with movement and shooting capabilities
2. **Bullet**: Projectiles that move upward and destroy meteorites
3. **Meteorite**: Enemy objects that fall from top with random positions
4. **Collision Detection**: Rectangle-based collision system
5. **Score System**: Track player score and game state

## Development Notes

- Use Three.js OrthographicCamera for 2D rendering
- Implement object pooling for bullets to optimize performance
- Store game state in centralized Game class
- Use TypeScript interfaces for type safety
- Consider adding game states (menu, playing, game over)

## Project Development Worksheet

### Phase 1: Project Setup & Framework (Foundation)
- [ ] **1. Set up TypeScript project structure and configuration**
  - [ ] Initialize package.json with TypeScript
  - [ ] Configure tsconfig.json for modern TypeScript features
  - [ ] Set up project directory structure

- [ ] **2. Initialize Vite build tool and development server**
  - [ ] Install Vite as build tool
  - [ ] Configure development server
  - [ ] Set up build scripts

- [ ] **3. Install and configure Three.js for 2D rendering**
  - [ ] Install Three.js and type definitions
  - [ ] Configure Three.js for 2D orthographic projection

- [ ] **4. Create basic HTML structure and canvas setup**
  - [ ] Create index.html with canvas element
  - [ ] Set up basic styling for the game container

### Phase 2: Core Graphics & Game Loop (Canvas Foundation)
- [ ] **5. Implement basic Three.js 2D scene with OrthographicCamera**
  - [ ] Set up Three.js scene, camera, and renderer
  - [ ] Create 2D orthographic projection
  - [ ] Verify canvas renders correctly

- [ ] **6. Create game loop using requestAnimationFrame**
  - [ ] Implement main game loop
  - [ ] Set up delta time calculation
  - [ ] Test loop performance

### Phase 3: Game Systems & Player Controls
- [ ] **7. Implement Input System for keyboard controls**
  - [ ] Create centralized input handler
  - [ ] Map arrow keys and spacebar
  - [ ] Test input responsiveness

- [ ] **8. Create Spaceship class with basic movement**
  - [ ] Design spaceship entity
  - [ ] Implement movement logic
  - [ ] Connect to input system

### Phase 4: Game Mechanics
- [ ] **9. Implement Bullet system and shooting mechanics**
  - [ ] Create bullet entity class
  - [ ] Implement shooting with spacebar
  - [ ] Add bullet movement and lifecycle

- [ ] **10. Create Meteorite class with random spawning**
  - [ ] Design meteorite entity
  - [ ] Implement random spawn system
  - [ ] Add falling movement logic

### Phase 5: Game Logic & Interaction
- [ ] **11. Implement collision detection system**
  - [ ] Create rectangle-based collision detection
  - [ ] Handle bullet-meteorite collisions
  - [ ] Handle spaceship-meteorite collisions

- [ ] **12. Add game state management (score, game over)**
  - [ ] Implement score tracking
  - [ ] Add game over state
  - [ ] Create simple UI for score display

### Phase 6: Optimization & Polish
- [ ] **13. Implement object pooling for performance optimization**
  - [ ] Create object pool for bullets
  - [ ] Optimize meteorite management
  - [ ] Profile and improve performance

- [ ] **14. Add visual polish and game feel improvements**
  - [ ] Add visual effects for explosions
  - [ ] Improve game aesthetics
  - [ ] Add sound effects (optional)

## Development Progress Tracking

### Current Status (2025-10-05)
**Phase 1-3 COMPLETED** ✅
- ✅ Project setup and engineering framework complete
- ✅ TypeScript + Vite + Three.js working
- ✅ Input system functional (keyboard controls)
- ✅ Spaceship class implemented with basic movement
- ✅ **All rendering issues resolved** - Single spaceship working correctly

### Next Session Tasks
1. **Continue with Bullet system** - Implement shooting mechanics (press spacebar to fire)
2. **Meteorite spawning system** - Random falling obstacles
3. **Collision detection** - Bullet-meteorite and spaceship-meteorite interactions
4. **Game state management** - Score, lives, and game over logic

Use this worksheet to track completion of each phase. Mark items as completed when they are implemented and tested. Each phase builds upon the previous one, ensuring a solid foundation before adding complexity.