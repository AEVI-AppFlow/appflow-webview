export { PaymentApiWebView } from './payment-api-web-view';
export { PaymentClientWebView } from './payment-client-web-view';

import { AppFlowBridge } from './appflow-bridge';
import { PaymentApiWebView } from './payment-api-web-view';
import { PaymentApi, PaymentClient, Payment } from 'appflow-payment-initiation-api';


declare global {
    interface Window {
        paymentApi: PaymentApi;
        paymentClient: PaymentClient;
        appFlowBridge: AppFlowBridge;
    }
    
    var window: Window & typeof globalThis; 
}

window.paymentApi = PaymentApiWebView.getInstance(window.appFlowBridge);
window.paymentClient = window.paymentApi.getPaymentClient();

window.paymentApi.getApiVersion().subscribe((version) => {
    console.log("AppFlow - Added API entry classes " + version);
});

window.paymentApi.isProcessingServiceInstalled().subscribe((installed) => {
    console.log(installed);
});

window.paymentApi.getProcessingServiceVersion().subscribe((version) => {
    console.log("Processing service version: " + version);
});
