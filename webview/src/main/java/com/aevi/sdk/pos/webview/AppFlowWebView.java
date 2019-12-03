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
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.aevi.sdk.pos.flow.PaymentApi;
import com.aevi.sdk.pos.flow.PaymentClient;
import com.aevi.sdk.pos.flow.model.Payment;

import java.util.UUID;

import io.reactivex.disposables.Disposable;

/**
 * Extends a Webview and displays a JSON string formatted nicely with syntax highlighting
 */
public class AppFlowWebView extends WebView {

    private PaymentClient paymentClient;
    private Disposable eventsDispose;

    public AppFlowWebView(Context context) {
        super(context);
        init(context);
    }

    public AppFlowWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AppFlowWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        paymentClient = PaymentApi.getPaymentClient(context);

        //        eventsDispose = paymentClient.subscribeToSystemEvents()
        //                .subscribe(flowEvent -> {
        //                    if (eventsCallback != null) {
        //                        PluginResult result = new PluginResult(PluginResult.Status.OK, flowEvent.toJson());
        //                        result.setKeepCallback(true);
        //                        eventsCallback.sendPluginResult(result);
        //                    }
        //                }, throwable -> {
        //                    Log.e(AppFlowWebView.class.getSimpleName(), "Failed to subscribe", throwable);
        //                    if (eventsCallback != null) {
        //                        eventsCallback.error("Failed to subscribe to events" + throwable.getMessage());
        //                    }
        //                });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) {
                WebView.setWebContentsDebuggingEnabled(true);
            }
        }

        WebSettings settings = getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        addJavascriptInterface(new AppFlowInterface(), "appflow");
    }

    private class CallbackContext {

        private final String SUCCESS = "OK";
        private final String ERROR = "ERROR";
        private final String id;

        CallbackContext() {
            id = UUID.randomUUID().toString();
        }

        String getId() {
            return id;
        }

        void success(String json) {
            callJavaScript("callbackFromNative", id, SUCCESS, json);
        }

        void error(String error) {
            callJavaScript("callbackFromNative", id, ERROR, error);
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
            stringBuilder.append(")}catch(error){appflow.onError(error.message);}");

            Log.d("XXX", stringBuilder.toString());
            evaluateJavascript(stringBuilder.toString(), new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String s) {
                    Log.d("XXX", "Executed javascript: " + s);
                }
            });
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
        public String getPaymentSettings() {
            CallbackContext callbackContext = new CallbackContext();
            paymentClient.getPaymentSettings()
                    .subscribe((paymentSettings) -> callbackContext.success(paymentSettings.toJson()),
                               throwable -> callbackContext.error(throwable.getMessage()));
            return callbackContext.getId();
        }

        @JavascriptInterface
        public String initiatePayment(String paymentJson) {
            CallbackContext callbackContext = new CallbackContext();
            Payment payment = Payment.fromJson(paymentJson);
            paymentClient.initiatePayment(payment)
                    .subscribe(() -> callbackContext.success("Payment accepted"),
                               throwable -> callbackContext.error(throwable.getMessage()));
            return callbackContext.getId();
        }

        @JavascriptInterface
        public void onError(String error) {
            throw new Error(error);
        }
    }
}
