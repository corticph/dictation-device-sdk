/* eslint-disable  @typescript-eslint/no-explicit-any */
type InputReportListener = (event: HIDInputReportEvent) => any;
type SendReportReceiver = (reportId: number, data: BufferSource) => void;

export class FakeHidDevice implements HIDDevice {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  oninputreport: ((ev: HIDInputReportEvent) => any)|null = null;
  opened = false;
  readonly vendorId: number;
  readonly productId: number;
  readonly productName = 'product-name';
  readonly collections: HIDCollectionInfo[];

  protected readonly inputReportListeners = new Set<InputReportListener>();
  protected readonly sendReportReceiver?: SendReportReceiver;

  constructor(properties: {
    vendorId: number,
    productId: number,
    collections?: HIDCollectionInfo[],
    sendReportReceiver?: SendReportReceiver,
  }) {
    this.vendorId = properties.vendorId;
    this.productId = properties.productId;
    this.collections = properties.collections || [];
    this.sendReportReceiver = properties.sendReportReceiver;
  }

  async open() {
    if (this.opened) {
      throw new Error('device is already opened');
    }

    this.opened = true;
  }

  async close() {
    if (!this.opened) {
      throw new Error('device is already closed');
    }

    this.opened = false;
  }

  async forget() {
    throw new Error('Not implemented');
  }

  async sendReport(reportId: number, data: BufferSource) {
    if (reportId !== 0) {
      throw new Error(`Unexpected reportId ${reportId}`);
    }

    if (this.sendReportReceiver !== undefined) {
      this.sendReportReceiver(reportId, data);
    }
  }

  async sendFeatureReport(_reportId: number, _data: BufferSource) {
    throw new Error('Not implemented');
  }

  async receiveFeatureReport(_reportId: number): Promise<DataView> {
    throw new Error('Not implemented');
  }

  dispatchEvent(_event: Event): boolean {
    throw new Error('Not implemented');
  }

  addEventListener(
      type: 'inputreport', listener: (ev: HIDInputReportEvent) => any): void;
  addEventListener(
      type: string, listener: EventListenerOrEventListenerObject|null,
      options?: boolean|AddEventListenerOptions): void;
  addEventListener(type: string, listener: unknown): void {
    if (type === 'inputreport')
      this.inputReportListeners.add(listener as InputReportListener);
  }

  removeEventListener(
      type: 'inputreport', callback: (ev: HIDInputReportEvent) => any): void;
  removeEventListener(
      type: string, callback: EventListenerOrEventListenerObject|null,
      options?: EventListenerOptions|boolean): void;
  removeEventListener(type: string, callback: unknown): void {
    if (type === 'inputreport')
      this.inputReportListeners.delete(callback as InputReportListener);
  }

  async handleInputReport(data: number[]) {
    const dataView = new DataView(new Uint8Array(data).buffer);
    const event: HIDInputReportEvent = {data: dataView} as unknown as
        HIDInputReportEvent;
    await Promise.all(
        [...this.inputReportListeners].map(listener => listener(event)));
  }
}
