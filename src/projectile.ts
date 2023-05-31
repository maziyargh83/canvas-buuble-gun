export interface velocityType {
  x: number;
  y: number;
}

export class Projectile {
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string,
    public velocity: velocityType
  ) {}
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    this.x = this.velocity.x + this.x;
    this.y = this.velocity.y + this.y;
  }
}
