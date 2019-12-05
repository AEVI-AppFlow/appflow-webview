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
import com.aevi.sdk.flow.model.Response;
import com.aevi.sdk.flow.service.BaseResponseListenerService;

import androidx.annotation.NonNull;

public class AppFlowResponseListenerService extends BaseResponseListenerService {

    private static final String TAG = AppFlowResponseListenerService.class.getSimpleName();

    @Override
    protected void notifyGenericResponse(Response response) {
        Log.d(TAG, "Got generic response: " + response.toJson());
        AppFlowWebView.CallbackContext callback = AppFlowWebView.getResponseCallback();
        if (callback != null) {
            callback.success(response.toJson());
        }
    }

    @Override
    protected void notifyStatusUpdateResponse(@NonNull Response response) {
        notifyGenericResponse(response);
    }

    @Override
    protected void notifyError(@NonNull String errorCode, @NonNull String errorMessage) {
        Log.d(TAG, "Got response error: " + errorCode + " " + errorMessage);
        AppFlowWebView.CallbackContext callback = AppFlowWebView.getResponseCallback();
        if (callback != null) {
            FlowException fe = new FlowException(errorCode, errorMessage);
            callback.error(fe.toJson());
        }
    }
}
