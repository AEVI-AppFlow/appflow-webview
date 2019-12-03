import { AppFlowBridge } from  './appflow-bridge';

import { Observable, NEVER, Subject, ReplaySubject } from 'rxjs';
import { finalize, share } from 'rxjs/operators';
import { PaymentClient, Payment, PaymentResponse, ResponseQuery, FlowEvent, Device, PaymentSettings, Request, Response } from 'appflow-payment-initiation-api';

declare var appflow: AppFlowBridge;

var callbackMap = new Map<string, CallbackContext>();

export function callbackFromNative(id: string, status: string, param: string) {
    if(callbackMap.has(id)) {
        var callMth = callbackMap.get(id);
        if(callMth) {
            if(status === "OK") {
                callMth.success(param);
            } else {
                callMth.error(param);
            }
        }
    }
};

function exec(action: (args?: any[]) => string, callback: (data: string) => void, error: (data: string) => void, args?: any[]) {
    var id = action(args);
    var callCtx = new CallbackContext(id, callback, error);
    callbackMap.set(id, callCtx);
}

class CallbackContext {
    id: string;
    success: (data: string) => void;
    error: (data: string) => void;

    constructor(id: string, success: (data: string) => void, error: (data: string) => void) {
        this.id = id;
        this.success = success;
        this.error = error;
    }
}

export class PaymentClientWebView implements PaymentClient {

    private paymentResponseSubject = new Subject<PaymentResponse>();
    private responseSubject = new Subject<Response>();
    private static eventsSubject = new Subject<FlowEvent>();

    private paymentSettings: ReplaySubject<PaymentSettings> = new ReplaySubject(1);

    constructor() {
        // PaymentClientWebView.eventsSubject.pipe(
        //     finalize(() => {
        //         cordovaExec<string>('clearEventsCallback').then(() => {
        //             console.log("Events callback cleared");
        //         });
        //     }), 
        //     share()
        // );
    }

    /**
     * Retrieve a snapshot of the current payment settings.
     *
     * This includes system settings, flow configurations, information about flow services, etc.
     *
     * Subscribe to system events via {@link #subscribeToSystemEvents()} for updates when the state changes.
     *
     * @return Single emitting a {@link PaymentSettings} instance
     */
    public getPaymentSettings(): Observable<PaymentSettings> {
        exec(appflow.getPaymentSettings, (json) => {
            var ps = PaymentSettings.fromJson(json);
            console.log("NATIVE: PaymentSettings");
            console.log(ps)
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
    public initiateRequest(request: Request): Promise<void> {
        // setup the response callback
        cordovaExec<string>('setResponseCallback').then((json) => {
            var response = Response.fromJson(json);
            console.log("Got response in callback");
            this.responseSubject.next(response);
        }).catch((error) => {
            console.log("Got error from response");
            console.log(error);
        });
        return cordovaExec('initiateRequest', [request.toJson()]);
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
    public initiatePayment(payment: Payment): Promise<void> {
        // setup the response callback
        cordovaExec<string>('setPaymentResponseCallback').then((json) => {
            var paymentResponse = PaymentResponse.fromJson(json);
            console.log("Got response in callback");
            this.paymentResponseSubject.next(paymentResponse);
        }).catch((error) => {
            console.log("Got error from payment response");
            console.log(error);
        });
        return cordovaExec('initiatePayment', [payment.toJson()]);
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
    public queryPaymentResponses(responseQuery: ResponseQuery):  Observable<PaymentResponse> {
        console.log("queryPaymentResponses - Not implemented yet!");
        return NEVER;
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
    public queryResponses(responseQuery: ResponseQuery): Observable<Response> {
        console.log("queryResponses - Not implemented yet!");
        return NEVER;
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
    public getDevices(): Observable<Array<Device>> {
        console.log("getDevices - Not implemented yet!");
        return NEVER;
    }

    /**
     * Subscribe to general system events.
     *
     * Examples are when there are changed to devices, applications or system settings.
     *
     * @return A stream that will emit {@link FlowEvent} items
     */
    public subscribeToSystemEvents(): Observable<FlowEvent> {
        cordovaExecCallback('setSystemEventsCallback', this.onFlowEvent, [{keepCallback: true}]);
        return PaymentClientCordova.eventsSubject.asObservable();
    }

    private onFlowEvent(data: string) {
        var event = FlowEvent.fromJson(data);
        console.log("Got event in callback");
        console.log(event);
        PaymentClientCordova.eventsSubject.next(event);
    }

    public subscribeToPaymentResponses(): Observable<PaymentResponse> {
        return this.paymentResponseSubject.asObservable();
    }

    public subscribeToResponses(): Observable<Response> {
        return this.responseSubject.asObservable();
    }
}