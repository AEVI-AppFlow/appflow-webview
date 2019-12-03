import { callbackFromNative } from './payment-client-web-view';

export { PaymentApiWebView } from './payment-api-web-view';
export { PaymentClientWebView } from './payment-client-web-view';

declare var window: any;

window.callbackFromNative = callbackFromNative;