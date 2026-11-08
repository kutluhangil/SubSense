import * as functions from "firebase-functions";
export declare function fetchAndStoreFx(db?: FirebaseFirestore.Firestore): Promise<boolean>;
export declare function runPriceSync(options?: {
    brands?: string[];
    force?: boolean;
}): Promise<{
    updated: number;
    changed: number;
    fxUpdated: boolean;
    geminiAvailable: boolean;
    items: Record<string, any>;
}>;
export declare const syncPricesWeekly: functions.CloudFunction<unknown>;
export declare const triggerPriceSync: functions.HttpsFunction & functions.Runnable<any>;
