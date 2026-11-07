import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, functions, httpsCallable } from '../firebase/firebase';

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

const generateFallbackCode = (): string => {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

export const getReferralCode = async (): Promise<ReferralInfo> => {
  try {
    const fn = httpsCallable<unknown, ReferralInfo>(functions, 'getReferralCode');
    const res = await fn({});
    if (res.data?.code) return res.data;
  } catch {
    // Fallback to direct user doc read/write if Admin SDK service account isn't loaded yet
  }

  const uid = auth.currentUser?.uid;
  if (!uid) {
    return { status: 'error', code: '', referredCount: 0, proDaysEarned: 0, proUntil: null };
  }

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const data = snap.data() || {};
    const referral = (data.referral as Record<string, any>) || {};
    let code = (referral.code as string) || '';
    if (!code) {
      code = generateFallbackCode();
      await setDoc(userRef, { referral: { ...referral, code } }, { merge: true });
    }
    const referredCount = Number(referral.referredCount || 0);
    return {
      status: 'ok',
      code,
      referredCount,
      proDaysEarned: referredCount * 30,
      proUntil: null,
    };
  } catch {
    return { status: 'error', code: '', referredCount: 0, proDaysEarned: 0, proUntil: null };
  }
};

export const redeemReferral = async (code: string): Promise<RedeemResult> => {
  const fn = httpsCallable<{ code: string }, RedeemResult>(functions, 'redeemReferral');
  const res = await fn({ code: code.trim() });
  return res.data;
};
