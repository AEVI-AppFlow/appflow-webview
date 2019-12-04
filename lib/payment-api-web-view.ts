import { PaymentApi, PaymentClient } from 'appflow-payment-initiation-api';
import { PaymentClientWebView } from './payment-client-web-view';
import { Observable, of } from 'rxjs';
import { AppFlowBridge } from './appflow-bridge';

export class PaymentApiWebView implements PaymentApi {

    private static instance: PaymentApiWebView;

    private paymentClient: PaymentClientWebView;

    public static getInstance(appFlowBridge: AppFlowBridge): PaymentApi {
        if (!PaymentApiWebView.instance) {
            PaymentApiWebView.instance = new PaymentApiWebView(appFlowBridge);
        }

        return PaymentApiWebView.instance;
    }

    private constructor(private appFlowBridge: AppFlowBridge) { 
        this.paymentClient = new PaymentClientWebView(appFlowBridge);
    }

    /**
     * Get the API version.
     *
     * The API versioning follows semver rules with major.minor.patch versions.
     *
     * @return The API version
     */
    public getApiVersion(): Observable<string> {
        return of(this.appFlowBridge.getApiVersion());
    }

    /**
     * Returns true if the processing service that handles API requests is installed.
     *
     * If not installed, none of the API calls will function.
     *
     * @return True if API processing service is installed, false otherwise
     */
    public isProcessingServiceInstalled(): Observable<boolean> {
        return of(this.appFlowBridge.isProcessingServiceInstalled());
    }

    /**
     * Get the processing service version installed on this device.
     *
     * @return The processing service version (semver format)
     */
    public getProcessingServiceVersion(): Observable<string> {
        return of(this.appFlowBridge.getProcessingServiceVersion());
    }

    /**
     * Get a new instance of a {@link PaymentClient} to initiate payments.
     *
     * @return An instance of {@link PaymentClient}
     */
    public getPaymentClient(): PaymentClient {
        return this.paymentClient;
    }


}