#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>
#import "RNSplashScreen.h"
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"biziboxOTP";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};


  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"biziboxOTP"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [FIRApp configure];
  [RNSplashScreen show];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

@end


// #import "AppDelegate.h"
//
// #import <React/RCTBundleURLProvider.h>
// #import <Firebase.h>
// #import "RNSplashScreen.h"
//
// @implementation AppDelegate
//
// - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
// {
//   self.moduleName = @"biziboxOTP";
//   // You can add your custom initial props in the dictionary below.
//   // They will be passed down to the ViewController used by React Native.
//   self.initialProps = @{};
//   [FIRApp configure];
//   bool didFinish = [super application:application didFinishLaunchingWithOptions:launchOptions];
//   [RNSplashScreen show];
//   return didFinish;
// }
//
// - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
// {
// #if DEBUG
//   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
// #else
//   return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
// #endif
// }
//
// /// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
// ///
// /// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
// /// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
// /// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
// - (BOOL)concurrentRootEnabled
// {
//   return true;
// }
//
// @end
//
// //
// //
// //
// //
// //
// // #import "AppDelegate.h"
// //
// // #import <React/RCTBridge.h>
// // #import <React/RCTBundleURLProvider.h>
// // #import <React/RCTRootView.h>
// // #import <Firebase.h>
// // #import "RNSplashScreen.h"
// //
// // #import <React/RCTBundleURLProvider.h>
// //
// // @implementation AppDelegate
// //
// // - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
// // {
// //   self.moduleName = @"biziboxOTP";
// //   // You can add your custom initial props in the dictionary below.
// //   // They will be passed down to the ViewController used by React Native.
// //   self.initialProps = @{};
// //
// //   if ([FIRApp defaultApp] == nil) {
// //      [FIRApp configure];
// //    }
// //
// //   RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
// //   RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
// //                                                    moduleName:@"BiziboxUI"
// //                                             initialProperties:nil];
// //
// //   rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
// //
// //   self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
// //   UIViewController *rootViewController = [UIViewController new];
// //   rootViewController.view = rootView;
// //   self.window.rootViewController = rootViewController;
// //   [self.window makeKeyAndVisible];
// //   [RNSplashScreen show];
// //
// //   return [super application:application didFinishLaunchingWithOptions:launchOptions];
// // }
// //
// // - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
// // {
// // #if DEBUG
// //   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
// // #else
// //   return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
// // #endif
// // }
// //
// // /// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
// // ///
// // /// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
// // /// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
// // /// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
// // - (BOOL)concurrentRootEnabled
// // {
// //   return true;
// // }
// //
// // @end
// //
