import { Vector2D } from '../types/GameTypes';
import { Bullet } from '../GameObjects/Bullet';
import { Meteorite } from '../GameObjects/Meteorite';
import { Spaceship } from '../GameObjects/Spaceship';

export interface CollisionResult {
    bulletMeteoriteCollisions: Array<{
        bullet: Bullet;
        meteorite: Meteorite;
    }>;
    spaceshipMeteoriteCollisions: Array<{
        spaceship: Spaceship;
        meteorite: Meteorite;
    }>;
}

export class CollisionSystem {
    public static checkRectCollision(
        rect1: { min: Vector2D; max: Vector2D },
        rect2: { min: Vector2D; max: Vector2D }
    ): boolean {
        return (
            rect1.min.x <= rect2.max.x &&
            rect1.max.x >= rect2.min.x &&
            rect1.min.y <= rect2.max.y &&
            rect1.max.y >= rect2.min.y
        );
    }

    public static checkCollisions(
        bullets: Bullet[],
        meteorites: Meteorite[],
        spaceship: Spaceship
    ): CollisionResult {
        const result: CollisionResult = {
            bulletMeteoriteCollisions: [],
            spaceshipMeteoriteCollisions: []
        };

        // Check bullet-meteorite collisions
        for (const bullet of bullets) {
            if (!bullet.isActive) continue;

            const bulletBounds = bullet.getBounds();

            for (const meteorite of meteorites) {
                if (!meteorite.isActive) continue;

                const meteoriteBounds = meteorite.getBounds();

                if (this.checkRectCollision(bulletBounds, meteoriteBounds)) {
                    result.bulletMeteoriteCollisions.push({
                        bullet,
                        meteorite
                    });
                }
            }
        }

        // Check spaceship-meteorite collisions
        if (spaceship.isActive) {
            const spaceshipBounds = spaceship.getBounds();

            for (const meteorite of meteorites) {
                if (!meteorite.isActive) continue;

                const meteoriteBounds = meteorite.getBounds();

                if (this.checkRectCollision(spaceshipBounds, meteoriteBounds)) {
                    result.spaceshipMeteoriteCollisions.push({
                        spaceship,
                        meteorite
                    });
                }
            }
        }

        return result;
    }

    public static processCollisionResults(
        result: CollisionResult,
        onBulletMeteoriteHit?: (bullet: Bullet, meteorite: Meteorite) => void,
        onSpaceshipMeteoriteHit?: (spaceship: Spaceship, meteorite: Meteorite) => void
    ): void {
        // Process bullet-meteorite collisions
        for (const collision of result.bulletMeteoriteCollisions) {
            collision.bullet.isActive = false;
            collision.meteorite.isActive = false;

            console.log(`💥 Bullet hit meteorite!`);

            if (onBulletMeteoriteHit) {
                onBulletMeteoriteHit(collision.bullet, collision.meteorite);
            }
        }

        // Process spaceship-meteorite collisions
        for (const collision of result.spaceshipMeteoriteCollisions) {
            collision.meteorite.isActive = false;

            console.log(`💥 Spaceship hit by meteorite!`);

            if (onSpaceshipMeteoriteHit) {
                onSpaceshipMeteoriteHit(collision.spaceship, collision.meteorite);
            }
        }
    }

    public static debugCollisionInfo(
        bullets: Bullet[],
        meteorites: Meteorite[],
        spaceship: Spaceship
    ): string {
        const activeBullets = bullets.filter(b => b.isActive).length;
        const activeMeteorites = meteorites.filter(m => m.isActive).length;
        const result = this.checkCollisions(bullets, meteorites, spaceship);

        return `Collision Debug: ${activeBullets} bullets, ${activeMeteorites} meteorites, ` +
               `${result.bulletMeteoriteCollisions.length} bullet-meteorite hits, ` +
               `${result.spaceshipMeteoriteCollisions.length} spaceship-meteorite hits`;
    }
}