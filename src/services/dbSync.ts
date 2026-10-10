import { db, isFirebaseConfigured } from './firebase';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
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
  UserAccount,
} from '@/types';
import { StorageService } from './storage';

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
 * Lắng nghe danh sách tất cả các giải đấu trên Cloud (Realtime)
 * Lấy trực tiếp từ collection 'tournament_data' để đảm bảo mọi thiết bị
 * luôn nhìn thấy đúng 100% tất cả các giải đấu vừa được tạo.
 */
export function subscribeTournamentsListCloud(
  onList: (list: Tournament[], activeId?: string) => void
): () => void {
  if (!db || !isFirebaseConfigured()) return () => {};

  try {
    const colRef = collection(db, 'tournament_data');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudTournaments: Tournament[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.tournament && data.tournament.id) {
              cloudTournaments.push(data.tournament);
              // Lưu trước cache số đội và số trận đấu vào StorageService để hiển thị trên Portal
              if (Array.isArray(data.teams) || Array.isArray(data.matches)) {
                StorageService.saveTournamentStatsCache(
                  data.tournament.id,
                  data.teams || [],
                  data.matches || []
                );
              }
            }
          });

          if (cloudTournaments.length > 0) {
            onList(cloudTournaments);
          }
        }
      },
      (err) => {
        console.warn('[Firestore] Lỗi đồng bộ danh sách giải đấu:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('[Firestore] Lỗi kết nối danh sách giải đấu:', error);
    return () => {};
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
        console.warn('[Firestore] Lỗi đồng bộ thời gian thực giải đấu:', err);
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
 * Xóa một giải đấu khỏi Cloud
 */
export async function deleteTournamentCloud(tournamentId: string): Promise<void> {
  if (!db || !isFirebaseConfigured() || !tournamentId) return;

  try {
    const docRef = doc(db, 'tournament_data', tournamentId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[Firestore] Lỗi xóa giải đấu khỏi đám mây:', err);
  }
}

/**
 * Đẩy danh sách tất cả các giải đấu lên Cloud meta
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

/**
 * Lắng nghe cập nhật danh sách tài khoản người dùng trên Cloud Firestore (Realtime)
 * Đảm bảo tài khoản tạo trên PC, điện thoại hoặc bất kỳ thiết bị nào đều đồng bộ tức thì 100%
 */
export function subscribeUserAccountsCloud(
  onAccounts: (accounts: UserAccount[]) => void
): () => void {
  if (!db || !isFirebaseConfigured()) return () => {};

  try {
    const docRef = doc(db, 'system', 'user_accounts');
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.accounts)) {
            onAccounts(data.accounts as UserAccount[]);
          }
        }
      },
      (err) => {
        console.warn('[Firestore] Lỗi đồng bộ danh sách tài khoản người dùng:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('[Firestore] Lỗi kết nối tài khoản người dùng:', error);
    return () => {};
  }
}

/**
 * Đẩy danh sách tài khoản người dùng lên Cloud Firestore
 */
export async function pushUserAccountsCloud(accounts: UserAccount[]): Promise<void> {
  if (!db || !isFirebaseConfigured()) return;

  try {
    const docRef = doc(db, 'system', 'user_accounts');
    const cleaned = cleanForFirestore({
      accounts,
      updatedAt: Date.now(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error('[Firestore] Lỗi lưu danh sách tài khoản lên đám mây:', err);
  }
}

/**
 * Tải trực tiếp danh sách tài khoản người dùng từ Firestore (1 lần khi khởi tạo)
 */
export async function fetchUserAccountsCloud(): Promise<UserAccount[]> {
  if (!db || !isFirebaseConfigured()) return [];

  try {
    const docRef = doc(db, 'system', 'user_accounts');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.accounts)) {
        return data.accounts as UserAccount[];
      }
    }
    return [];
  } catch {
    return [];
  }
}
