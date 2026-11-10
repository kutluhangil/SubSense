package com.subsense.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onPause() {
        super.onPause();
        // Data is written to Preferences while the app runs; refresh the widget when
        // the user leaves so the home screen reflects the latest numbers immediately
        // (system periodic updates are otherwise capped at ~30 min).
        SubSenseWidget.updateAll(this);
    }
}
