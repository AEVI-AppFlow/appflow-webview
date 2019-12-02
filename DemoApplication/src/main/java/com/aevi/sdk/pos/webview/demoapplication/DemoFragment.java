package com.aevi.sdk.pos.webview.demoapplication;

import android.os.Bundle;

import androidx.fragment.app.Fragment;

public abstract class DemoFragment extends Fragment {

    private static final String ARG_SECTION_NUMBER = "section_number";

    public DemoFragment() {
    }

    public static Fragment newInstance(int sectionNumber, Fragment fragment) {
        Bundle args = new Bundle();
        args.putInt(ARG_SECTION_NUMBER, sectionNumber);
        fragment.setArguments(args);
        return fragment;
    }
}
