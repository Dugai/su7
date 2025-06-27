import EventEmitter from "./EventEmitter";

export default class Time extends EventEmitter {
  public start: number;
  public current: number;
  public elapsed: number;
  public delta: number;

  constructor() {
    super();

    // Setup
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16; // 假设初始帧率约为60fps

    // 开始动画循环
    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  private tick(): void {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.emit("tick");

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
