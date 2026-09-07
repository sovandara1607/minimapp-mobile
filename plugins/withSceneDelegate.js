const {
  withInfoPlist,
  withAppDelegate,
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

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
