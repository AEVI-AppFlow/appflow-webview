import { Observable } from 'rxjs';

import { PaymentApi, PaymentClient, Payment, PaymentResponse, ResponseQuery, FlowEvent, Device, PaymentSettings, Request, Response } from 'appflow-payment-initiation-api';

export declare class AppFlowBridge {

    private constructor();

    getApiVersion(): string;
    isProcessingServiceInstalled(): boolean;
    getProcessingServiceVersion(): string;

    getPaymentSettings(id: string): void;
    
    initiateRequest(id: string, request: string): Promise<void>;
    
    initiatePayment(id: string, payment: string): Promise<void>;
    
    queryPaymentResponses(id: string, responseQuery: string): Observable<PaymentResponse>;
    
    queryResponses(id: string, responseQuery: string): Observable<Response>;
    
    getDevices(): Observable<Array<Device>>;
    
    subscribeToSystemEvents(): Observable<FlowEvent>;
    subscribeToPaymentResponses(): Observable<PaymentResponse>;
    subscribeToResponses(): Observable<Response>;

    callbackFromNative(id: string, status: string, param: string): void;

    setPaymentResponseCallback(id: string): void;
    setResponseCallback(id: string): void;
    setEventsCallback(id: string): void;
    clearEventsCallback(): void;
}
