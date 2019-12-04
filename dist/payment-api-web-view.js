import { PaymentClientWebView } from './payment-client-web-view';
import { of } from 'rxjs';
var PaymentApiWebView = /** @class */ (function () {
    function PaymentApiWebView(appFlowBridge) {
        this.appFlowBridge = appFlowBridge;
        this.paymentClient = new PaymentClientWebView(appFlowBridge);
    }
    PaymentApiWebView.getInstance = function (appFlowBridge) {
        if (!PaymentApiWebView.instance) {
            PaymentApiWebView.instance = new PaymentApiWebView(appFlowBridge);
        }
        return PaymentApiWebView.instance;
    };
    /**
     * Get the API version.
     *
     * The API versioning follows semver rules with major.minor.patch versions.
     *
     * @return The API version
     */
    PaymentApiWebView.prototype.getApiVersion = function () {
        return of(this.appFlowBridge.getApiVersion());
    };
    /**
     * Returns true if the processing service that handles API requests is installed.
     *
     * If not installed, none of the API calls will function.
     *
     * @return True if API processing service is installed, false otherwise
     */
    PaymentApiWebView.prototype.isProcessingServiceInstalled = function () {
        return of(this.appFlowBridge.isProcessingServiceInstalled());
    };
    /**
     * Get the processing service version installed on this device.
     *
     * @return The processing service version (semver format)
     */
    PaymentApiWebView.prototype.getProcessingServiceVersion = function () {
        return of(this.appFlowBridge.getProcessingServiceVersion());
    };
    /**
     * Get a new instance of a {@link PaymentClient} to initiate payments.
     *
     * @return An instance of {@link PaymentClient}
     */
    PaymentApiWebView.prototype.getPaymentClient = function () {
        return this.paymentClient;
    };
    return PaymentApiWebView;
}());
export { PaymentApiWebView };
