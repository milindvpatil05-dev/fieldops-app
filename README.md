# FieldOps App

This is a minimal [Expo](https://expo.dev) app using Expo Router.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

The app consumes the separately published `@milindvpatil05-dev/react-native-fieldops-ui` package from npm. The package contains the built component-library output and TypeScript declarations; the app does not import library source files. Set the API base URL in `src/constants/api.ts` to the machine running the mock API before launching on a physical device.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

The landing screen is `src/app/index.tsx`.

## Features

- Work orders list with search, filters, and detail view
- Status updates with optimistic cache and rollback
- Create / edit work order form with validation (React Hook Form + Zod)
- Error, empty, loading, and refresh states covered

### Development Notes

- The mock API is a separate service. Start it according to its repository README, then update `src/constants/api.ts` when the device cannot reach the default host.

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- Unit testing: see Unit Testing with Jest ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
  -TypeScript setup: see ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## Join the community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
