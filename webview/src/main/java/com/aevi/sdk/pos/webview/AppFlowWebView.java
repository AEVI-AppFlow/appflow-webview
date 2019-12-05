/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.aevi.sdk.pos.webview;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.aevi.sdk.pos.flow.PaymentApi;
import com.aevi.sdk.pos.flow.PaymentClient;
import com.aevi.sdk.pos.flow.model.Payment;

import io.reactivex.disposables.Disposable;

/**
 * Extends a Webview and displays a JSON string formatted nicely with syntax highlighting
 */
public class AppFlowWebView extends WebView {

    private PaymentClient paymentClient;
    private Disposable eventsDispose;

    private static CallbackContext paymentResponseCallback;
    private static CallbackContext responseCallback;
    private static CallbackContext eventsCallback;

    public AppFlowWebView(Context context) {
        super(context);
    }

    public AppFlowWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public AppFlowWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public static CallbackContext getEventsCallback() {
        return eventsCallback;
    }

    public static CallbackContext getPaymentResponseCallback() {
        return paymentResponseCallback;
    }

    public static CallbackContext getResponseCallback() {
        return responseCallback;
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        paymentClient = PaymentApi.getPaymentClient(getContext());

        eventsDispose = paymentClient.subscribeToSystemEvents()
                .subscribe(flowEvent -> {
                    if (eventsCallback != null) {
                        eventsCallback.success(flowEvent.toJson());
                    }
                }, throwable -> {
                    Log.e(AppFlowWebView.class.getSimpleName(), "Failed to subscribe", throwable);
                    if (eventsCallback != null) {
                        eventsCallback.error("Failed to subscribe to events" + throwable.getMessage());
                    }
                });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) {
                WebView.setWebContentsDebuggingEnabled(true);
            }
        }

        WebSettings settings = getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        addJavascriptInterface(new AppFlowInterface(), "appFlowBridge");
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        if (eventsDispose != null) {
            eventsDispose.dispose();
            eventsDispose = null;
        }
    }

    class CallbackContext {

        private final String SUCCESS = "OK";
        private final String ERROR = "ERROR";
        private final String id;

        CallbackContext(String id) {
            this.id = id;
        }

        String getId() {
            return id;
        }

        void success(String json) {
            callJavaScript("paymentClient.callbackFromNative", id, SUCCESS, json);
        }

        void error(String error) {
            callJavaScript("paymentClient.callbackFromNative", id, ERROR, error);
        }

        private void callJavaScript(String methodName, Object... params) {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.append("javascript:try{");
            stringBuilder.append(methodName);
            stringBuilder.append("(");
            for (int i = 0; i < params.length; i++) {
                Object param = params[i];
                if (param instanceof String) {
                    stringBuilder.append("'");
                    stringBuilder.append(param.toString().replace("'", "\\'"));
                    stringBuilder.append("'");
                }
                if (i < params.length - 1) {
                    stringBuilder.append(",");
                }
            }
            stringBuilder.append(")}catch(error){appFlowBridge.onError(error.message);}");

            evaluateJavascript(stringBuilder.toString(), s -> Log.d(AppFlowWebView.class.getSimpleName(), "Executed javascript"));
        }
    }

    private class AppFlowInterface {

        @JavascriptInterface
        public String getApiVersion() {
            return PaymentApi.getApiVersion();
        }

        @JavascriptInterface
        public String getProcessingServiceVersion() {
            return PaymentApi.getProcessingServiceVersion(AppFlowWebView.this.getContext());
        }

        @JavascriptInterface
        public boolean isProcessingServiceInstalled() {
            return PaymentApi.isProcessingServiceInstalled(AppFlowWebView.this.getContext());
        }

        @JavascriptInterface
        public void getPaymentSettings(String id) {
            CallbackContext callbackContext = new CallbackContext(id);
            paymentClient.getPaymentSettings()
                    .subscribe((paymentSettings) -> callbackContext.success(paymentSettings.toJson()),
                               throwable -> callbackContext.error(throwable.getMessage()));
        }

        @JavascriptInterface
        public void initiatePayment(String id, String paymentJson) {
            CallbackContext callbackContext = new CallbackContext(id);
            Payment payment = Payment.fromJson(paymentJson);
            paymentClient.initiatePayment(payment)
                    .subscribe(() -> callbackContext.success("Payment accepted"),
                               throwable -> callbackContext.error(throwable.getMessage()));
        }

        @JavascriptInterface
        public void onError(String error) {
            throw new Error(error);
        }

        @JavascriptInterface
        public void setPaymentResponseCallback(String id) {
            paymentResponseCallback = new CallbackContext((id));
        }

        @JavascriptInterface
        public void setResponseCallback(String id) {
            responseCallback = new CallbackContext((id));
        }

        @JavascriptInterface
        public void setEventsCallback(String id) {
            eventsCallback = new CallbackContext((id));
        }

        @JavascriptInterface
        public void clearEventsCallback() {
            eventsCallback = null;
        }
    }
}
