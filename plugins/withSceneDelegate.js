const {
  withInfoPlist,
  withAppDelegate,
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// iOS 27 refuses to launch apps that don't adopt the UIKit scene lifecycle
// (Apple TN3187) — Expo's generated iOS template does not do this yet
// (tracked upstream: expo/expo#46663, #46664), so it's patched in here via a
// config plugin. This runs on every `expo prebuild`, so it survives
// `--clean` instead of being lost the next time native projects regenerate.
//
// Window ownership moves from AppDelegate to a new SceneDelegate; AppDelegate
// still builds the React Native factory before any scene connects, and hands
// it off for SceneDelegate to start React Native once a window exists.
const SCENE_DELEGATE_SOURCE = `import UIKit
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    let window = UIWindow(windowScene: windowScene)
    appDelegate.window = window
    self.window = window
    appDelegate.reactNativeFactory?.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: nil)
    window.makeKeyAndVisible()
  }
}
`;

function withSceneManifest(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });
}

// AppDelegate no longer owns the window directly — SceneDelegate does, once
// a scene connects. Remove just the window-creation block Expo generates.
function withAppDelegateSceneLifecycle(config) {
  return withAppDelegate(config, (config) => {
    const before = `
#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;
    if (config.modResults.contents.includes(before)) {
      config.modResults.contents = config.modResults.contents.replace(before, "\n");
    }
    return config;
  });
}

function withSceneDelegateFile(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        "SceneDelegate.swift",
      );
      fs.writeFileSync(filePath, SCENE_DELEGATE_SOURCE);
      return config;
    },
  ]);
}

function withSceneDelegateXcodeProject(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const projectName = config.modRequest.projectName;
    const target = IOSConfig.XcodeUtils.getApplicationNativeTarget({
      project,
      projectName,
    });
    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${projectName}/SceneDelegate.swift`,
      groupName: projectName,
      project,
      targetUuid: target.uuid,
    });
    return config;
  });
}

module.exports = function withSceneDelegate(config) {
  config = withSceneManifest(config);
  config = withAppDelegateSceneLifecycle(config);
  config = withSceneDelegateFile(config);
  config = withSceneDelegateXcodeProject(config);
  return config;
};
