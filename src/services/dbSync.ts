import { db, isFirebaseConfigured } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import {
  Tournament,
  Team,
  Match,
  Venue,
  Referee,
  Complaint,
  FinancialTransaction,
  TournamentAward,
  AuditLog,
  TournamentStatus,
} from '@/types';

export interface TournamentCloudData {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
  venues: Venue[];
  referees: Referee[];
  complaints: Complaint[];
  finances: FinancialTransaction[];
  awards: TournamentAward[];
  auditLogs: AuditLog[];
  status: TournamentStatus;
  updatedAt?: number;
}

// Sanitize objects by stripping undefined values (Firestore rejects undefined)
function cleanForFirestore<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

/**
 * Lắng nghe cập nhật thời gian thực (Real-time) của 1 giải đấu cụ thể
 */
export function subscribeTournamentCloud(
  tournamentId: string,
  onData: (data: TournamentCloudData) => void,
  onError?: (err: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured() || !tournamentId) {
    return () => {};
  }

  try {
    const docRef = doc(db, 'tournament_data', tournamentId);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as TournamentCloudData;
          onData(data);
        }
      },
      (err) => {
        console.warn('[Firestore] Lỗi đồng bộ thời gian thực:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('[Firestore] Không thể kết nối Firestore:', error);
    return () => {};
  }
}

/**
 * Đẩy dữ liệu cập nhật của giải đấu lên Cloud (Firestore)
 */
export async function pushTournamentCloud(
  tournamentId: string,
  data: Partial<TournamentCloudData>
): Promise<void> {
  if (!db || !isFirebaseConfigured() || !tournamentId) return;

  try {
    const docRef = doc(db, 'tournament_data', tournamentId);
    const cleaned = cleanForFirestore({
      ...data,
      updatedAt: Date.now(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error('[Firestore] Lỗi ghi dữ liệu lên đám mây:', err);
  }
}

/**
 * Lắng nghe danh sách tất cả các giải đấu trên Cloud
 */
export function subscribeTournamentsListCloud(
  onList: (list: Tournament[], activeId?: string) => void
): () => void {
  if (!db || !isFirebaseConfigured()) return () => {};

  try {
    const metaRef = doc(db, 'meta', 'all_tournaments');
    const unsubscribe = onSnapshot(
      metaRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.list)) {
            onList(data.list, data.activeId);
          }
        }
      },
      (err) => {
        console.warn('[Firestore] Lỗi lắng nghe danh sách giải đấu:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('[Firestore] Lỗi danh sách giải đấu:', error);
    return () => {};
  }
}

/**
 * Đẩy danh sách tất cả các giải đấu lên Cloud
 */
export async function pushTournamentsListCloud(
  list: Tournament[],
  activeId?: string
): Promise<void> {
  if (!db || !isFirebaseConfigured()) return;

  try {
    const metaRef = doc(db, 'meta', 'all_tournaments');
    const cleaned = cleanForFirestore({
      list,
      activeId,
      updatedAt: Date.now(),
    });
    await setDoc(metaRef, cleaned, { merge: true });
  } catch (err) {
    console.error('[Firestore] Lỗi lưu danh sách giải đấu:', err);
  }
}

/**
 * Kiểm tra xem giải đấu đã có trên Firestore chưa, nếu chưa có thì khởi tạo ban đầu
 */
export async function ensureTournamentInitializedInCloud(
  tournamentId: string,
  initialData: TournamentCloudData
): Promise<void> {
  if (!db || !isFirebaseConfigured() || !tournamentId) return;

  try {
    const docRef = doc(db, 'tournament_data', tournamentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const cleaned = cleanForFirestore({
        ...initialData,
        updatedAt: Date.now(),
      });
      await setDoc(docRef, cleaned);
    }
  } catch (err) {
    console.warn('[Firestore] Không thể khởi tạo giải đấu trên cloud:', err);
  }
}
