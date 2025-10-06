import * as THREE from 'three';

export class GameTextureLoader {
    private static textureCache: Map<string, THREE.Texture> = new Map();
    private static loadingPromises: Map<string, Promise<THREE.Texture>> = new Map();

    public static async loadTexture(path: string): Promise<THREE.Texture> {
        // Check if already loaded
        if (this.textureCache.has(path)) {
            return this.textureCache.get(path)!;
        }

        // Check if currently loading
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path)!;
        }

        // Create loading promise
        const loadingPromise = new Promise<THREE.Texture>((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                path,
                (texture) => {
                    // Configure texture for better 2D rendering
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;

                    this.textureCache.set(path, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load texture: ${path}`, error);
                    reject(error);
                }
            );
        });

        this.loadingPromises.set(path, loadingPromise);
        return loadingPromise;
    }

    public static async loadSpriteSheet(path: string, frameWidth: number, frameHeight: number): Promise<THREE.Texture[]> {
        const texture = await this.loadTexture(path);

        // Calculate grid dimensions based on texture size
        const image = texture.image;
        const cols = Math.floor(image.width / frameWidth);
        const rows = Math.floor(image.height / frameHeight);

        const frames: THREE.Texture[] = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Create a canvas for each frame
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const context = canvas.getContext('2d')!;

                // Draw the specific frame region
                context.drawImage(
                    image,
                    col * frameWidth, row * frameHeight,
                    frameWidth, frameHeight,
                    0, 0,
                    frameWidth, frameHeight
                );

                // Create texture from canvas
                const frameTexture = new THREE.CanvasTexture(canvas);
                frameTexture.magFilter = THREE.NearestFilter;
                frameTexture.minFilter = THREE.NearestFilter;
                frameTexture.wrapS = THREE.ClampToEdgeWrapping;
                frameTexture.wrapT = THREE.ClampToEdgeWrapping;

                frames.push(frameTexture);
            }
        }

        return frames;
    }

    public static createFallbackShape(shapeType: 'fighter' | 'bullet' | 'meteorite'): THREE.Mesh {
        const geometry = this.createFallbackGeometry(shapeType);
        const material = this.createFallbackMaterial(shapeType);
        return new THREE.Mesh(geometry, material);
    }

    private static createFallbackGeometry(shapeType: string): THREE.ShapeGeometry {
        const shape = new THREE.Shape();

        switch (shapeType) {
            case 'fighter':
                // Create a more detailed fighter shape
                shape.moveTo(0, 30);     // Nose tip
                shape.lineTo(3, 15);     // Right of cockpit
                shape.lineTo(6, 8);      // Right fuselage
                shape.lineTo(10, 2);     // Wing root right
                shape.lineTo(25, -2);    // Right wing leading edge
                shape.lineTo(28, -5);    // Right wing tip
                shape.lineTo(22, -8);    // Right wing trailing edge
                shape.lineTo(12, -6);    // Right wing root trailing
                shape.lineTo(8, -12);    // Right engine intake
                shape.lineTo(6, -20);    // Right engine body
                shape.lineTo(4, -25);    // Right engine nozzle
                shape.lineTo(0, -28);    // Center bottom
                shape.lineTo(-4, -25);   // Left engine nozzle
                shape.lineTo(-6, -20);   // Left engine body
                shape.lineTo(-8, -12);   // Left engine intake
                shape.lineTo(-12, -6);   // Left wing root trailing
                shape.lineTo(-22, -8);   // Left wing trailing edge
                shape.lineTo(-28, -5);   // Left wing tip
                shape.lineTo(-25, -2);   // Left wing leading edge
                shape.lineTo(-10, 2);    // Left wing root
                shape.lineTo(-6, 8);     // Left fuselage
                shape.lineTo(-3, 15);    // Left of cockpit
                shape.lineTo(0, 30);     // Back to nose tip
                break;

            case 'bullet':
                // Simple bullet shape
                shape.moveTo(-2, -6);
                shape.lineTo(2, -6);
                shape.lineTo(2, 6);
                shape.lineTo(-2, 6);
                shape.lineTo(-2, -6);
                break;

            case 'meteorite':
                // Random meteorite shape
                const points = 8;
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    const radius = 15 + Math.random() * 10;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) {
                        shape.moveTo(x, y);
                    } else {
                        shape.lineTo(x, y);
                    }
                }
                shape.closePath();
                break;
        }

        return new THREE.ShapeGeometry(shape);
    }

    private static createFallbackMaterial(shapeType: string): THREE.MeshBasicMaterial {
        switch (shapeType) {
            case 'fighter':
                return new THREE.MeshBasicMaterial({
                    color: 0x808080, // Metallic gray
                    side: THREE.DoubleSide
                });
            case 'bullet':
                return new THREE.MeshBasicMaterial({
                    color: 0xffff00, // Yellow
                    side: THREE.DoubleSide
                });
            case 'meteorite':
                return new THREE.MeshBasicMaterial({
                    color: 0x8B4513, // Brown
                    side: THREE.DoubleSide
                });
            default:
                return new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide
                });
        }
    }
}