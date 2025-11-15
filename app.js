// app.js (module)
import { initializeApp, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, setDoc, onSnapshot, query, orderBy, getDocs, serverTimestamp, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

let app, auth, db, storage;
let currentUser = null;
let isAdmin = false;

export async function startApp(firebaseConfig){
  app = initializeApp(firebaseConfig || {});
  setLogLevel('warn');
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  wireUI();
  handleAuthState();
  setupNav();
  setupGames();
}

function $(id){ return document.getElementById(id); }
function createEl(tag, cls){ const e = document.createElement(tag); if(cls) e.className = cls; return e; }

function wireUI(){
  // Auth
  $('loginBtn').onclick = async () => {
    const email = $('email').value.trim(), pass = $('password').value;
    if (!email || !pass) return alert('Email & password required');
    try { await signInWithEmailAndPassword(auth, email, pass); }
    catch(e){ alert('Login failed: ' + e.message); }
  };
  $('registerBtn').onclick = async () => {
    const email = $('email').value.trim(), pass = $('password').value;
    if (!email || !pass) return alert('Email & password required');
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db,'users', res.user.uid), { email, role: 'user', createdAt: serverTimestamp() });
      alert('Registered! You can now login.');
    } catch(e){ alert('Register failed: ' + e.message); }
  };
  $('anonBtn').onclick = async () => {
    try { await signInAnonymously(auth); }
    catch(e){ alert('Guest login failed'); }
  };
  $('logoutBtn').onclick = async () => { await signOut(auth); location.reload(); };

  // Nav
  document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const view = b.dataset.view;
    showView(view);
  }));

  $('quickAddBtn').onclick = () => { if (!currentUser) return alert('Login first'); showView('letters'); openComposer(); };
  $('lettersSearch').addEventListener('input', (e)=> renderLetters(e.target.value));

  // Admin
  $('uploadSeedBtn').onclick = uploadSeedData;
  $('admin-save-letter').onclick = adminSaveLetter;
  $('admin-save-chapter').onclick = adminSaveChapter;
  $('promoteBtn').onclick = promoteUser;

  // Photo Upload
  $('uploadPhotoBtn').onclick = async () => {
    const file = $('photoInput').files[0];
    const caption = $('photoCaption').value.trim();
    if (!file) return alert('Select a photo');
    const refPath = `photos/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, refPath);
    try {
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      await addDoc(collection(db, 'photos'), { imageUrl: url, title: caption, createdAt: serverTimestamp() });
      alert('Photo uploaded!');
      $('photoInput').value = ''; $('photoCaption').value = '';
    } catch(e) { alert('Upload failed: '+e.message); }
  };
}

// ... [rest of your app.js code — letters, chapters, chat, games, etc.] ...
// (Paste the full app.js from your message here — I’ll skip for brevity, but you MUST include it)