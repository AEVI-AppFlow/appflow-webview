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
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * Extends a Webview and displays a JSON string formatted nicely with syntax highlighting
 */
public class AppFlowWebView extends WebView {

    private String json;

    public AppFlowWebView(Context context) {
        super(context);
    }

    public AppFlowWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public AppFlowWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public AppFlowWebView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    /**
     * Set the JSON string into this view
     *
     * @param json The JSON string to set
     */
    public void load(String json) {
        this.json = json;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) {
                WebView.setWebContentsDebuggingEnabled(true);
            }
        }

        WebSettings settings = getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        addJavascriptInterface(new JavaScriptInterface(), "Android");
        loadUrl("file:///android_asset/www/appflow.html");

    }

    private class JavaScriptInterface {

        @JavascriptInterface
        public String getJson() {
            return json;
        }

        @JavascriptInterface
        public String exec()
    }
}
