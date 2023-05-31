import "./style.css";
import { game } from "./game";
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

new game(canvas);
