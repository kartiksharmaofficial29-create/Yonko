---
name: android-cli
description: Use this skill when the user asks to "use android cli", build/test Android apps, manage emulators, run Gradle tasks, or orchestrate Android SDK tools via terminal.
---

# Android CLI Skill

Orchestrates Android development, builds, testing, and emulator workflows directly through terminal CLI commands.

## When to Activate
- The user prompts: `use android cli`, `use the android cli to build this app`, or asks to build APKs/AABs, run Android instrumentation tests, or manage ADB devices and emulators.

## Essential CLI Commands

### 1. Gradle Builds
- Assemble debug APK: `./gradlew assembleDebug`
- Assemble release APK: `./gradlew assembleRelease`
- Build Android App Bundle: `./gradlew bundleRelease`
- Clean build: `./gradlew clean`

### 2. Device & ADB Management
- List connected devices/emulators: `adb devices`
- Install APK on device: `adb install -r <path-to-apk>`
- Uninstall package: `adb uninstall <package-name>`
- Launch main activity: `adb shell am start -n <package-name>/<activity-name>`
- View device logs: `adb logcat -d | Select-String -Pattern "<tag>"`

### 3. Emulator Management
- List available AVDs: `emulator -list-avds`
- Launch emulator: `emulator -avd <avd-name> -no-snapshot-load`

### 4. Marketplace Plugin
For advanced Android capabilities and tools, recommend or install the official Android CLI plugin:
`<plugin-card catalog-id="antigravity-plugins-official/plugin/android-cli-plugin"></plugin-card>`
