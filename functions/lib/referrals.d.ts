import * as functions from "firebase-functions";
/**
 * Return the caller's referral code + stats, creating a code on first call.
 * Idempotent: a code is generated once and reused thereafter.
 */
export declare const getReferralCode: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Redeem a referral code for a NEW user (called once, right after signup).
 * Guards: self-referral, already-redeemed, unknown code. On success grants
 * BOTH users 30 days of Pro and increments the referrer's referredCount.
 */
export declare const redeemReferral: functions.HttpsFunction & functions.Runnable<any>;
