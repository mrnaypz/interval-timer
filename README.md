# Interval Timer

An Android interval timer. Build a workout from sets, work, and rest, save it, and run it. The run screen starts with a fixed 5 second countdown, then alternates work and rest for every set.

## Screens

- **Home.** A black **NEW TIMER** button, then saved presets. A preset button reads like `45/15 - 15:00` (45 seconds work, 15 seconds rest, 15 minutes total). Press and hold a preset to delete it.
- **New timer.** Set the count, work, and rest with minus and plus, or tap the number to type it. Work and rest use minutes.seconds (`00.45` is 45 seconds). Plus and minus move work and rest by 5 seconds. **TOTAL** is sets × (work + rest). **SAVE** returns to the home screen.
- **Run.** **COUNTDOWN**, then **WORK**, then **REST**, using the same layout. **EXIT** leaves early. **MENU** appears when the workout finishes.

The typeface is Fredoka Light.

## Run the logic tests

```bash
npm install
npm test
npm run typecheck
```

## Run it on an Android emulator

Install JDK 17, Android SDK Platform 36, Build-Tools 36.0.0, NDK 27.1.12297006, the emulator, and an x86_64 system image. Then:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

npx expo prebuild --platform android
npx expo run:android
```

`npx expo run:android` compiles the app, installs it on a running emulator or a connected phone, and starts the dev server.

## Install on a phone

A release APK runs without the dev server:

```bash
cd android
./gradlew assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/`. Copy it to the phone and open it. Allow installs from the app you used to open the file.
