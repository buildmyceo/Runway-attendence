// sync.js - Runs on the Runway Web App
console.log("Runway Form Auto-Filler: Sync script injected.");

function syncDataToExtension() {
  const profileRaw = window.localStorage.getItem('runway_profile');
  const submissionsRaw = window.localStorage.getItem('runway_submissions');

  if (profileRaw || submissionsRaw) {
    let profile = profileRaw ? JSON.parse(profileRaw) : null;
    
    // Find today's submission
    let todaySub = null;
    if (submissionsRaw) {
      const submissions = JSON.parse(submissionsRaw);
      const todayStr = new Date().toISOString().split('T')[0];
      todaySub = submissions.find(sub => sub.submission_date === todayStr);
    }

    const dataToSync = {
      runway_profile: profile,
      runway_today_sub: todaySub
    };

    chrome.storage.local.set(dataToSync, () => {
      console.log("Runway Form Auto-Filler: Data synced to extension.", dataToSync);
    });
  }
}

// Sync initially and also set up an interval just in case they are editing
syncDataToExtension();

// Listen to local storage changes to sync immediately
window.addEventListener('storage', () => {
  syncDataToExtension();
});

// For same-tab updates (storage event only fires across tabs)
// We can use a simple interval or rely on the user clicking the button
setInterval(syncDataToExtension, 2000);
