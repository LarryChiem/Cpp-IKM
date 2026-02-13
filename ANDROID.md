# ANDROID.md

This guide covers the **correct update workflow** for your Capacitor Android build and Google Play Console uploads.

---

## Two different workflows

### A) Local testing on your phone (fast)
Use this when you just want to test changes on a plugged-in device or emulator.

1. Build the web app
   ```bash
   cd web
   npm run build
   ```

2. Copy web assets into Android
   ```bash
   npx cap copy android
   ```

3. Run from Android Studio
   - Open Android Studio: `npx cap open android`
   - Click **Run** (▶) to install a **debug build** on your device

✅ **No versionCode changes required** for local debug runs.

---

### B) Uploading an update to Google Play (AAB)
Use this when you want to upload a new build to **Internal / Closed / Open / Production** tracks.

Google Play requires that **every uploaded App Bundle has a new, never-before-used `versionCode`**.
If you try to upload another AAB with the same versionCode, you'll see:

> “Version code 1 has already been used. Try another version code.”

This is expected behavior.

---

## Step-by-step: publishing a new build to Play Console

### 1) Bump versionCode and versionName
Edit:

`web/android/app/build.gradle`

In `defaultConfig`, update these:

```gradle
versionCode 2
versionName "1.1"
```

Rules:
- `versionCode` must **always increase** (1 → 2 → 3 → ...). Never reuse a number.
- `versionName` is what users see (e.g., 1.0, 1.1). You can keep it in sync with your release notes.

### 2) Build web assets
```bash
cd web
npm run build
```

### 3) Sync/copy into Android
If you only changed web code, copy is enough:
```bash
npx cap copy android
```

If you added/changed plugins or native config, run sync:
```bash
npx cap sync android
```

### 4) Generate a signed App Bundle (AAB)
In Android Studio:
- **Build** → **Generate Signed Bundle / APK…**
- Choose **Android App Bundle (AAB)**
- Select your keystore and **Release** variant
- Finish

Android Studio outputs something like:
`web/android/app/release/app-release.aab`
(or it may show the exact path at the end of the wizard)

### 5) Upload to Play Console
- Go to the track you’re using (Internal / Closed / Open / Production)
- Upload the new `.aab`

If Play Console complains about a reused version code, you missed Step 1.

---

## Deobfuscation (mapping.txt) for crash reports (recommended)
Because you have minify enabled in release builds, Play Console may warn about missing deobfuscation.

After building a release AAB, the mapping file is typically here:

`web/android/app/build/outputs/mapping/release/mapping.txt`

Upload it in Play Console under the bundle’s **Deobfuscation files** section.

---

## Quick checklist before every Play upload
- [ ] `versionCode` incremented (must be unique)
- [ ] `versionName` updated (recommended)
- [ ] `npm run build` ran successfully
- [ ] `npx cap copy android` (or `sync`) ran successfully
- [ ] Generated **Signed AAB (Release)**
- [ ] Uploaded **AAB** to the correct track
- [ ] Uploaded `mapping.txt` (recommended)

---

## Common mistakes

### “Version code already used”
Fix: bump `versionCode` in `web/android/app/build.gradle`, rebuild the signed AAB, upload again.

### Changes don’t show up on Android
Fix:
- `npm run build`
- `npx cap copy android`
- Uninstall the old app from the device (clears cached web assets) and reinstall

### Debug vs Release confusion
- Android Studio **Run** = debug build (not for Play Store)
- Play Store requires **signed release AAB**

---

## Suggested versioning strategy
- `versionCode`: simple counter (1, 2, 3, 4…)
- `versionName`: semantic-ish (1.0, 1.1, 1.2…)
