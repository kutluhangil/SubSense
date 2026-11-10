package com.subsense.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

/**
 * Home-screen widget showing the user's monthly subscription total and next charge.
 *
 * Data is produced by the web layer (src/lib/widget.ts) and stored via Capacitor
 * Preferences, which on Android is the SharedPreferences file "CapacitorStorage"
 * under the key "subsense.widget" — a small JSON blob of already-formatted,
 * already-localized strings. This provider only renders them.
 */
public class SubSenseWidget extends AppWidgetProvider {

    private static final String PREFS = "CapacitorStorage";
    private static final String KEY = "subsense.widget";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            renderWidget(context, manager, id);
        }
    }

    /** Push a fresh render to every placed instance (called from MainActivity.onPause). */
    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName cn = new ComponentName(context, SubSenseWidget.class);
        int[] ids = manager.getAppWidgetIds(cn);
        for (int id : ids) {
            renderWidget(context, manager, id);
        }
    }

    private static void renderWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_subsense);

        JSONObject data = readData(context);
        boolean hasData = data != null && data.optBoolean("hasData", false);

        if (data == null || !hasData) {
            String empty = data != null ? data.optString("emptyText", "No subscriptions yet") : "No subscriptions yet";
            views.setTextViewText(R.id.widget_monthly_label, "");
            views.setTextViewText(R.id.widget_monthly_value, empty);
            views.setViewVisibility(R.id.widget_divider, View.GONE);
            views.setViewVisibility(R.id.widget_next_label, View.GONE);
            views.setViewVisibility(R.id.widget_next_row, View.GONE);
            views.setViewVisibility(R.id.widget_next_date, View.GONE);
        } else {
            views.setTextViewText(R.id.widget_monthly_label, data.optString("monthlyLabel", "Monthly"));
            views.setTextViewText(R.id.widget_monthly_value, data.optString("monthlyText", ""));
            views.setTextViewText(R.id.widget_next_label, data.optString("nextLabel", "Next"));
            views.setTextViewText(R.id.widget_next_name, data.optString("nextName", ""));
            views.setTextViewText(R.id.widget_next_amount, data.optString("nextAmountText", ""));
            views.setTextViewText(R.id.widget_next_date, data.optString("nextDateText", ""));

            boolean hasNext = data.optString("nextName", "").length() > 0;
            int nextVis = hasNext ? View.VISIBLE : View.GONE;
            views.setViewVisibility(R.id.widget_divider, nextVis);
            views.setViewVisibility(R.id.widget_next_label, nextVis);
            views.setViewVisibility(R.id.widget_next_row, nextVis);
            views.setViewVisibility(R.id.widget_next_date, hasNext && data.optString("nextDateText", "").length() > 0 ? View.VISIBLE : View.GONE);
        }

        // Tap anywhere → open the app.
        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launch != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pi = PendingIntent.getActivity(context, 0, launch, flags);
            views.setOnClickPendingIntent(R.id.widget_root, pi);
        }

        manager.updateAppWidget(appWidgetId, views);
    }

    private static JSONObject readData(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = prefs.getString(KEY, null);
            if (raw == null) return null;
            return new JSONObject(raw);
        } catch (Exception e) {
            return null;
        }
    }
}
