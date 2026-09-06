export const notify: jest.Mock = jest.fn(() => void 0);

export const notificationConstructorOptions: unknown[] = [];

export class Notification {
  constructor(options: unknown) {
    notificationConstructorOptions.push(options);
  }
  notify(options: unknown): void {
    notify(options);
  }
}
