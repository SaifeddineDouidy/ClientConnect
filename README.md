# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## How to set up Firebase
Firebase is a platform developed by Google that provides a suite of services to help you build and scale your app. Here's a step-by-step guide on how to create a Firebase project for React Native and get your configuration:

1.  **Go to the Firebase Console:**
    *   Visit the [Firebase Console](https://console.firebase.google.com/) and log in with your Google account.
2.  **Create a New Project:**
    *   Click on the **Add project** button.
    *   Enter your project name (e.g., `your-app`).
    *   If you want, enable Google Analytics for your project, then click **Continue**.
    *   If you enabled Google Analytics, select a Google Analytics account. Or, you can choose to create a new account, then click **Create project**.
    *   Wait for the project creation to complete. Then click **Continue**.
3. **Add an app to start using Firebase:**
    * You should be redirected to your project's dashboard. Scroll down until you find the **Your apps** section.
    * Here you can choose between `iOS`, `Android`, and `Web`.
    * Click on **Web** icon (</>) to create the firebase web app.
4. **Get the Configuration:**
    *  **Register the app.** Enter your app's nickname. This is an internal-only name and won't be visible to end users, then click **Register app**. You don't need to configure Firebase Hosting for this step.
    *   After registering your app, you'll see a snippet of code that contains your Firebase configuration. It looks like this:

        

