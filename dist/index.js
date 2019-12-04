export { PaymentApiWebView } from './payment-api-web-view';
export { PaymentClientWebView } from './payment-client-web-view';
import { PaymentApiWebView } from './payment-api-web-view';
window.paymentApi = PaymentApiWebView.getInstance(window.appFlowBridge);
window.paymentClient = window.paymentApi.getPaymentClient();
window.paymentApi.getApiVersion().subscribe(function (version) {
    console.log("AppFlow - Added API entry classes " + version);
});
window.paymentApi.isProcessingServiceInstalled().subscribe(function (installed) {
    console.log(installed);
});
window.paymentApi.getProcessingServiceVersion().subscribe(function (version) {
    console.log("Processing service version: " + version);
});
