import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  orderBy,
  updateDoc,
  increment,
  setDoc,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
export { onAuthStateChanged };
export type { User };

export interface JobAlert {
  id?: string;
  email: string;
  keywords?: string;
  category?: string;
  region?: string;
  jobTypes?: string[];
  userId?: string;
  createdAt?: any;
}

export interface SavedJob {
  id?: string;
  jobId: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  url: string;
  category?: string;
  savedAt?: any;
}

export interface JobPosting {
  id?: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobDescription: string;
  jobGeo: string;
  jobType: string;
  jobCategory: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  url: string;
  employerId: string;
  createdAt?: any;
  isFeatured?: boolean;
  isApproved?: boolean;
}

export interface JobAnalytics {
  jobId: string;
  views: number;
  clicks: number;
  lastUpdated: any;
}

export interface VibeCheck {
  id?: string;
  companyName: string;
  asyncScore: number;
  meetingScore: number;
  borderlessScore: number;
  userId: string;
  createdAt?: any;
}

export async function createJobAlert(alert: JobAlert) {
  try {
    const alertsCol = collection(db, 'alerts');
    await addDoc(alertsCol, {
      ...alert,
      createdAt: serverTimestamp(),
      lastChecked: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating job alert:", error);
    throw error;
  }
}

export async function getAlertsByEmail(email: string) {
  const alertsCol = collection(db, 'alerts');
  const q = query(alertsCol, where('email', '==', email), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobAlert));
}

export async function deleteAlert(alertId: string) {
  await deleteDoc(doc(db, 'alerts', alertId));
}

export async function saveJob(job: Omit<SavedJob, 'savedAt'>) {
  const savedCol = collection(db, 'saved_jobs');
  await addDoc(savedCol, {
    ...job,
    savedAt: serverTimestamp()
  });
}

export async function unsaveJob(userId: string, jobId: string) {
  const savedCol = collection(db, 'saved_jobs');
  const q = query(savedCol, where('userId', '==', userId), where('jobId', '==', jobId));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'saved_jobs', d.id)));
  await Promise.all(deletePromises);
}

export async function getSavedJobs(userId: string) {
  const savedCol = collection(db, 'saved_jobs');
  const q = query(savedCol, where('userId', '==', userId), orderBy('savedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedJob));
}

export async function createJobPosting(posting: Omit<JobPosting, 'createdAt' | 'isFeatured' | 'isApproved'>) {
  const postingCol = collection(db, 'postings');
  const docRef = await addDoc(postingCol, {
    ...posting,
    createdAt: serverTimestamp(),
    isFeatured: true, // Direct postings are featured by default
    isApproved: true // Paid postings are auto-approved in success handler
  });
  return docRef.id;
}

export async function getJobPostings(includeUnapproved: boolean = false) {
  const postingCol = collection(db, 'postings');
  const q = includeUnapproved 
    ? query(postingCol, orderBy('createdAt', 'desc'))
    : query(postingCol, where('isApproved', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPosting));
}

export async function updateJobPosting(postingId: string, updates: Partial<JobPosting>) {
  const docRef = doc(db, 'postings', postingId);
  await updateDoc(docRef, updates);
}

export async function deleteJobPosting(postingId: string) {
  await deleteDoc(doc(db, 'postings', postingId));
}

export async function trackJobActivity(jobId: string, type: 'view' | 'click') {
  try {
    const docRef = doc(db, 'analytics', jobId);
    await setDoc(docRef, {
      jobId,
      [type === 'view' ? 'views' : 'clicks']: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error tracking job activity:", error);
  }
}

export async function getJobAnalytics(jobId: string) {
  try {
    const docRef = doc(db, 'analytics', jobId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as JobAnalytics;
    }
    return { jobId, views: 0, clicks: 0, lastUpdated: new Date() } as JobAnalytics;
  } catch (error) {
    console.error("Error fetching job analytics:", error);
    return null;
  }
}

export async function submitVibeCheck(check: Omit<VibeCheck, 'createdAt'>) {
  try {
    const vibeCol = collection(db, 'vibe_checks');
    // Check if user already submitted for this company
    const q = query(vibeCol, where('userId', '==', check.userId), where('companyName', '==', check.companyName));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Update existing
      const docRef = doc(db, 'vibe_checks', snapshot.docs[0].id);
      await updateDoc(docRef, { ...check, createdAt: serverTimestamp() });
    } else {
      // Create new
      await addDoc(vibeCol, { ...check, createdAt: serverTimestamp() });
    }
    return { success: true };
  } catch (error) {
    console.error("Error submitting vibe check:", error);
    throw error;
  }
}

export async function getCompanyVibe(companyName: string) {
  try {
    const vibeCol = collection(db, 'vibe_checks');
    const q = query(vibeCol, where('companyName', '==', companyName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const count = snapshot.docs.length;
    let sumAsync = 0;
    let sumMeeting = 0;
    let sumBorderless = 0;
    
    snapshot.docs.forEach(d => {
      const data = d.data();
      sumAsync += data.asyncScore || 0;
      sumMeeting += data.meetingScore || 0;
      sumBorderless += data.borderlessScore || 0;
    });
    
    return {
      companyName,
      count,
      avgAsync: sumAsync / count,
      avgMeeting: sumMeeting / count,
      avgBorderless: sumBorderless / count,
      overall: (sumAsync + sumMeeting + sumBorderless) / (count * 3)
    };
  } catch (error) {
    console.error("Error getting company vibe:", error);
    return null;
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  isPro?: boolean;
  proExpiresAt?: any;
  createdAt?: any;
}

export async function getUserProfile(uid: string) {
  try {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...updates,
      uid // Ensure UID is always present
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export interface SupportTicket {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  createdAt?: any;
  status: 'pending' | 'resolved';
}

export async function submitSupportTicket(ticket: Omit<SupportTicket, 'createdAt' | 'status'>) {
  try {
    const supportCol = collection(db, 'support_tickets');
    await addDoc(supportCol, {
      ...ticket,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting support ticket:", error);
    throw error;
  }
}
