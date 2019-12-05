/*
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package com.aevi.sdk.pos.webview;

import android.util.Log;

import com.aevi.sdk.flow.model.FlowException;
import com.aevi.sdk.pos.flow.model.PaymentResponse;
import com.aevi.sdk.pos.flow.service.BasePaymentResponseListenerService;

import androidx.annotation.NonNull;

public class AppFlowPaymentResponseListenerService extends BasePaymentResponseListenerService {

    private static final String TAG = AppFlowPaymentResponseListenerService.class.getSimpleName();

    @Override
    protected void notifyResponse(PaymentResponse paymentResponse) {
        Log.d(TAG, "Got response: " + paymentResponse.toJson());
        AppFlowWebView.CallbackContext callback = AppFlowWebView.getPaymentResponseCallback();
        if (callback != null) {
            callback.success(paymentResponse.toJson());
        }
    }

    @Override
    protected void notifyError(@NonNull String errorCode, @NonNull String errorMessage) {
        Log.d(TAG, "Got response error: " + errorCode + " " + errorMessage);
        AppFlowWebView.CallbackContext callback = AppFlowWebView.getPaymentResponseCallback();
        if (callback != null) {
            FlowException fe = new FlowException(errorCode, errorMessage);
            callback.error(fe.toJson());
        }
    }
}
