export default class EventEmitter {
  private callbacks: { [key: string]: Function[] };

  constructor() {
    this.callbacks = {};
  }

  on(event: string, callback: Function): void {
    // 初始化事件数组
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }

    this.callbacks[event].push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.callbacks[event]) {
      return;
    }

    // 如果没有提供特定的回调函数，删除所有该事件的回调
    if (!callback) {
      delete this.callbacks[event];
      return;
    }

    // 删除特定的回调函数
    this.callbacks[event] = this.callbacks[event].filter(
      (cb) => cb !== callback
    );
  }

  emit(event: string, ...args: any[]): void {
    if (!this.callbacks[event]) {
      return;
    }

    this.callbacks[event].forEach((callback) => {
      callback(...args);
    });
  }
}
