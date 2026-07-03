import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';

/**
 * Thin client wrappers around the friend Cloud Functions. All cross-user
 * access goes through these (Admin SDK on the server), so Firestore rules
 * stay locked and privacy is enforced server-side.
 */

export interface PersonResult {
  uid: string;
  email: string;
  displayName: string | null;
}

export interface FriendRequestPreview {
  uid: string;
  displayName: string | null;
  email: string | null;
}

export interface FriendProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  region?: string | null;
  baseCurrency?: string;
  totalSubscriptions?: number; // omitted if friend hid subscriptions
  monthlySpend?: number; // omitted if friend hid spending
}

export const searchPeople = async (searchTerm: string): Promise<PersonResult[]> => {
  const fn = httpsCallable<{ searchTerm: string }, PersonResult[]>(functions, 'searchUsers');
  const res = await fn({ searchTerm: searchTerm.trim() });
  return (res.data as PersonResult[]) || [];
};

export const sendFriendRequest = async (toUid: string): Promise<string> => {
  const fn = httpsCallable<{ toUid: string }, { status: string }>(functions, 'sendFriendRequestFn');
  const res = await fn({ toUid });
  return res.data.status;
};

export const respondFriendRequest = async (senderUid: string, accept: boolean): Promise<string> => {
  const fn = httpsCallable<{ senderUid: string; accept: boolean }, { status: string }>(
    functions,
    'respondFriendRequestFn'
  );
  const res = await fn({ senderUid, accept });
  return res.data.status;
};

export const listFriendRequests = async (): Promise<FriendRequestPreview[]> => {
  const fn = httpsCallable<unknown, { requests: FriendRequestPreview[] }>(functions, 'listFriendRequestsFn');
  const res = await fn({});
  return res.data.requests || [];
};

export const listFriends = async (): Promise<FriendProfile[]> => {
  const fn = httpsCallable<unknown, { friends: FriendProfile[] }>(functions, 'listFriendsFn');
  const res = await fn({});
  return res.data.friends || [];
};
