import * as functions from "firebase-functions";
export declare const syncPricesWeekly: functions.CloudFunction<unknown>;
export declare const triggerPriceSync: functions.HttpsFunction & functions.Runnable<any>;
