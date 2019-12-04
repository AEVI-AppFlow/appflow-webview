define("payment-client-web-view", ["require", "exports", "rxjs", "appflow-payment-initiation-api"], function (require, exports, rxjs_1, appflow_payment_initiation_api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var callbackMap = new Map();
    class CallbackContext {
        constructor(id, success, error) {
            this.id = id;
            this.success = success;
            this.error = error;
        }
    }
    class PaymentClientWebView {
        constructor() {
            this.paymentResponseSubject = new rxjs_1.Subject();
            this.responseSubject = new rxjs_1.Subject();
            this.paymentSettings = new rxjs_1.ReplaySubject(1);
            // PaymentClientWebView.eventsSubject.pipe(
            //     finalize(() => {
            //         cordovaExec<string>('clearEventsCallback').then(() => {
            //             console.log("Events callback cleared");
            //         });
            //     }), 
            //     share()
            // );
            console.log("Attaching callback to window");
            window.callbackFromNative = (id, status, param) => this.callbackFromNative;
        }
        exec(action, callback, error, args) {
            var id = action(args);
            var callCtx = new CallbackContext(id, callback, error);
            callbackMap.set(id, callCtx);
        }
        callbackFromNative(id, status, param) {
            if (callbackMap.has(id)) {
                var callMth = callbackMap.get(id);
                if (callMth) {
                    if (status === "OK") {
                        callMth.success(param);
                    }
                    else {
                        callMth.error(param);
                    }
                }
            }
        }
        ;
        /**
         * Retrieve a snapshot of the current payment settings.
         *
         * This includes system settings, flow configurations, information about flow services, etc.
         *
         * Subscribe to system events via {@link #subscribeToSystemEvents()} for updates when the state changes.
         *
         * @return Single emitting a {@link PaymentSettings} instance
         */
        getPaymentSettings() {
            this.exec(appflow.getPaymentSettings, (json) => {
                var ps = appflow_payment_initiation_api_1.PaymentSettings.fromJson(json);
                console.log("NATIVE: PaymentSettings");
                console.log(ps);
                this.paymentSettings.next(ps);
            }, (e) => {
                this.paymentSettings.error(e);
            });
            return this.paymentSettings.asObservable();
        }
        /**
         * Initiate processing of the provided {@link Request}.
         *
         * Due to the nature of Android component lifecycles, AppFlow can not guarantee that your activity/service is still alive when a flow is complete,
         * meaning it may not be able to receive the response via this rx chain. To ensure that your application receives a response in a reliable way,
         * your application must instead implement a {@link BaseResponseListenerService}.
         *
         * This method returns a {@link Completable} that will complete successfully if the request is accepted, or send an error if the request is invalid.
         *
         * If your request is rejected or an error occurs during the flow, a {@link FlowException} will be delivered to the `onError` handler. This
         * {@link FlowException} contains an error code that can be mapped to one of the constants in {@link ErrorConstants} and an error message
         * that further describes the problem. These values are not intended to be presented directly to the merchant.
         *
         * @param request The request
         * @return Completable that represents the acceptance of the request
         */
        initiateRequest(request) {
            // setup the response callback
            // cordovaExec<string>('setResponseCallback').then((json) => {
            //     var response = Response.fromJson(json);
            //     console.log("Got response in callback");
            //     this.responseSubject.next(response);
            // }).catch((error) => {
            //     console.log("Got error from response");
            //     console.log(error);
            // });
            // return cordovaExec('initiateRequest', [request.toJson()]);
            return new Promise(() => { });
        }
        /**
         * Initiate payment processing based on the provided {@link Payment}.
         *
         * Due to the nature of Android component lifecycles, AppFlow can not guarantee that your activity/service is still alive when a flow is complete,
         * meaning it may not be able to receive the response via this rx chain. To ensure that your application receives a response in a reliable way,
         * your application must instead implement a {@link BasePaymentResponseListenerService}.
         *
         * This method returns a {@link Completable} that will complete successfully if the request is accepted, or send an error if the request is invalid.
         *
         * If your request is rejected or an error occurs during the flow, a {@link FlowException} will be delivered to the `onError` handler. This
         * {@link FlowException} contains an error code that can be mapped to one of the constants in {@link ErrorConstants} and an error message
         * that further describes the problem. These values are not intended to be presented directly to the merchant.
         *
         * @param payment The payment to process
         * @return Completable that represents the acceptance of the request
         */
        initiatePayment(payment) {
            // setup the response callback
            // cordovaExec<string>('setPaymentResponseCallback').then((json) => {
            //     var paymentResponse = PaymentResponse.fromJson(json);
            //     console.log("Got response in callback");
            //     this.paymentResponseSubject.next(paymentResponse);
            // }).catch((error) => {
            //     console.log("Got error from payment response");
            //     console.log(error);
            // });
            // return cordovaExec('initiatePayment', [payment.toJson()]);
            return new Promise(() => { });
        }
        /**
         * Returns a stream of completed PaymentResponses for the given parameters.
         *
         * This query will <strong>only</strong> return {@link PaymentResponse} objects that were generated in response to requests by your application (package name)
         *
         * Responses will <strong>only</strong> be returned for completed flows. Responses for incomplete or in-progress flows will not be returned by this method
         *
         * @param responseQuery An object representing some parameters to limit the query by
         * @return An Observable stream of payment responses
         */
        queryPaymentResponses(responseQuery) {
            console.log("queryPaymentResponses - Not implemented yet!");
            return rxjs_1.NEVER;
        }
        /**
         * Returns a stream of completed Responses for the given parameters
         *
         * This query will <strong>only</strong> return {@link Response} objects that were generated in response to requests by your application (package name)
         *
         * Responses will <strong>only</strong> be returned for completed flows. Responses for incomplete or in-progress flows will not be returned by this method
         *
         * @param responseQuery An object representing some parameters to limit the query by
         * @return An Observable stream of responses
         */
        queryResponses(responseQuery) {
            console.log("queryResponses - Not implemented yet!");
            return rxjs_1.NEVER;
        }
        /**
         * Query for devices connected to the processing service, if multi-device is enabled.
         *
         * It is up to the flow processing service configuration if multi-device is enabled or not. See {@link PaymentSettings} for more details.
         *
         * Returns a single that emits a list of currently connected devices.
         *
         * This should be queried each time a selection is required to ensure an up-to-date list.
         *
         * You can subscribe to {@link #subscribeToSystemEvents()} for updates on changes to the available devices.
         *
         * @return Single emitting a list of {@link Device} objects containing basic device info
         */
        getDevices() {
            console.log("getDevices - Not implemented yet!");
            return rxjs_1.NEVER;
        }
        /**
         * Subscribe to general system events.
         *
         * Examples are when there are changed to devices, applications or system settings.
         *
         * @return A stream that will emit {@link FlowEvent} items
         */
        subscribeToSystemEvents() {
            // cordovaExecCallback('setSystemEventsCallback', this.onFlowEvent, [{keepCallback: true}]);
            // return PaymentClientCordova.eventsSubject.asObservable();
            return rxjs_1.NEVER;
        }
        onFlowEvent(data) {
            var event = appflow_payment_initiation_api_1.FlowEvent.fromJson(data);
            console.log("Got event in callback");
            console.log(event);
            //PaymentClientCordova.eventsSubject.next(event);
        }
        subscribeToPaymentResponses() {
            return this.paymentResponseSubject.asObservable();
        }
        subscribeToResponses() {
            return this.responseSubject.asObservable();
        }
    }
    exports.PaymentClientWebView = PaymentClientWebView;
    PaymentClientWebView.eventsSubject = new rxjs_1.Subject();
});
define("payment-api-web-view", ["require", "exports", "payment-client-web-view", "rxjs"], function (require, exports, payment_client_web_view_1, rxjs_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PaymentApiWebView {
        constructor() {
            this.paymentClient = new payment_client_web_view_1.PaymentClientWebView();
        }
        static getInstance() {
            if (!PaymentApiWebView.instance) {
                PaymentApiWebView.instance = new PaymentApiWebView();
            }
            return PaymentApiWebView.instance;
        }
        /**
         * Get the API version.
         *
         * The API versioning follows semver rules with major.minor.patch versions.
         *
         * @return The API version
         */
        getApiVersion() {
            return rxjs_2.of(appflow.getApiVersion());
        }
        /**
         * Returns true if the processing service that handles API requests is installed.
         *
         * If not installed, none of the API calls will function.
         *
         * @return True if API processing service is installed, false otherwise
         */
        isProcessingServiceInstalled() {
            return rxjs_2.of(appflow.isProcessingServiceInstalled());
        }
        /**
         * Get the processing service version installed on this device.
         *
         * @return The processing service version (semver format)
         */
        getProcessingServiceVersion() {
            return rxjs_2.of(appflow.getProcessingServiceVersion());
        }
        /**
         * Get a new instance of a {@link PaymentClient} to initiate payments.
         *
         * @return An instance of {@link PaymentClient}
         */
        getPaymentClient() {
            return this.paymentClient;
        }
    }
    exports.PaymentApiWebView = PaymentApiWebView;
});
define("index", ["require", "exports", "payment-api-web-view", "payment-client-web-view", "payment-api-web-view"], function (require, exports, payment_api_web_view_1, payment_client_web_view_2, payment_api_web_view_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PaymentApiWebView = payment_api_web_view_1.PaymentApiWebView;
    exports.PaymentClientWebView = payment_client_web_view_2.PaymentClientWebView;
    console.log("hdsahdwh8wiwuieuiwuiwueiuwie");
    payment_api_web_view_2.PaymentApiWebView.getInstance().getPaymentClient();
});
