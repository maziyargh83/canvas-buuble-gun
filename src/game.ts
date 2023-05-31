import { Enemy } from "./enemy";
import { Particles } from "./particles";
import { Player } from "./player";
import { Projectile, velocityType } from "./projectile";
import { gsap } from "gsap";
export class game {
  private centerX: number;
  private centerY: number;
  private ctx: CanvasRenderingContext2D;
  private mainPlayer?: Player;
  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private particles: Particles[] = [];
  private animationId?: number;
  constructor(public canvas: HTMLCanvasElement) {
    this.centerY = this.canvas.height / 2;
    this.centerX = this.canvas.width / 2;
    this.ctx = this.canvas.getContext("2d")!;
    this.initial();
  }
  createPlayer() {
    this.mainPlayer = new Player(this.centerX, this.centerY, 10, "white");
    return this;
  }
  drawPlayer() {
    if (!this.mainPlayer) return;
    this.mainPlayer.draw(this.ctx);
    return this;
  }
  handleClick() {
    window.addEventListener("click", (event) => {
      const angle = Math.atan2(
        event.clientY - this.centerY,
        event.clientX - this.centerX
      );

      this.createProjectile(this.createVelocity(angle, 4));
    });
  }
  createVelocity(angle: number, increase: number = 1): velocityType {
    return {
      x: Math.cos(angle) * increase,
      y: Math.sin(angle) * increase,
    };
  }
  createProjectile(velocity: velocityType) {
    const projectile = new Projectile(
      this.centerX,
      this.centerY,
      5,
      "white",
      velocity
    );
    this.projectiles.push(projectile);
  }
  initial() {
    this.createPlayer().drawPlayer();
    this.handleClick();
    this.enemyMaker();
    this.animate();
  }
  createEnemy() {
    const radius = Math.random() * (30 - 4) + 4;
    let x, y;
    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? 0 - radius : this.canvas.width + radius;
      y = Math.random() * this.canvas.height;
    } else {
      x = Math.random() * this.canvas.width;
      y = Math.random() > 0.5 ? 0 - radius : this.canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(this.centerY - y, this.centerX - x);

    const velocity = this.createVelocity(angle);
    const e = new Enemy(x, y, radius, color, velocity);
    this.enemies.push(e);
  }
  enemyMaker() {
    window.setInterval(() => this.createEnemy(), 1000);
  }
  update() {
    this.ctx.fillStyle = `rgba(0,0,0,0.1)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPlayer();
    this.projectiles.forEach((item, index) => {
      this.detectProjectilesExit(item, index);
      item.update(this.ctx);
    });
    this.enemies.forEach((item, index) => {
      item.update(this.ctx);
      this.detectPlayerCollision(item);
      this.detectCollision(item, index);
    });
    for (let index = this.particles.length - 1; index >= 0; index--) {
      const particle = this.particles[index];

      if (particle.alpha <= 0) {
        this.particles.splice(index, 1);
      } else {
        particle.update(this.ctx);
      }
    }
  }
  detectCollision(enemy: Enemy, index: number) {
    this.projectiles.forEach((item, projectileIndex) => {
      const dist = Math.hypot(enemy.x - item.x, enemy.y - item.y);
      if (dist - enemy.radius - item.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          this.particles.push(
            new Particles(item.x, item.y, Math.random() * 2, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 6),
              y: (Math.random() - 0.5) * (Math.random() * 6),
            })
          );
        }
        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            this.projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          setTimeout(() => {
            this.enemies.splice(index, 1);
            this.projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  }
  detectPlayerCollision(enemy: Enemy) {
    if (!this.mainPlayer) return;
    const dist = Math.hypot(
      this.mainPlayer.x - enemy.x,
      this.mainPlayer.y - enemy.y
    );
    if (dist - enemy.radius - this.mainPlayer.radius < 1) {
      this.stopAnimation();
    }
  }
  detectProjectilesExit(projectile: Projectile, index: number) {
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > this.canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > this.canvas.height
    ) {
      setTimeout(() => {
        this.projectiles.splice(index, 1);
      }, 0);
    }
  }
  stopAnimation() {
    if (this.animationId) window.cancelAnimationFrame(this.animationId);
  }
  animate() {
    const requestAnimation = () => {
      this.animationId = window.requestAnimationFrame(requestAnimation);
      this.update();
    };
    requestAnimation();
  }
}
