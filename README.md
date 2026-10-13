# Interval Timer

An Android interval timer. Build a workout from sets, work, and rest, save it, and run it. A preset opens on a start screen. After START, a fixed 5 second countdown runs, then work and rest alternate. The last set is work only.

## Screens

- **Home.** A black **NEW TIMER** button, then saved presets. A preset button reads like `45/15 - 14:45` (45 seconds work, 15 seconds rest, 15 sets, with no rest after the last work). Press and hold a preset to delete it.
- **New timer.** Set the count, work, and rest with minus and plus, or tap the number to type it. Work and rest use minutes:seconds (`00:45` is 45 seconds). Plus and minus move work and rest by 5 seconds. **TOTAL** is every work interval plus a rest after each work except the last. **SAVE** returns to the home screen.
- **Start.** A summary sits above **START**, for example `WORK - 00:45`, `REST - 00:15`, `TOTAL - 14:45`. **BACK** returns home. **EDIT** opens that preset. **DELETE** asks YES or NO, and YES removes the preset.
- **Run.** **COUNTDOWN** and **REST** use a black screen with white text. **WORK** uses a white screen with black text. The screen stays on, and the phone does not lock, until the timer finishes or you leave. **PAUSE** sits above **EXIT**. Pausing changes that button to **RESUME** and holds the clock. **EXIT** asks YES or NO. **MENU** sits toward the bottom when the workout is done. Each timer chimes on its last four seconds. The last chime is higher, and when the workout ends that higher chime plays twice more, half a second apart. Chimes use the phone's alarm volume, which is separate from media volume.

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
