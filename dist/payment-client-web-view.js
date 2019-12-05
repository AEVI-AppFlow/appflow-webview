import { NEVER, Subject, ReplaySubject } from 'rxjs';
import { finalize, share } from 'rxjs/operators';
import { Payment, PaymentResponse, FlowEvent, PaymentSettings, Request, Response } from 'appflow-payment-initiation-api';
import { v4 as uuid } from 'uuid';
var callbackMap = new Map();
var CallbackContext = /** @class */ (function () {
    function CallbackContext(id, success, error, keepAlive) {
        if (keepAlive === void 0) { keepAlive = false; }
        this.id = id;
        this.success = success;
        this.error = error;
        this.keepAlive = keepAlive;
    }
    return CallbackContext;
}());
var PaymentClientWebView = /** @class */ (function () {
    function PaymentClientWebView(appFlowBridge) {
        var _this = this;
        this.appFlowBridge = appFlowBridge;
        this.paymentResponseSubject = new Subject();
        this.responseSubject = new Subject();
        this.paymentSettings = new ReplaySubject(1);
        PaymentClientWebView.eventsSubject.pipe(finalize(function () {
            appFlowBridge.clearEventsCallback();
            console.log("Events callback cleared");
        }), share());
        // setup the payment response callback
        var prid = this.setupCallback(function (json) {
            var paymentResponse = PaymentResponse.fromJson(json);
            console.log("Got response in callback");
            _this.paymentResponseSubject.next(paymentResponse);
        }, function (e) {
            console.log("Got error from payment response");
            console.log(e);
        }, [], true);
        this.appFlowBridge.setPaymentResponseCallback(prid);
        // setup the response callback
        var rid = this.setupCallback(function (json) {
            var response = Response.fromJson(json);
            console.log("Got response in callback");
            _this.responseSubject.next(response);
        }, function (e) {
            console.log("Got error from response");
            console.log(e);
        }, [], true);
        this.appFlowBridge.setResponseCallback(rid);
    }
    PaymentClientWebView.prototype.setupCallback = function (callback, error, args, keepAlive) {
        if (keepAlive === void 0) { keepAlive = false; }
        var id = uuid();
        var callCtx = new CallbackContext(id, callback, error, keepAlive);
        callbackMap.set(id, callCtx);
        return id;
    };
    PaymentClientWebView.prototype.callbackFromNative = function (id, status, param) {
        console.log("Got callback for id: " + id + " status: " + status);
        if (callbackMap.has(id)) {
            var callMth = callbackMap.get(id);
            if (callMth) {
                if (status === "OK") {
                    callMth.success(param);
                }
                else {
                    callMth.error(param);
                }
                if (!callMth.keepAlive) {
                    callbackMap.delete(id);
                }
            }
        }
    };
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
    PaymentClientWebView.prototype.getPaymentSettings = function () {
        var _this = this;
        var id = this.setupCallback(function (json) {
            var ps = PaymentSettings.fromJson(json);
            console.log("PaymentSettings");
            console.log(ps);
            _this.paymentSettings.next(ps);
        }, function (e) {
            _this.paymentSettings.error(e);
        });
        this.appFlowBridge.getPaymentSettings(id);
        return this.paymentSettings.asObservable();
    };
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
    PaymentClientWebView.prototype.initiateRequest = function (request) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = _this.setupCallback(function (json) {
                console.log("Payment initiated");
                resolve();
            }, function (e) {
                console.log("Failed to initiate payment");
                console.log(e);
                reject(e);
            });
            if (request instanceof Request) {
                _this.appFlowBridge.initiateRequest(id, request.toJson());
            }
            else if (typeof request === "string") {
                _this.appFlowBridge.initiateRequest(id, request);
            }
            else {
                _this.appFlowBridge.initiateRequest(id, JSON.stringify(request));
            }
        });
    };
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
    PaymentClientWebView.prototype.initiatePayment = function (payment) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = _this.setupCallback(function (json) {
                console.log("Payment initiated");
                resolve();
            }, function (e) {
                console.log("Failed to initiate payment");
                console.log(e);
                reject(e);
            });
            if (payment instanceof Payment) {
                _this.appFlowBridge.initiatePayment(id, payment.toJson());
            }
            else if (typeof payment === "string") {
                _this.appFlowBridge.initiatePayment(id, payment);
            }
            else {
                _this.appFlowBridge.initiatePayment(id, JSON.stringify(payment));
            }
        });
    };
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
    PaymentClientWebView.prototype.queryPaymentResponses = function (responseQuery) {
        console.log("queryPaymentResponses - Not implemented yet!");
        return NEVER;
    };
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
    PaymentClientWebView.prototype.queryResponses = function (responseQuery) {
        console.log("queryResponses - Not implemented yet!");
        return NEVER;
    };
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
    PaymentClientWebView.prototype.getDevices = function () {
        console.log("getDevices - Not implemented yet!");
        return NEVER;
    };
    /**
     * Subscribe to general system events.
     *
     * Examples are when there are changed to devices, applications or system settings.
     *
     * @return A stream that will emit {@link FlowEvent} items
     */
    PaymentClientWebView.prototype.subscribeToSystemEvents = function () {
        // setup the payment response callback
        var id = this.setupCallback(function (json) {
            var event = FlowEvent.fromJson(json);
            console.log("Got event in callback");
            console.log(event);
            PaymentClientWebView.eventsSubject.next(event);
        }, function (e) {
            console.log("Got error from payment response");
            console.log(e);
        }, [], true);
        this.appFlowBridge.setEventsCallback(id);
        return PaymentClientWebView.eventsSubject.asObservable();
    };
    PaymentClientWebView.prototype.subscribeToPaymentResponses = function () {
        return this.paymentResponseSubject.asObservable();
    };
    PaymentClientWebView.prototype.subscribeToResponses = function () {
        return this.responseSubject.asObservable();
    };
    PaymentClientWebView.eventsSubject = new Subject();
    return PaymentClientWebView;
}());
export { PaymentClientWebView };
