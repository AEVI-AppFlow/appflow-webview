package com.aevi.sdk.pos.webview.demoapplication;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.aevi.sdk.pos.webview.AppFlowWebView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class WebViewFragment extends DemoFragment {

    private AppFlowWebView appFlowWebView;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_webview, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        appFlowWebView = view.findViewById(R.id.appflow_webview);
        super.onViewCreated(view, savedInstanceState);
    }
}
