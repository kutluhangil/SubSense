import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';

/**
 * Thin client wrappers around the referral Cloud Functions. All cross-user
 * access goes through these (Admin SDK on the server), so Firestore rules
 * stay locked and reward grants are enforced server-side.
 */

export interface ReferralInfo {
  status: string;
  code: string;
  referredCount: number;
  proDaysEarned: number;
  proUntil: number | null;
}

export interface RedeemResult {
  status: string; // 'success' | 'already_redeemed' | 'self_referral' | 'unknown_code' | 'invalid_code' | 'error'
  proDaysGranted?: number;
}

export const getReferralCode = async (): Promise<ReferralInfo> => {
  const fn = httpsCallable<unknown, ReferralInfo>(functions, 'getReferralCode');
  const res = await fn({});
  return res.data;
};

export const redeemReferral = async (code: string): Promise<RedeemResult> => {
  const fn = httpsCallable<{ code: string }, RedeemResult>(functions, 'redeemReferral');
  const res = await fn({ code: code.trim() });
  return res.data;
};
