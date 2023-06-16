import React, { Component, Fragment } from "react";
import SplashScreen from "react-native-splash-screen";
import styles from "./CommonStyle";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  Linking,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  BASE_URL,
  colors,
  fonts,
  getEmoji,
  guidGenerator,
  IS_IOS,
  notificationsIfHasPermissionButtonAlert,
} from "./vars";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomIcon from "../assets/fontello/CustomIcon.js";


// import { PieChart } from "react-native-svg-charts";
import { ProgressCircle } from "react-native-svg-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import startSmsHandling from "@eabdullazyanov/react-native-sms-user-consent/src/startSmsHandling";
import retrieveVerificationCode from "@eabdullazyanov/react-native-sms-user-consent/src/retrieveVerificationCode";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo, { getBundleId } from "react-native-device-info";
import { checkVersion } from "react-native-check-version";

const bundleId = getBundleId();
export const VERSION = DeviceInfo.getVersion();

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fcmTokens: null,
      isReady: false,
      showLoader: false,
      step: 1,
      authentication: null,
      maskedPhoneNumber: null,
      modalVisible: false,
      appTokenStatus: false,
      errStep1: false,
      tryAgain: false,
      tokenTemp: null,
      errStep2: false,
      smsRemainedOTP: 0,
      cellOtpValid: true,
      subscriptionNumberValid: true,
      inProgress: false,
      secureTextEntry: true,
      cellOtp: "",
      subscriptionNumber: "",
      otpCodeValid: true,
      otpCode: "",
      otpCodeSide: "right",
      cellOtpSide: "right",
      subscriptionNumberSide: "right",
      showUserNameFl: false,
      bankUserName: null,
      token: null,
      openExitPanel: false,
      tab: 1,
      finishedSuc: false,
      showUpdatePassScreen: false,
      usernameSide: "right",
      usernameValid: true,
      username: "",
      mailIsHebrew: false,
      passwordValid: true,
      password: "",
      moveTextcellOtp: new Animated.Value(0),
      moveTextsubscriptionNumber: new Animated.Value(0),
      moveTextotpCode: new Animated.Value(0),
      moveTextusername: new Animated.Value(0),
      moveTextpassword: new Animated.Value(0),
      stationId: null,
      passwordsValid: true,
      errPassword1: false,
      secureTextEntry1: true,
      password1: "",
      password1Valid: true,
      password2Valid: true,
      errPassword2: false,
      secureTextEntry2: true,
      password2: "",
      isVersionType: IS_IOS
        ? true
        : !(!bundleId.includes("dev") && !bundleId.includes("localOffice")),
    };
  }

  componentDidMount() {
    SplashScreen.hide();
    if (
      !IS_IOS &&
      !bundleId.includes("dev") &&
      !bundleId.includes("localOffice")
    ) {
      checkVersion({
        platform: "android",
        bundleId: "com.biziboxotp",
        needsUpdate: true,
      }).then(latestVersion => {
        console.log("checkVersion: ", latestVersion);
        if (latestVersion) {
          console.log(
            DeviceInfo.getVersion().toString().replace(/\s\s+/g, " "),
            latestVersion,
          );
          this.setState({
            isVersionType: latestVersion
              ? DeviceInfo.getVersion().toString().replace(/\s\s+/g, " ") ===
              latestVersion.version.toString().replace(/\s\s+/g, " ")
              : false,
          });
        }
      });
    }

    this.checkIsSaveToken().then(() => {
    });
  }

  getData = async name => {
    const value = await AsyncStorage.getItem(name);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return null;
    }
  };

  storeData = async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  };
  handleLogOut = async () => {
    clearInterval(this.getStatus);
    this.getStatus = null;
    const keys = ["trustId", "data"];
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      // remove error
    }

    this.setState({
      openExitPanel: false,
      isReady: true,
      showLoader: false,
      step: 1,
      authentication: null,
      maskedPhoneNumber: null,
      modalVisible: false,
      appTokenStatus: false,
      errStep1: false,
      tryAgain: false,
      tokenTemp: null,
      errStep2: false,
      smsRemainedOTP: 0,
      cellOtpValid: true,
      subscriptionNumberValid: true,
      inProgress: false,
      secureTextEntry: true,
      cellOtp: "",
      subscriptionNumber: "",
      otpCodeValid: true,
      otpCode: "",
      otpCodeSide: "right",
      cellOtpSide: "right",
      subscriptionNumberSide: "right",
      showUserNameFl: false,
      bankUserName: null,
      token: null,
      tab: 1,
      finishedSuc: false,
      showUpdatePassScreen: false,
      usernameSide: "right",
      usernameValid: true,
      username: "",
      mailIsHebrew: false,
      passwordValid: true,
      password: "",
      moveTextcellOtp: new Animated.Value(0),
      moveTextsubscriptionNumber: new Animated.Value(0),
      moveTextotpCode: new Animated.Value(0),
      moveTextusername: new Animated.Value(0),
      moveTextpassword: new Animated.Value(0),
      stationId: null,
      passwordsValid: true,
      errPassword1: false,
      secureTextEntry1: true,
      password1: "",
      password1Valid: true,
      password2Valid: true,
      errPassword2: false,
      secureTextEntry2: true,
      password2: "",
    });
    console.log("LogOut");
  };
  backToMainStep = () => {
    this.setState({
      step: 1,
    });
  };
  sendFcmToken = async fcmTokens => {
    await this.storeData("fcmTokens", fcmTokens);
    await this.postFromApiAsync("users/update-push-data", {
      osdesc: IS_IOS ? "Pios" : "Pandroid",
      pushToken: fcmTokens,
    });
  };

  createNotificationListeners() {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification,
      );
      const { data } = remoteMessage.notification;
      // showAlert(body, JSON.stringify(data))
      // if (data && data.messageId) {
      //   // data.messageId
      // }
      // if (data && data.companyId) {
      //
      // }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          //   const action = notificationOpen.action
          // Get information about the notification that was opened
          const { data } = remoteMessage.notification;
          // showAlert(body, JSON.stringify(data))
          // if (data && data.messageId) {
          //
          // }
          // if (data && data.companyId) {
          //
          // }
        }
      });

    messaging().onMessage(() => {
      // process data message
      // console.log('---message---', JSON.stringify(message))
    });
  }

  messagingProcess = async () => {
    const isSaveFcmTokens = await this.getData("fcmTokens");
    if (isSaveFcmTokens) {
      this.setState({
        fcmTokens: isSaveFcmTokens,
      });
    }
    const AUTHORIZED = messaging.AuthorizationStatus.AUTHORIZED;
    const PROVISIONAL = messaging.AuthorizationStatus.PROVISIONAL;

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
      this.createNotificationListeners();
    } else {
      if (isSaveFcmTokens) {
        if (!bundleId || (bundleId && !bundleId.includes("dev") && !bundleId.includes("localOffice"))) {
          setTimeout(() => {
            notificationsIfHasPermissionButtonAlert();
          }, 1000);
        }
      } else {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          return messaging()
            .registerDeviceForRemoteMessages()
            .then(async isEnabledRe => {
              if (isEnabledRe !== AUTHORIZED && isEnabledRe !== PROVISIONAL) {
                await this.requestPermission();
              }
            });
        } else {
          if (enabled !== AUTHORIZED && enabled !== PROVISIONAL) {
            await this.requestPermission();
          }
        }
      }
    }
    // messaging()
    //   .hasPermission()
    //   .then(async isEnabled => {
    //     const AUTHORIZED = messaging.AuthorizationStatus.AUTHORIZED;
    //     if (isEnabled === AUTHORIZED) {
    //       this.createNotificationListeners();
    //     } else {
    //       if (isSaveFcmTokens) {
    //         if (!bundleId || (bundleId && !bundleId.includes("dev") && !bundleId.includes("localOffice"))) {
    //           setTimeout(() => {
    //             notificationsIfHasPermissionButtonAlert();
    //           }, 1000);
    //         }
    //       } else {
    //         if (!messaging().isDeviceRegisteredForRemoteMessages) {
    //           return messaging()
    //             .registerDeviceForRemoteMessages()
    //             .then(async isEnabledRe => {
    //               if (isEnabledRe !== AUTHORIZED) {
    //                 await this.requestPermission();
    //               }
    //             });
    //         } else {
    //           if (isEnabled !== AUTHORIZED) {
    //             await this.requestPermission();
    //           }
    //         }
    //       }
    //     }
    //   });
  };
  requestPermission = async () => {
    await messaging().requestPermission({
      provisional: true,
    });
    const fcmToken = await messaging().getToken();
    messaging().onTokenRefresh(fcmTokens => {
      console.log("---fcmToken---- tokenRefreshListener", fcmTokens);
      return this.sendFcmToken(fcmTokens);
    });
    console.log("---fcmToken----", fcmToken);
    await this.sendFcmToken(fcmToken);
  };
  checkIsSaveToken = async () => {
    try {
      const isSaveToken = await this.getData("data");
      console.log(isSaveToken);
      if (isSaveToken && isSaveToken.token) {
        this.messagingProcess();
        this.setState(
          Object.assign(
            {
              isReady: true,
              step: 3,
              tryAgain: this.state.tryAgain ? false : this.state.tryAgain,
            },
            isSaveToken,
          ),
        );
        this.hashTokenStatus();
      } else {
        this.setState({
          isReady: true,
        });
      }
    } catch (error) {
      console.log(error);
      this.setState({
        isReady: true,
      });
    }
  };
  focusPassword = () => {
    this.moveTextTop("password");
  };
  handleUpdateFieldValid = (name, isBlur) => val => {
    console.log("handleUpdateFieldValid", name, val);
    let value = val.nativeEvent ? val.nativeEvent.text : "";
    if (name === "cellOtpValid") {
      this.setState({
        cellOtpSide: isBlur ? "right" : "left",
        cellOtpValid:
          value &&
          value.length === 10 &&
          new RegExp(
            "(050|052|053|054|055|057|058|072|073|076|077|078)-?\\d{7,7}",
          ).test(value),
      });
    } else if (name === "subscriptionNumberValid") {
      this.setState({
        subscriptionNumberSide: isBlur ? "right" : "left",
        subscriptionNumberValid: value && value.length > 1,
      });
    } else if (name === "otpCodeValid") {
      this.setState({
        otpCodeSide: isBlur ? "right" : "left",
        otpCodeValid: value && value.length > 0,
      });
    } else if (name === "passwordValid" || name === "bankUserNameValid") {
      this.setState({ [name]: value && value.length !== 0 });
      // this.setState({
      //   [name]: !(!value || value.length < 8 || value.length >= 12 ||
      //     value.replace(/[^\d]/g, "").length === 0 ||
      //     value.replace(/[^A-Za-z]/g, "").length === 0),
      // });
    } else if (name === "password1Valid" || name === "password2Valid") {
      this.setState({
        [name]: value && value.length !== 0,
        passwordsValid:
          value ===
          (name === "password1Valid"
            ? this.state.password2
            : this.state.password1),
      });
      // this.setState({
      //   [name]: !(!value || value.length < 8 || value.length >= 12 ||
      //     value.replace(/[^\d]/g, "").length === 0 ||
      //     value.replace(/[^A-Za-z]/g, "").length === 0),
      // });
    } else if (name === "usernameValid") {
      const re = /\S+@\S+\.\S+/;
      const isHebrew = value && /[\u0590-\u05FF]/.test(value);
      const mailValid = value && re.test(value) && value.length > 0;
      this.setState({
        usernameSide: isBlur ? "right" : "left",
        [name]: mailValid,
        mailIsHebrew: isHebrew,
      });
    } else {
      this.setState({
        [name]: value && value.length !== 0 && value.length < 30,
      });
    }
  };
  onFocusInput = name => val => {
    console.log("onFocusInput", name);
    this.moveTextTop(name.replace("Side", ""));
    this.setState({
      [name]: "left",
      errStep1: false,
      errStep2: false,
    });
  };
  setTab = val => base => {
    this.setState({
      tab: val,
      errStep1: false,
      errStep2: false,
      cellOtpValid: true,
      subscriptionNumberValid: true,
      otpCodeValid: true,
      inProgress: false,
      secureTextEntry: true,
      cellOtp: "",
      subscriptionNumber: "",
      otpCode: "",
      cellOtpSide: "right",
      subscriptionNumberSide: "right",
      otpCodeSide: "right",
      usernameSide: "right",
      usernameValid: true,
      bankUserNameValid: true,
      username: "",
      mailIsHebrew: false,
      passwordValid: true,
      password: "",
      moveTextcellOtp: new Animated.Value(0),
      moveTextsubscriptionNumber: new Animated.Value(0),
      moveTextotpCode: new Animated.Value(0),
      moveTextusername: new Animated.Value(0),
      moveTextpassword: new Animated.Value(0),
    });
  };
  handleUpdateField = name => val => {
    let value = val || "";
    value = value.toString().replace(getEmoji(), "").replace(/\s+/g, "");

    if (
      name !== "password" &&
      name !== "username" &&
      name !== "password1" &&
      name !== "password2" &&
      name !== "bankUserName"
    ) {
      value = value.toString().replace(/[^\d-]/g, "");
    }
    console.log("handleUpdateField", value);

    this.setState({
      [name]: value,
    });
    if (
      name !== "password1" &&
      name !== "password2" &&
      name !== "bankUserName"
    ) {
      this.moveTextTop(name);
    }
    this.handleUpdateFieldValid(name + "Valid")({
      nativeEvent: {
        text: value,
      },
    });
  };
  postFromApiAsync = async (uri, params) => {
    try {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (this.state.authentication || this.state.tokenTemp) {
        headers.Authorization = this.state.authentication
          ? this.state.authentication
          : this.state.tokenTemp;
      }
      const objToSend = {
        method: "POST",
        headers: headers,
      };
      if (params) {
        objToSend.body = JSON.stringify(params);
      }
      const response = await fetch(BASE_URL + uri, objToSend);
      console.log(uri, objToSend, response);
      if (
        uri === "token/cfl/hash-app-token-otp" ||
        uri === "token/cfl/hash-app-token-work" ||
        uri === "token/cfl/update"
      ) {
        if (response.status === 200) {
          return true;
        } else {
          return null;
        }
        // const text = await response.text();
        // return text;
      } else {
        if (uri === "station/check-user-station-privs") {
          if (response.status === 200) {
            const text = await response.text();
            console.log(uri, text);
            return text.replace(/"/g, "");
          } else {
            const json = await response.json();
            console.log(uri, json);
            const res = json.message.includes("didn't find stationId for subscriptionNumber") ? "err" : null;
            return res;
          }
        } else {
          const json = await response.json();
          console.log(uri, json);
          return json;
        }
      }
    } catch (error) {
      console.error(uri, error);
      if (
        uri === "token/cfl/hash-app-token-otp" ||
        uri === "token/cfl/hash-app-token-work" ||
        uri === "token/cfl/update"
      ) {
        return true;
      } else {
        return null;
      }
    }
  };
  getFromApiAsync = async uri => {
    try {
      const headers = {};
      if (this.state.authentication || this.state.tokenTemp) {
        headers.Authorization = this.state.authentication
          ? this.state.authentication
          : this.state.tokenTemp;
      }
      const response = await fetch(BASE_URL + uri, {
        method: "GET",
        headers: headers,
      });
      console.log(uri, response);
      const json = await response.json();
      console.log(uri, json);
      return json;
    } catch (error) {
      console.error(uri, error);
      return null;
    }
  };
  receiverCode = () => {
    return new Promise((resolve, reject) => {
      // resolve('retrievedCode');

      startSmsHandling(event => {
        const receivedSms = event && event.sms;
        if (!receivedSms) {
          console.warn("No SMS received!");
          return;
        }

        const retrievedCode = retrieveVerificationCode(receivedSms, this.state.modalVisible ? 5 : 6);
        if (!retrievedCode) {
          console.warn("No code retrieved!");
          return;
        }

        if (retrievedCode) {
          resolve(retrievedCode);
        }
      });
    });
  };
  handleLoginSubmit = async () => {
    const {
      cellOtp,
      subscriptionNumber,
      inProgress,
      cellOtpValid,
      subscriptionNumberValid,
      tab,
      username,
      usernameValid,
      password,
      passwordValid,
    } = this.state;
    if (tab === 1) {
      this.handleUpdateFieldValid(
        "cellOtpValid",
        true,
      )({
        nativeEvent: {
          text: cellOtp,
        },
      });
      this.handleUpdateFieldValid(
        "subscriptionNumberValid",
        true,
      )({
        nativeEvent: {
          text: subscriptionNumber,
        },
      });
      if (
        !cellOtp ||
        !subscriptionNumber ||
        inProgress ||
        !cellOtpValid ||
        !subscriptionNumberValid
      ) {
        return;
      }
      Keyboard.dismiss();
      this.setState({
        inProgress: true,
        errStep1: false,
      });
      try {
        const getStationId = await this.postFromApiAsync(
          "station/check-user-station-privs",
          {
            subscriptionNumber: subscriptionNumber,
            cellOtp: cellOtp,
          },
        );
        // const getStationId = await this.getFromApiAsync(
        //   "station/get-stationId/" + subscriptionNumber,
        // );
        if (getStationId && getStationId !== "err") {
          let isSave_trustId = await this.getData("trustId");
          if (!isSave_trustId) {
            isSave_trustId = guidGenerator();
            await this.storeData("trustId", isSave_trustId);
          }
          const trustStatus = await this.postFromApiAsync(
            "station/auth/trust-status",
            {
              stationId: getStationId,
              trustId: isSave_trustId,
            },
          );
          if (trustStatus && trustStatus.token) {
            console.log("trustStatus: ", trustStatus);
            await this.storeData("data", {
              cellOtp: cellOtp,
              subscriptionNumber: subscriptionNumber,
              stationId: getStationId,
              token:
                trustStatus.loginStatus === "TEMP" ? null : trustStatus.token,
              maskedPhoneNumber:
                trustStatus.loginStatus === "TEMP"
                  ? trustStatus.maskedPhoneNumber
                  : null,
            });
            this.setState({
              stationId: getStationId,
              inProgress: false,
              tokenTemp:
                trustStatus.loginStatus === "TEMP" ? trustStatus.token : null,
              token:
                trustStatus.loginStatus === "TEMP" ? null : trustStatus.token,
              maskedPhoneNumber:
                trustStatus.loginStatus === "TEMP"
                  ? trustStatus.maskedPhoneNumber
                  : null,
              step: trustStatus.loginStatus === "TEMP" ? 2 : 3,
            });
            if (trustStatus.loginStatus !== "TEMP") {
              const hashAppLogin = await this.postFromApiAsync(
                "auth/hash-app-login",
                {
                  loginType: "HASH",
                  stationId: getStationId,
                  cellOtp: cellOtp,
                },
              );
              if (hashAppLogin && hashAppLogin.authentication) {
                this.setState({
                  step: 3,
                  inProgress: false,
                  token: hashAppLogin.token,
                  authentication: hashAppLogin.authentication,
                });
                const data = await this.getData("data");
                await this.storeData(
                  "data",
                  Object.assign(data, {
                    token: hashAppLogin.token,
                    authentication: hashAppLogin.authentication,
                  }),
                );
                this.messagingProcess();
                this.hashTokenStatus();
              } else {
                this.setState({
                  step: 3,
                  inProgress: false,
                });
                this.messagingProcess();
              }
            }
            if (!IS_IOS && trustStatus.loginStatus === "TEMP") {
              const retrievedCode = await this.receiverCode();
              console.log("retrievedCode: ", retrievedCode);
              if (retrievedCode && this.state.step !== 3) {
                this.setState({
                  otpCode: retrievedCode,
                });
                this.handleOtpLoginSubmit();
              }
            }
          }
        } else {
          this.setState({
            inProgress: false,
            errStep1: (getStationId && getStationId === "err") ? "לא קיימת תחנה עם המספר מנוי שהוזן"
              :
              "הפרטים לא תואמים, אנא נסו שוב",
          });
          return;
        }
      } catch (e) {
        console.log(e);
        return;
      }
    }
    if (tab === 2) {
      this.handleUpdateFieldValid(
        "cellOtpValid",
        true,
      )({
        nativeEvent: {
          text: cellOtp,
        },
      });
      this.handleUpdateFieldValid(
        "usernameValid",
        true,
      )({
        nativeEvent: {
          text: username,
        },
      });
      this.handleUpdateFieldValid(
        "passwordValid",
        true,
      )({
        nativeEvent: {
          text: password,
        },
      });
      if (
        !cellOtp ||
        !username ||
        !password ||
        inProgress ||
        !cellOtpValid ||
        !usernameValid ||
        !passwordValid
      ) {
        return;
      }
      Keyboard.dismiss();
      this.setState({
        inProgress: true,
        errStep1: false,
      });
      try {
        const authToken = await this.postFromApiAsync("auth/token", {
          username: username,
          password: password,
          rememberMe: false,
        });
        if (authToken && authToken.status !== 401) {
          console.log("authToken: ", authToken);
          // const decodedToken = jwtDecode(authToken.token);
          // console.log("decodedToken: ", decodedToken);
          // if (decodedToken.type === "AUTH") {
          //
          // }

          if (authToken && authToken.token) {
            await this.storeData("data", {
              cellOtp: cellOtp,
              username: username,
              password: password,
              subscriptionNumber: subscriptionNumber,
              token: null,
              maskedPhoneNumber: cellOtp,
            });
            this.setState({
              // inProgress: false,
              tokenTemp: authToken.token,
              token: null,
              maskedPhoneNumber: cellOtp,
              // step: 2,
            });

            const hashAppLogin = await this.postFromApiAsync(
              "auth/hash-app-login",
              {
                loginType: "ACCOUNTANT",
                cellOtp: cellOtp,
                userName: username,
              },
            );
            if (hashAppLogin && hashAppLogin.authentication) {
              this.setState({
                step: 3,
                inProgress: false,
                token: hashAppLogin.token,
                authentication: hashAppLogin.authentication,
              });
              const data = await this.getData("data");
              await this.storeData(
                "data",
                Object.assign(data, {
                  token: hashAppLogin.token,
                  authentication: hashAppLogin.authentication,
                }),
              );
              this.messagingProcess();
            } else {
              this.setState({
                inProgress: false,
                errStep1: "הפרטים לא תואמים, אנא נסו שוב",
              });
              return;
              // this.setState({
              //   step: 3,
              //   inProgress: false,
              // });
              // this.messagingProcess();
            }
            // const appTokenStatus = await this.postFromApiAsync(
            //   "token/cfl/app-token-status",
            //   {
            //     uuid: this.state.token,
            //   },
            // );
            // this.setState({
            //   appTokenStatus: appTokenStatus,
            // });
            // const dataSaved = await this.getData("data");
            // await this.storeData(
            //   "data",
            //   Object.assign(dataSaved, {
            //     appTokenStatus: appTokenStatus,
            //   }),
            // );

            this.hashTokenStatus();
            // if (!IS_IOS) {
            //   const retrievedCode = await this.receiverCode();
            //   console.log('retrievedCode: ', retrievedCode);
            //   if (retrievedCode && this.state.step !== 3) {
            //     this.setState({
            //       otpCode: retrievedCode,
            //     });
            //     this.handleOtpLoginSubmit();
            //   }
            // }
          }
        } else {
          this.setState({
            inProgress: false,
            errStep1: "הפרטים לא תואמים, אנא נסו שוב",
          });
          return;
        }
      } catch (e) {
        this.setState({
          inProgress: false,
          errStep1: "הפרטים לא תואמים, אנא נסו שוב",
        });
        return;
      }
    }
  };
  handleOtpLoginSubmit = async () => {
    const {
      otpCode,
      inProgress,
      otpCodeValid,
      smsRemainedOTP,
      cellOtp,
      tab,
      username,
      stationId,
    } = this.state;
    this.handleUpdateFieldValid(
      "otpCodeValid",
      true,
    )({
      nativeEvent: {
        text: otpCode,
      },
    });
    if (!otpCode || inProgress || !otpCodeValid) {
      return;
    }
    Keyboard.dismiss();
    this.setState({
      inProgress: true,
      errStep2: false,
    });
    const authCode = await this.postFromApiAsync(
      `auth/otp/code/?code=${otpCode}`,
      null,
    );
    // {
    //   "token": "string",
    //   "tokenInfo": {
    //   "agreementPopup": true,
    //     "loginStatus": "string",
    //     "maskedPhoneNumber": "string",
    //     "smsRemained": 0
    // }
    // }
    console.log("authCode: ", authCode);
    if (authCode && authCode.token) {
      if (authCode.token === "Incorrect one time token code") {
        this.setState({
          smsRemainedOTP: smsRemainedOTP + 1,
          inProgress: false,
          errStep2: "הקוד לא תואם לקוד שנשלח, אנא בדקו אותו ונסו שוב",
        });
      } else {
        this.setState(
          {
            modalVisible: false,
            errStep2: false,
            otpCode: otpCode,
            token: authCode.token,
          },
          async () => {
            const data = await this.getData("data");
            await this.storeData(
              "data",
              Object.assign(data, {
                otpCode: otpCode,
                token: authCode.token,
              }),
            );
            const paramsHash =
              tab === 1
                ? {
                  loginType: "HASH",
                  stationId: stationId,
                  cellOtp: cellOtp,
                }
                : {
                  loginType: "ACCOUNTANT",
                  stationId: stationId,
                  userName: username,
                };
            const hashAppLogin = await this.postFromApiAsync(
              "auth/hash-app-login",
              paramsHash,
            );
            console.log("hashAppLogin", hashAppLogin);
            // {
            //   "authentication": "string",
            //   "errorDesc": "string",
            //   "status": "VALID",
            //   "token": "string"
            // }
            if (hashAppLogin && hashAppLogin.authentication) {
              this.setState({
                step: 3,
                inProgress: false,
                token: hashAppLogin.token,
                authentication: hashAppLogin.authentication,
              });
              const data = await this.getData("data");
              await this.storeData(
                "data",
                Object.assign(data, {
                  token: hashAppLogin.token,
                  authentication: hashAppLogin.authentication,
                }),
              );
              this.messagingProcess();
            } else {
              this.setState({
                step: 3,
                inProgress: false,
              });
              this.messagingProcess();
            }
            // const appTokenStatus = await this.postFromApiAsync(
            //   "token/cfl/app-token-status",
            //   {
            //     uuid: this.state.token,
            //   },
            // );
            // this.setState({
            //   appTokenStatus: appTokenStatus,
            // });
            // const dataSaved = await this.getData("data");
            // await this.storeData(
            //   "data",
            //   Object.assign(dataSaved, {
            //     appTokenStatus: appTokenStatus,
            //   }),
            // );
            this.hashTokenStatus();
          },
        );
      }
    } else {
      this.setState({
        smsRemainedOTP: smsRemainedOTP + 1,
        inProgress: false,
        errStep2: "הקוד לא תואם לקוד שנשלח, אנא בדקו אותו ונסו שוב",
      });
    }
  };
  handleTogglePasswordVisibility = () => {
    const { secureTextEntry } = this.state;
    this.setState({ secureTextEntry: !secureTextEntry });
  };
  handleTogglePassword1Visibility = () => {
    const { secureTextEntry1 } = this.state;
    this.setState({ secureTextEntry1: !secureTextEntry1 });
  };
  handleTogglePassword2Visibility = () => {
    const { secureTextEntry2 } = this.state;
    this.setState({ secureTextEntry2: !secureTextEntry2 });
  };
  setModalVisible = visible => {
    if (visible) {
      this.setState(
        {
          showLoader: false,
        },
        () => {
          setTimeout(() => {
            this.setState({ modalVisible: true });
            if (!IS_IOS) {
              this.receiverCode().then((retrievedCode) => {
                console.log("retrievedCode: ", retrievedCode);
                if (retrievedCode) {
                  this.setState({
                    otpCode: retrievedCode,
                    inProgress: false,
                  });
                  if (!this.state.appTokenStatus || this.state.appTokenStatus && this.state.appTokenStatus.tokenStatus !== "NOT_UP_TO_DATE") {
                    this.hashAppTokenOtp();
                  }
                }
              });
            }
          }, 100);
        },
      );
    } else {
      this.setState({ modalVisible: false });
    }
  };
  hashAppTokenOtp = async () => {
    const { otpCode, inProgress, otpCodeValid, smsRemainedOTP } = this.state;
    this.handleUpdateFieldValid(
      "otpCodeValid",
      true,
    )({
      nativeEvent: {
        text: otpCode,
      },
    });
    if (!otpCode || inProgress || !otpCodeValid) {
      return;
    }
    Keyboard.dismiss();
    this.setState({
      inProgress: true,
      errStep2: false,
    });
    const appTokenStatus = await this.postFromApiAsync(
      "token/cfl/hash-app-token-otp",
      {
        otpPassword: this.state.otpCode,
        token: this.state.token,
      },
    );
    if (appTokenStatus) {
      this.setState({
        errStep2: false,
        otpCode: otpCode,
      });
      const data = await this.getData("data");
      await this.storeData(
        "data",
        Object.assign(data, {
          otpCode: otpCode,
        }),
      );
      // this.setModalVisible(false);
      this.hashTokenStatus();
    } else {
      this.setState({
        smsRemainedOTP: 0,
        inProgress: false,
        errStep2: "חלה שגיאה בשליחת הנתונים, אנא נסו שנית",
      });
    }
  };
  hashAppTokenWork = async () => {
    await this.postFromApiAsync("token/cfl/hash-app-token-work", {
      uuid: this.state.token,
      mobile: true,
    });
    this.setState({
      otpCodeValid: true,
      otpCode: "",
      otpCodeSide: "right",
      smsRemainedOTP: 0,
      moveTextotpCode: new Animated.Value(0),
    });

    this.setModalVisible(true);
  };

  hashTokenStatus = async () => {
    this.setState({
      otpCodeValid: true,
      otpCode: "",
      otpCodeSide: "right",
      smsRemainedOTP: 0,
      moveTextotpCode: new Animated.Value(0),
    });
    const appTokenStatus = await this.postFromApiAsync(
      "token/cfl/app-token-status",
      {
        uuid: this.state.token,
        tryAgain: this.state.tryAgain,
      },
    );
    this.setState({
      tryAgain: this.state.tryAgain ? false : this.state.tryAgain,
      appTokenStatus: appTokenStatus,
    });

    // if (
    //   appTokenStatus &&
    //   appTokenStatus.connectionStatus &&
    //   (appTokenStatus.connectionStatus === 'SHOW_OTP_POPUP' ||
    //     (appTokenStatus.connectionStatus !== 'Connecting' &&
    //       (appTokenStatus.description === 'WRONG OTP CODE1' ||
    //         appTokenStatus.description === 'WRONG OTP CODE2')))
    // ) {
    //   if (!this.state.modalVisible) {
    //     this.setModalVisible(true);
    //   }
    //   this.setState({
    //     inProgress: false,
    //     showLoader: false,
    //   });
    // }


    if (
      this.state.modalVisible &&
      appTokenStatus &&
      (appTokenStatus.hidePopUpOtp &&
        appTokenStatus.hidePopUpOtp === true)
    ) {
      Keyboard.dismiss();
      this.setState({
        modalVisible: false,
        inProgress: false,
      });
    }

    if (
      !this.state.modalVisible &&
      appTokenStatus &&
      (appTokenStatus.tokenStatus === "WRONG_OTP_CODE")
    ) {
      Keyboard.dismiss();
      this.setState({
        modalVisible: true,
        inProgress: false,
      });
    }

    const dataSaved = await this.getData("data");
    await this.storeData(
      "data",
      Object.assign(dataSaved, {
        appTokenStatus: appTokenStatus,
      }),
    );
    if (this.getStatus) {
      clearInterval(this.getStatus);
    }
    this.getStatus = setInterval(async () => {
      const appTokenStatus = await this.postFromApiAsync(
        "token/cfl/app-token-status",
        {
          uuid: this.state.token,
          tryAgain: this.state.tryAgain,
        },
      );
      this.setState({
        tryAgain: this.state.tryAgain ? false : this.state.tryAgain,
        appTokenStatus: appTokenStatus,
      });

      if (
        this.state.modalVisible &&
        appTokenStatus &&
        (appTokenStatus.hidePopUpOtp &&
          appTokenStatus.hidePopUpOtp === true)
      ) {
        Keyboard.dismiss();
        this.setState({
          modalVisible: false,
          inProgress: false,
        });
      }
      if (
        !this.state.modalVisible &&
        appTokenStatus &&
        (appTokenStatus.tokenStatus === "WRONG_OTP_CODE")
      ) {
        Keyboard.dismiss();
        this.setState({
          modalVisible: true,
          inProgress: false,
        });
      }
      // if (
      //   appTokenStatus &&
      //   appTokenStatus.connectionStatus &&
      //   (appTokenStatus.connectionStatus === 'SHOW_OTP_POPUP' ||
      //     (appTokenStatus.connectionStatus !== 'Connecting' &&
      //       (appTokenStatus.description === 'WRONG OTP CODE1' ||
      //         appTokenStatus.description === 'WRONG OTP CODE2'))) &&
      //   !this.state.modalVisible
      // ) {
      //   this.setModalVisible(true);
      // }
      const dataSaved = await this.getData("data");
      await this.storeData(
        "data",
        Object.assign(dataSaved, {
          appTokenStatus: appTokenStatus,
        }),
      );
      // if ((this.state.appTokenStatus && (this.state.appTokenStatus.tokenStatus === "NOT_UP_TO_DATE"))) {
      //   clearInterval(this.getStatus);
      //   this.getStatus = null;
      // }
    }, 5000);
  };
  updateToken = async () => {
    const { passwordsValid, inProgress, password1, showUserNameFl, bankUserName } = this.state;
    if (!passwordsValid || password1.length === 0 || inProgress || (showUserNameFl && (!bankUserName || (bankUserName && !bankUserName.length)))) {
      return;
    }
    Keyboard.dismiss();
    this.setState({
      inProgress: true,
      errUpdate: false,
    });

    const updateToken = await this.postFromApiAsync("token/cfl/update", {
      bankId: 12,
      companyId: null,
      tokenId: this.state.token,
      bankAuto: null,
      bankPass: password1,
      bankUserName: showUserNameFl ? bankUserName : null,
    });
    if (updateToken) {
      this.setState({
        errUpdate: false,
        inProgress: false,
        showUpdatePassScreen: false,
      });
      this.hashTokenStatus();
    } else {
      this.setState({
        inProgress: false,
        errUpdate: "שגיאה בתהליך העדכון, נסו שנית",
      });
    }
  };

  moveTextTop = name => {
    Animated.timing(this.state["moveText" + name], {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  moveTextBottom = name => {
    Animated.timing(this.state["moveText" + name], {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {
      step,
      inProgress,
      cellOtp,
      subscriptionNumber,
      otpCode,
      cellOtpSide,
      subscriptionNumberSide,
      otpCodeValid,
      tab,
      cellOtpValid,
      subscriptionNumberValid,
      otpCodeSide,
      secureTextEntry,
      modalVisible,
      showLoader,
      errStep1,
      errStep2,
      showUpdatePassScreen,
      smsRemainedOTP,
      appTokenStatus,
      isReady,
      usernameValid,
      username,
      usernameSide,
      mailIsHebrew,
      password,
      passwordValid,
      moveTextcellOtp,
      moveTextsubscriptionNumber,
      moveTextotpCode,
      moveTextusername,
      moveTextpassword,
      maskedPhoneNumber,
      isVersionType,
      errUpdate,
      passwordsValid,
      errPassword1,
      secureTextEntry1,
      password1,
      password1Valid,
      password2Valid,
      errPassword2,
      secureTextEntry2,
      password2,
      finishedSuc,

      showUserNameFl,
      bankUserName,
      bankUserNameValid,
    } = this.state;

    // (appTokenStatus.connectionStatus &&
    //   appTokenStatus.connectionStatus === "Connecting")
    let prcIncome = 10;
    if (
      step === 3 &&
      appTokenStatus &&
      (appTokenStatus.tokenType === "BANKTRANSLOAD" ||
        appTokenStatus.tokenType === "CREDITCARDLOAD" ||
        appTokenStatus.tokenType === "CHECKSLOAD" ||
        appTokenStatus.tokenType === "DEPOSITLOAD" ||
        appTokenStatus.tokenType === "LOANLOAD" ||
        appTokenStatus.tokenType === "STANDINGORDERSLOAD" ||
        appTokenStatus.tokenType === "FOREIGNTRANSLOAD" ||
        appTokenStatus.tokenStatus === "VALIDPOALIMBAASAKIM")
    ) {
      if (appTokenStatus.tokenType === "BANKTRANSLOAD") {
        prcIncome = 20;
      } else if (appTokenStatus.tokenType === "CREDITCARDLOAD") {
        prcIncome = 30;
      } else if (appTokenStatus.tokenType === "CHECKSLOAD") {
        prcIncome = 40;
      } else if (appTokenStatus.tokenType === "DEPOSITLOAD") {
        prcIncome = 60;
      } else if (appTokenStatus.tokenType === "LOANLOAD") {
        prcIncome = 80;
      } else if (appTokenStatus.tokenType === "STANDINGORDERSLOAD") {
        prcIncome = 90;
      } else if (
        appTokenStatus.tokenType === "FOREIGNTRANSLOAD" ||
        appTokenStatus.tokenStatus === "VALIDPOALIMBAASAKIM"
      ) {
        prcIncome = 100;
      }
    }
    if (
      step === 3 &&
      appTokenStatus &&
      appTokenStatus.tokenStatus === "VALIDPOALIMBAASAKIM" &&
      finishedSuc === false
    ) {
      setTimeout(() => {
        this.setState({
          finishedSuc: true,
        });
      }, 1000);
    }

    console.log("appTokenStatus", appTokenStatus);
    // const prcIncomesArr = Array.from(Array(100).keys())
    //   .map((key, index) => {
    //     return {
    //       prc: 1,
    //       active: ((index + 1)) <= prcIncome,
    //     };
    //   });
    const animStyle_cellOtp = {
      transform: [
        {
          translateY: moveTextcellOtp.interpolate({
            inputRange: [0, 1],
            outputRange: [10, -20],
          }),
        },
      ],
    };
    const animStyle_subscriptionNumber = {
      transform: [
        {
          translateY: moveTextsubscriptionNumber.interpolate({
            inputRange: [0, 1],
            outputRange: [10, -20],
          }),
        },
      ],
    };
    const animStyle_otpCode = {
      transform: [
        {
          translateY: moveTextotpCode.interpolate({
            inputRange: [0, 1],
            outputRange: [10, -20],
          }),
        },
      ],
    };
    const animStyle_username = {
      transform: [
        {
          translateY: moveTextusername.interpolate({
            inputRange: [0, 1],
            outputRange: [10, -20],
          }),
        },
      ],
    };
    const animStyle_password = {
      transform: [
        {
          translateY: moveTextpassword.interpolate({
            inputRange: [0, 1],
            outputRange: [10, -20],
          }),
        },
      ],
    };
    console.log("modalVisible", modalVisible);
    console.log("showLoader", showLoader);
    if (!isReady) {
      return <ActivityIndicator size="large" color={colors.blue32} />;
    }

    console.log("step: ", step);
    console.log("modalVisible: ", modalVisible);
    console.log("appTokenStatus: ", appTokenStatus);
    if (appTokenStatus && appTokenStatus.tokenStatus === "WRONG_OTP_CODE") {
      console.log("----------------: ", appTokenStatus.tokenStatus);
    }
    return (
      <Fragment>
        <KeyboardAwareScrollView enableOnAndroid keyboardShouldPersistTaps='handled'>
          <View style={styles.inner}>
            <View
              style={{
                paddingHorizontal:
                  (step === 3 &&
                    modalVisible === false &&
                    appTokenStatus &&
                    (appTokenStatus.tokenStatus === "WRONG_PASS" ||
                      appTokenStatus.tokenStatus === "PASSWORDEXPIRED") &&
                    showUpdatePassScreen === true) ||
                  (step === 3 && modalVisible === true)
                    ? 0
                    : 24,
              }}>
              <Image
                style={styles.logo}
                source={require("../assets/logo.png")}
              />
              {step === 1 && (
                <View style={styles.nav}>
                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 0, right: 10 }}
                    style={{
                      borderBottomWidth: 2,
                      flex: 1,
                      borderBottomColor:
                        tab === 1 ? colors.blue32 : "transparent",
                    }}
                    onPress={this.setTab(1)}>
                    {({ pressed }) => (
                      <Text
                        style={[
                          styles.textNavBtn,
                          {
                            fontFamily:
                              pressed || tab === 1
                                ? fonts.semiBold
                                : fonts.light,
                          },
                        ]}>
                        מספר מנוי
                      </Text>
                    )}
                  </Pressable>
                  {isVersionType === true && (
                    <Pressable
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 0 }}
                      style={{
                        borderBottomWidth: 2,
                        flex: 1,
                        borderBottomColor:
                          tab === 2 ? colors.blue32 : "transparent",
                      }}
                      onPress={this.setTab(2)}>
                      {({ pressed }) => (
                        <Text
                          style={[
                            styles.textNavBtn,
                            {
                              fontFamily:
                                pressed || tab === 2
                                  ? fonts.semiBold
                                  : fonts.light,
                            },
                          ]}>
                          שם משתמש
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              )}
              {step === 1 && tab === 1 && (
                <Fragment>
                  <View
                    style={{
                      width: "100%",
                      marginVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        cellOtpValid && !errStep1 ? colors.blue32 : colors.red,
                    }}>
                    <Animated.View
                      style={[styles.animatedStyle, animStyle_cellOtp]}>
                      <Text style={styles.textLable}>מספר טלפון סלולרי</Text>
                    </Animated.View>
                    <TextInput
                      placeholder={""}
                      placeholderTextColor="#202020"
                      editable
                      maxLength={10}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="numeric"
                      underlineColorAndroid="rgba(255,255,255,0)"
                      style={[
                        styles.input,
                        {
                          borderBottomColor: "rgba(255,255,255,0)",
                          borderBottomWidth: 0,
                          textAlign:
                            !cellOtp || (cellOtp && cellOtp.length === 0)
                              ? "right"
                              : cellOtpSide,
                        },
                      ]}
                      onEndEditing={e => {
                        e.persist();
                        this.setState(
                          {
                            cellOtp: e.nativeEvent.text
                              .toString()
                              .replace(/[^\d-]/g, ""),
                          },
                          () => {
                            if (this.state.cellOtp.length > 0) {
                              this.moveTextTop("cellOtp");
                            } else {
                              this.moveTextBottom("cellOtp");
                            }
                            this.handleUpdateFieldValid("cellOtpValid")(e);
                          },
                        );
                      }}
                      onFocus={this.onFocusInput("cellOtpSide")}
                      onChangeText={this.handleUpdateField("cellOtp")}
                      onSubmitEditing={this.handleLoginSubmit}
                      value={cellOtp}
                    />
                  </View>
                  <View
                    style={{
                      height: 20,
                    }}>
                    {!cellOtpValid && (
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "left",
                        }}>
                        {!cellOtp || (cellOtp && cellOtp.length === 0)
                          ? "* שדה חובה"
                          : "הזינו טלפון תקין"}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      marginVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        subscriptionNumberValid && !errStep1
                          ? colors.blue32
                          : colors.red,
                    }}>
                    <Animated.View
                      style={[
                        styles.animatedStyle,
                        animStyle_subscriptionNumber,
                      ]}>
                      <Text style={styles.textLable}>מספר מנוי</Text>
                    </Animated.View>
                    <TextInput
                      placeholder={""}
                      placeholderTextColor="#202020"
                      editable
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="numeric"
                      underlineColorAndroid="rgba(255,255,255,0)"
                      style={[
                        styles.input,
                        {
                          borderBottomColor: "rgba(255,255,255,0)",
                          borderBottomWidth: 0,
                          textAlign:
                            !subscriptionNumber ||
                            (subscriptionNumber &&
                              subscriptionNumber.length === 0)
                              ? "right"
                              : subscriptionNumberSide,
                        },
                      ]}
                      onEndEditing={e => {
                        e.persist();
                        this.setState(
                          {
                            subscriptionNumber: e.nativeEvent.text
                              .toString()
                              .replace(/[^\d-]/g, ""),
                          },
                          () => {
                            if (this.state.subscriptionNumber.length > 0) {
                              this.moveTextTop("subscriptionNumber");
                            } else {
                              this.moveTextBottom("subscriptionNumber");
                            }
                            this.handleUpdateFieldValid(
                              "subscriptionNumberValid",
                            )(e);
                          },
                        );
                      }}
                      onFocus={this.onFocusInput("subscriptionNumberSide")}
                      onChangeText={this.handleUpdateField(
                        "subscriptionNumber",
                      )}
                      onSubmitEditing={this.handleLoginSubmit}
                      value={subscriptionNumber}
                    />
                  </View>
                  <View
                    style={{
                      height: 20,
                    }}>
                    {!subscriptionNumberValid && (
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "left",
                        }}>
                        * שדה חובה
                      </Text>
                    )}
                  </View>

                  {errStep1 !== false && (
                    <View
                      style={{
                        height: 20,
                      }}>
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "center",
                        }}>
                        {errStep1}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={this.handleLoginSubmit}
                    disabled={inProgress}
                    style={({ pressed }) => [
                      {
                        marginTop: 50,
                        backgroundColor: pressed ? colors.blue : colors.blue32,
                      },
                      styles.btnContainer,
                    ]}>
                    {({ pressed }) => (
                      <Fragment>
                        {inProgress ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.textBtn}>אישור</Text>
                        )}
                      </Fragment>
                    )}
                  </Pressable>
                </Fragment>
              )}
              {step === 1 && tab === 2 && (
                <Fragment>
                  <View
                    style={{
                      marginBottom: 17,
                    }}>
                    <Text style={styles.titleStep1Tab2}>
                      פרטי הכניסה זהים לכניסה למערכת bizibox במחשב
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      marginVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        usernameValid && !errStep1 ? colors.blue32 : colors.red,
                    }}>
                    <Animated.View
                      style={[styles.animatedStyle, animStyle_username]}>
                      <Text style={styles.textLable}>שם משתמש</Text>
                    </Animated.View>
                    <TextInput
                      autoComplete={"email"}
                      placeholder={""}
                      placeholderTextColor="#202020"
                      editable
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="email-address"
                      underlineColorAndroid="rgba(255,255,255,0)"
                      textContentType="emailAddress"
                      style={[
                        styles.input,
                        {
                          borderBottomColor: "rgba(255,255,255,0)",
                          borderBottomWidth: 0,
                          textAlign:
                            !username || (username && username.length === 0)
                              ? "right"
                              : usernameSide,
                        },
                      ]}
                      onEndEditing={e => {
                        e.persist();
                        if (this.state.username.length > 0) {
                          this.moveTextTop("username");
                        } else {
                          this.moveTextBottom("username");
                        }
                        this.handleUpdateFieldValid("usernameValid")(e);
                      }}
                      onFocus={this.onFocusInput("usernameSide")}
                      onChangeText={this.handleUpdateField("username")}
                      onSubmitEditing={this.handleLoginSubmit}
                      value={username}
                    />
                  </View>

                  <View
                    style={{
                      height: 20,
                    }}>
                    {!usernameValid && (
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "left",
                        }}>
                        {!username || (username && username.length === 0)
                          ? "* שדה חובה"
                          : "נראה שנפלה טעות במייל, אנא בדקו שנית"}
                      </Text>
                    )}

                    {mailIsHebrew === true && (
                      <Text
                        style={[
                          {
                            color: "#ef3636",
                            fontFamily: fonts.regular,
                            fontSize: 14,
                            lineHeight: 14,
                            textAlign: "left",
                          },
                        ]}>
                        {"שימו לב - המקלדת בעברית"}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      width: "100%",
                      marginVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        passwordValid && !errStep1 ? colors.blue32 : colors.red,
                    }}>
                    <Animated.View
                      style={[styles.animatedStyle, animStyle_password]}>
                      <Text style={styles.textLable}>סיסמה</Text>
                    </Animated.View>
                    <TextInput
                      placeholder={""}
                      placeholderTextColor="#202020"
                      editable
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      underlineColorAndroid="rgba(255,255,255,0)"
                      secureTextEntry={secureTextEntry}
                      style={[
                        styles.input,
                        {
                          borderBottomColor: "rgba(255,255,255,0)",
                          borderBottomWidth: 0,
                          paddingLeft: 30,
                          textAlign: "right",
                        },
                      ]}
                      onEndEditing={e => {
                        e.persist();
                        this.setState(
                          {
                            password: e.nativeEvent.text
                              .toString()
                              .replace(getEmoji(), "")
                              .replace(/\s+/g, ""),
                          },
                          () => {
                            if (this.state.password.length > 0) {
                              this.moveTextTop("password");
                            } else {
                              this.moveTextBottom("password");
                            }
                            this.handleUpdateFieldValid("passwordValid")(e);
                          },
                        );
                      }}
                      onFocus={this.focusPassword}
                      onChangeText={this.handleUpdateField("password")}
                      onSubmitEditing={this.handleLoginSubmit}
                      value={password}
                    />
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        backgroundColor: "transparent",
                        height: "100%",
                        left: 0,
                        top: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={this.handleTogglePasswordVisibility}>
                      {!this.state.secureTextEntry ? (
                        <Icon
                          name="eye-outline"
                          size={19}
                          color={colors.blue29}
                        />
                      ) : (
                        <Icon
                          name="eye-off-outline"
                          size={19}
                          color={colors.blue29}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      height: 20,
                    }}>
                    {!passwordValid && (
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "left",
                        }}>
                        * שדה חובה
                        {/*{(!password || (password && password.length === 0)) ?*/}
                        {/*  "* שדה חובה"*/}
                        {/*  :*/}
                        {/*  "8-12 תווים כולל לפחות ספרה אחת"*/}
                        {/*}*/}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: "100%",
                      marginVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        cellOtpValid && !errStep1 ? colors.blue32 : colors.red,
                    }}>
                    <Animated.View
                      style={[styles.animatedStyle, animStyle_cellOtp]}>
                      <Text style={styles.textLable}>מספר טלפון סלולרי</Text>
                    </Animated.View>
                    <TextInput
                      placeholder={""}
                      placeholderTextColor="#202020"
                      editable
                      maxLength={10}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="numeric"
                      underlineColorAndroid="rgba(255,255,255,0)"
                      style={[
                        styles.input,
                        {
                          borderBottomColor: "rgba(255,255,255,0)",
                          borderBottomWidth: 0,
                          textAlign:
                            !cellOtp || (cellOtp && cellOtp.length === 0)
                              ? "right"
                              : cellOtpSide,
                        },
                      ]}
                      onEndEditing={e => {
                        e.persist();
                        this.setState(
                          {
                            cellOtp: e.nativeEvent.text
                              .toString()
                              .replace(/[^\d-]/g, ""),
                          },
                          () => {
                            if (this.state.cellOtp.length > 0) {
                              this.moveTextTop("cellOtp");
                            } else {
                              this.moveTextBottom("cellOtp");
                            }
                            this.handleUpdateFieldValid("cellOtpValid")(e);
                          },
                        );
                      }}
                      onFocus={this.onFocusInput("cellOtpSide")}
                      onChangeText={this.handleUpdateField("cellOtp")}
                      onSubmitEditing={this.handleLoginSubmit}
                      value={cellOtp}
                    />
                  </View>
                  <View
                    style={{
                      height: 20,
                    }}>
                    {!cellOtpValid && (
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "left",
                        }}>
                        {!cellOtp || (cellOtp && cellOtp.length === 0)
                          ? "* שדה חובה"
                          : "הזינו טלפון תקין"}
                      </Text>
                    )}
                  </View>

                  {errStep1 !== false && (
                    <View
                      style={{
                        height: 20,
                      }}>
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "center",
                        }}>
                        {errStep1}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={this.handleLoginSubmit}
                    disabled={inProgress}
                    style={({ pressed }) => [
                      {
                        marginTop: 50,
                        backgroundColor: pressed ? colors.blue : colors.blue32,
                      },
                      styles.btnContainer,
                    ]}>
                    {({ pressed }) => (
                      <Fragment>
                        {inProgress ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.textBtn}>אישור</Text>
                        )}
                      </Fragment>
                    )}
                  </Pressable>
                </Fragment>
              )}
              {step === 2 && smsRemainedOTP <= 2 && (
                <Fragment>
                  <View>
                    <Text style={styles.titleStep2}>
                      קוד אימות לכניסה חד פעמית נשלח למספר
                      {"\n"}
                      הטלפון {maskedPhoneNumber}
                      {"\n"}
                      שימו לב, הקוד תקף ל-10 דקות בלבד
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      marginVertical: 5,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        otpCodeValid && !errStep2 ? colors.blue32 : colors.red,
                    }}>
                    <Animated.View
                      style={[styles.animatedStyle, animStyle_otpCode]}>
                      <Text style={styles.textLable}>הקלידו את הקוד</Text>
                    </Animated.View>
                    <TextInput
                      placeholder={""}
                      placeholderTextColor="#202020"
                      editable
                      maxLength={6}
                      autoCorrect={false}
                      textContentType="oneTimeCode"
                      autoFocus={true}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType={!IS_IOS ? "numeric" : "number-pad"}
                      underlineColorAndroid="rgba(255,255,255,0)"
                      // secureTextEntry={secureTextEntry}
                      style={[
                        styles.input,
                        {
                          borderBottomColor: "rgba(255,255,255,0)",
                          borderBottomWidth: 0,
                          paddingLeft: 30,
                          textAlign:
                            !otpCode || (otpCode && otpCode.length === 0)
                              ? "right"
                              : otpCodeSide,
                        },
                      ]}
                      onEndEditing={e => {
                        e.persist();
                        this.setState(
                          {
                            otpCode: e.nativeEvent.text
                              .toString()
                              .replace(/[^\d-]/g, ""),
                          },
                          () => {
                            if (this.state.otpCode.length > 0) {
                              this.moveTextTop("otpCode");
                            } else {
                              this.moveTextBottom("otpCode");
                            }
                            this.handleUpdateFieldValid("otpCodeValid")(e);
                          },
                        );
                      }}
                      onFocus={this.onFocusInput("otpCodeSide")}
                      onChangeText={this.handleUpdateField("otpCode")}
                      onSubmitEditing={this.handleOtpLoginSubmit}
                      value={otpCode}
                    />
                    {/*<TouchableOpacity*/}
                    {/*  style={{*/}
                    {/*    position: "absolute",*/}
                    {/*    backgroundColor: "transparent",*/}
                    {/*    height: "100%",*/}
                    {/*    left: 0,*/}
                    {/*    top: 1,*/}
                    {/*    alignItems: "center",*/}
                    {/*    justifyContent: "center",*/}
                    {/*  }}*/}
                    {/*  onPress={this.handleTogglePasswordVisibility}>*/}
                    {/*  {this.state.secureTextEntry ? (*/}
                    {/*    <Icon*/}
                    {/*      name="eye-outline"*/}
                    {/*      size={19}*/}
                    {/*      color={colors.blue29}*/}
                    {/*    />*/}
                    {/*  ) : (*/}
                    {/*    <Icon*/}
                    {/*      name="eye-off-outline"*/}
                    {/*      size={19}*/}
                    {/*      color={colors.blue29}*/}
                    {/*    />*/}
                    {/*  )}*/}
                    {/*</TouchableOpacity>*/}
                  </View>
                  <View
                    style={{
                      height: 20,
                    }}>
                    {!otpCodeValid && (
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "left",
                        }}>
                        יש להזין את הקוד שנשלח לנייד
                      </Text>
                    )}
                  </View>
                  {errStep2 !== false && (
                    <View
                      style={{
                        height: 20,
                      }}>
                      <Text
                        style={{
                          color: "#ef3636",
                          fontFamily: fonts.regular,
                          fontSize: 14,
                          lineHeight: 14,
                          textAlign: "center",
                        }}>
                        {errStep2}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={this.handleOtpLoginSubmit}
                    disabled={inProgress}
                    style={({ pressed }) => [
                      {
                        marginTop: 50,
                        backgroundColor: pressed ? colors.blue : colors.blue32,
                      },
                      styles.btnContainer,
                    ]}>
                    {({ pressed }) => (
                      <Fragment>
                        {inProgress ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.textBtn}>אישור</Text>
                        )}
                      </Fragment>
                    )}
                  </Pressable>

                  <Text
                    style={styles.backToMainStep}
                    onPress={this.backToMainStep}>
                    חזרה למסך כניסה
                  </Text>
                </Fragment>
              )}
              {step === 2 && smsRemainedOTP > 2 && (
                <Fragment>
                  <View>
                    <Text style={styles.titleStep2Blocked}>
                      נעשו 3 ניסיונות כניסה לא נכונים.
                      {"\n"}
                      לא ניתן להמשיך בתהליך ההזדהות
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={this.backToMainStep}
                    style={({ pressed }) => [
                      {
                        backgroundColor: pressed ? colors.blue : colors.blue32,
                      },
                      styles.btnContainer,
                    ]}>
                    {({ pressed }) => (
                      <Fragment>
                        <Text style={styles.textBtn}>חזרה למסך כניסה</Text>
                      </Fragment>
                    )}
                  </Pressable>
                </Fragment>
              )}

              {step === 3 && (
                <Fragment>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      backgroundColor: "transparent",
                      height: "100%",
                      left: 20,
                      top: 0,
                    }}
                    onPress={() => {
                      this.setState({ openExitPanel: !this.state.openExitPanel });
                    }}>
                    <CustomIcon
                      color={"#022258"}
                      name="ellipsis-vert"
                      size={20}
                    />
                    {this.state.openExitPanel && (
                      <View style={{
                        height: 30,
                        width: 140,
                        backgroundColor: "#ffffff",
                      }}>
                        <TouchableOpacity
                          style={{
                            paddingLeft: 10,
                          }}
                          onPress={this.handleLogOut}>
                          <Text style={{
                            fontFamily: fonts.regular,
                            textAlign: "left",
                            fontSize: 20,
                            color: colors.blue,
                          }}>
                            החלפת משתמש
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                </Fragment>


              )}

              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                (appTokenStatus.tokenStatus === "NOT_UP_TO_DATE" ||
                  appTokenStatus.tokenStatus === "OPT_CODE_INSERT") && (
                  <Fragment>
                    <View>
                      <Text style={styles.titleStep3}>
                        יש ללחוץ על כפתור ״הפעלה״ כדי שנבצע
                        {"\n"}
                        בדיקת תקינות לחשבון
                      </Text>
                    </View>

                    {appTokenStatus.tokenStatus === "NOT_UP_TO_DATE" ? (
                      <Pressable
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => {
                          this.hashAppTokenWork();
                          this.setState({ showLoader: true });
                        }}
                        style={({ pressed }) => [
                          {
                            backgroundColor: pressed
                              ? colors.blue
                              : colors.blue32,
                          },
                          styles.btnCircleContainer,
                        ]}>
                        {({ pressed }) => (
                          <Fragment>
                            <Text style={styles.textCircleBtn}>הפעלה</Text>
                          </Fragment>
                        )}
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={null}
                        disabled={true}
                        style={({ pressed }) => [
                          {
                            backgroundColor: colors.blue32,
                            opacity: 0.4,
                          },
                          styles.btnCircleContainer,
                        ]}>
                        {({ pressed }) => (
                          <Fragment>
                            <Text style={styles.textCircleBtn}>הפעלה</Text>
                          </Fragment>
                        )}
                      </Pressable>
                    )}
                  </Fragment>
                )}
              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                (appTokenStatus.tokenStatus === "WRONG_PASS" ||
                  appTokenStatus.tokenStatus === "PASSWORDEXPIRED") &&
                showUpdatePassScreen === false && (
                  <Fragment>
                    <View>
                      <View>
                        <Text style={styles.titleStep3Err}>
                          הסיסמה
                          {appTokenStatus.tokenStatus === "WRONG_PASS"
                            ? " שגויה"
                            : " פגה"}
                        </Text>
                      </View>
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({ showUpdatePassScreen: true });
                          }}>
                          <Text style={styles.linkUpdatePassword}>
                            עדכן את הסיסמה לחשבון
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Pressable
                      onPress={null}
                      disabled={true}
                      style={({ pressed }) => [
                        {
                          paddingHorizontal: 24,
                          backgroundColor: colors.blue32,
                          opacity: 0.4,
                        },
                        styles.btnCircleContainer,
                      ]}>
                      {({ pressed }) => (
                        <Fragment>
                          <Text style={styles.textCircleBtn}>הפעלה</Text>
                        </Fragment>
                      )}
                    </Pressable>
                  </Fragment>
                )}
              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                (appTokenStatus.tokenStatus === "WRONG_PASS" ||
                  appTokenStatus.tokenStatus === "PASSWORDEXPIRED") &&
                showUpdatePassScreen === true && (
                  <Fragment>
                    <View>
                      <View style={styles.topHeaderUpdatePass}>
                        <View>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({ showUpdatePassScreen: false });
                            }}>
                            <Text style={styles.topHeaderUpdatePassRight}>
                              ביטול
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View>
                          <Text style={styles.topHeaderUpdatePassCenter}>
                            עדכון סיסמה לחשבון
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.topHeaderUpdatePassLeft}>
                            ניסיון 1 מתוך 3
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          paddingHorizontal: 24,
                        }}>
                        <View style={styles.titleViewUpdatePass}>
                          <Text style={styles.titleUpdatePass}>
                            צרו סיסמה חדשה
                            <Text
                              style={styles.titleUpdatePassLink}
                              onPress={() => {
                                Linking.canOpenURL(
                                  "https://login.bankhapoalim.co.il/authenticate/logon/fmp?fmp=true",
                                ).then(supported => {
                                  if (supported) {
                                    Linking.openURL(
                                      "https://login.bankhapoalim.co.il/authenticate/logon/fmp?fmp=true",
                                    );
                                  }
                                });
                              }}>
                              {" באתר הבנק " +
                                "\n"}
                            </Text>
                            והזינו את הסיסמה העדכנית
                          </Text>
                        </View>

                        <View>
                          {showUserNameFl && (
                            <View
                              style={{
                                marginTop: 20,
                                width: "100%",
                                marginVertical: 5,
                                borderBottomWidth: 1,
                                borderBottomColor:
                                  bankUserNameValid
                                    ? colors.blue32
                                    : colors.red,
                              }}>
                              <View>
                                <Text style={styles.textLable}>זיהוי משתמש</Text>
                              </View>
                              <TextInput
                                placeholder={""}
                                placeholderTextColor="#202020"
                                editable
                                autoCorrect={false}
                                autoFocus={false}
                                autoCapitalize="none"
                                returnKeyType="done"
                                keyboardType={"default"}
                                underlineColorAndroid="rgba(255,255,255,0)"
                                textContentType="emailAddress"
                                style={[
                                  styles.input,
                                  {
                                    borderBottomColor: "rgba(255,255,255,0)",
                                    borderBottomWidth: 0,
                                    textAlign: "right",
                                  },
                                ]}
                                onEndEditing={e => {
                                  e.persist();
                                  this.setState(
                                    {
                                      bankUserName: e.nativeEvent.text.toString(),
                                    },
                                    () => {
                                      this.handleUpdateFieldValid(
                                        "bankUserNameValid",
                                      )(e);
                                    },
                                  );
                                }}
                                onChangeText={this.handleUpdateField("bankUserName")}
                                value={bankUserName}
                              />
                            </View>
                          )}


                          <View
                            style={{
                              marginTop: 20,
                              width: "100%",
                              marginVertical: 5,
                              borderBottomWidth: 1,
                              borderBottomColor:
                                passwordsValid && !password1Valid
                                  ? colors.blue32
                                  : colors.red,
                            }}>
                            <View>
                              <Text style={styles.textLable}>סיסמה חדשה</Text>
                            </View>
                            <TextInput
                              placeholder={""}
                              placeholderTextColor="#202020"
                              editable
                              autoCorrect={false}
                              textContentType="password"
                              autoFocus={false}
                              autoCapitalize="none"
                              returnKeyType="done"
                              keyboardType={"default"}
                              underlineColorAndroid="rgba(255,255,255,0)"
                              secureTextEntry={secureTextEntry1}
                              style={[
                                styles.input,
                                {
                                  borderBottomColor: "rgba(255,255,255,0)",
                                  borderBottomWidth: 0,
                                  paddingLeft: 30,
                                  textAlign: "right",
                                },
                              ]}
                              onEndEditing={e => {
                                e.persist();
                                this.setState(
                                  {
                                    password1: e.nativeEvent.text.toString(),
                                  },
                                  () => {
                                    this.handleUpdateFieldValid(
                                      "password1Valid",
                                    )(e);
                                  },
                                );
                              }}
                              onChangeText={this.handleUpdateField("password1")}
                              onSubmitEditing={() => {
                              }}
                              value={password1}
                            />
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                backgroundColor: "transparent",
                                height: "100%",
                                left: 0,
                                top: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onPress={this.handleTogglePassword1Visibility}>
                              {!this.state.secureTextEntry1 ? (
                                <Icon
                                  name="eye-outline"
                                  size={19}
                                  color={colors.blue29}
                                />
                              ) : (
                                <Icon
                                  name="eye-off-outline"
                                  size={19}
                                  color={colors.blue29}
                                />
                              )}
                            </TouchableOpacity>
                          </View>

                          <View
                            style={{
                              marginTop: 20,
                              width: "100%",
                              marginVertical: 5,
                              borderBottomWidth: 1,
                              borderBottomColor:
                                passwordsValid && !password2Valid
                                  ? colors.blue32
                                  : colors.red,
                            }}>
                            <View>
                              <Text style={styles.textLable}>
                                הקלידו סיסמה בשנית
                              </Text>
                            </View>
                            <TextInput
                              placeholder={""}
                              placeholderTextColor="#202020"
                              editable
                              autoCorrect={false}
                              textContentType="password"
                              autoFocus={false}
                              autoCapitalize="none"
                              returnKeyType="done"
                              keyboardType={"default"}
                              underlineColorAndroid="rgba(255,255,255,0)"
                              secureTextEntry={secureTextEntry2}
                              style={[
                                styles.input,
                                {
                                  borderBottomColor: "rgba(255,255,255,0)",
                                  borderBottomWidth: 0,
                                  paddingLeft: 30,
                                  textAlign: "right",
                                },
                              ]}
                              onEndEditing={e => {
                                e.persist();
                                this.setState(
                                  {
                                    password2: e.nativeEvent.text.toString(),
                                  },
                                  () => {
                                    this.handleUpdateFieldValid(
                                      "password2Valid",
                                    )(e);
                                  },
                                );
                              }}
                              onChangeText={this.handleUpdateField("password2")}
                              onSubmitEditing={() => {
                              }}
                              value={password2}
                            />
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                backgroundColor: "transparent",
                                height: "100%",
                                left: 0,
                                top: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onPress={this.handleTogglePassword2Visibility}>
                              {!this.state.secureTextEntry2 ? (
                                <Icon
                                  name="eye-outline"
                                  size={19}
                                  color={colors.blue29}
                                />
                              ) : (
                                <Icon
                                  name="eye-off-outline"
                                  size={19}
                                  color={colors.blue29}
                                />
                              )}
                            </TouchableOpacity>
                          </View>

                          <View style={{
                            marginTop: 20,
                          }}>
                            <Text
                              style={[
                                styles.titleUpdatePassLink,
                                {
                                  textAlign: "right",
                                }]}
                              onPress={() => {
                                this.setState({
                                  showUserNameFl: !this.state.showUserNameFl,
                                  bankUserName: null,
                                });
                              }}>
                              {showUserNameFl ? "ללא זיהוי משתמש" : "עדכון שם משתמש"}
                            </Text>
                          </View>


                          <View
                            style={{
                              height: 20,
                              marginTop: 10,
                            }}>
                            {!passwordsValid && (
                              <Text
                                style={{
                                  color: "#ef3636",
                                  fontFamily: fonts.regular,
                                  fontSize: 14,
                                  lineHeight: 14,
                                  textAlign: "center",
                                }}>
                                הסיסמאות לא זהות
                              </Text>
                            )}
                            {errUpdate && (
                              <Text
                                style={{
                                  color: "#ef3636",
                                  fontFamily: fonts.regular,
                                  fontSize: 14,
                                  lineHeight: 14,
                                  textAlign: "center",
                                }}>
                                {errUpdate}
                              </Text>
                            )}
                          </View>

                          <Pressable
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={this.updateToken}
                            disabled={inProgress}
                            style={({ pressed }) => [
                              styles.btnContainer,
                              {
                                width: 196,
                                height: 38,
                                marginTop: 20,
                                alignSelf: "center",
                                backgroundColor: pressed
                                  ? colors.blue
                                  : colors.blue32,
                              },
                            ]}>
                            {({ pressed }) => (
                              <Fragment>
                                {inProgress ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                  />
                                ) : (
                                  <Text
                                    style={[
                                      styles.textBtn,
                                      {
                                        fontSize: 17.5,
                                      },
                                    ]}>
                                    עדכון
                                  </Text>
                                )}
                              </Fragment>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Fragment>
                )}
              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                (appTokenStatus.tokenStatus === "TECHNICALPROBLEM" ||
                  appTokenStatus.tokenStatus === "BANK_TECHNICALPROBLEM") && (
                  <Fragment>
                    <View style={styles.checkStyle}>
                      <Image
                        style={styles.problem}
                        source={require("../assets/problem.png")}
                      />
                    </View>
                    <View>
                      <Text style={styles.titleStep_TECHNICALPROBLEM}>
                        {appTokenStatus.tokenStatus === "TECHNICALPROBLEM"
                          ? "התעוררה תקלה טכנית"
                          : "התעוררה תקלה טכנית.\n אנחנו עובדים על פתרון"}
                      </Text>
                      {appTokenStatus.tokenStatus === "TECHNICALPROBLEM" && (
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({
                              tryAgain: true,
                            }, () => {
                              this.hashTokenStatus();

                              // if (this.getStatus !== null) {
                              //   this.hashTokenStatus();
                              // }
                            });
                            // this.hashTokenStatus();
                          }}>
                          <Text style={styles.titleStep_TECHNICALPROBLEM_link}>
                            נסו שוב
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Fragment>
                )}
              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                (appTokenStatus.tokenStatus === "BLOCKED") && (
                  <Fragment>
                    <View>
                      <Text style={styles.titleStep_TECHNICALPROBLEM}>
                        החשבון חסום.
                      </Text>
                      <Text style={styles.text_blocked}>
                        יש לפתוח את חסימת החשבון מול אתר הבנק
                        {"\n"}
                        ולאחר מכן לעדכן את הסיסמה החדשה בbizibox.
                      </Text>
                    </View>
                  </Fragment>
                )}
              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                // (appTokenStatus.tokenStatus === "INPROGRESS" ||
                //   appTokenStatus.tokenStatus === "SPIDER_TAKE" ||
                //   appTokenStatus.tokenStatus === "NEW" ||
                //   appTokenStatus.tokenStatus === "BANKTRANSLOAD" ||
                //   appTokenStatus.tokenStatus === "CREDITCARDLOAD" ||
                //   appTokenStatus.tokenStatus === "CHECKSLOAD" ||
                //   appTokenStatus.tokenStatus === "DEPOSITLOAD" ||
                //   appTokenStatus.tokenStatus === "LOANLOAD" ||
                //   appTokenStatus.tokenStatus === "FOREIGNTRANSLOAD"
                // ) &&
                appTokenStatus.tokenStatus === "LOADING"
                &&
                (appTokenStatus.tokenType === "BANKTRANSLOAD" ||
                  appTokenStatus.tokenType === "CREDITCARDLOAD" ||
                  appTokenStatus.tokenType === "CHECKSLOAD" ||
                  appTokenStatus.tokenType === "DEPOSITLOAD" ||
                  appTokenStatus.tokenType === "LOANLOAD" ||
                  appTokenStatus.tokenType === "STANDINGORDERSLOAD" ||
                  appTokenStatus.tokenType === "FOREIGNTRANSLOAD" ||
                  (appTokenStatus.tokenStatus === "VALIDPOALIMBAASAKIM" &&
                    finishedSuc === false)) && (
                  <Fragment>
                    <View>
                      <Text style={styles.titleStep3}>
                        בדיקת תקינות מתבצעת כעת
                      </Text>
                    </View>
                    <View style={styles.progressCircle}>
                      {/*<PieChart style={{ height: 300, width:300, }} data={pieData} />*/}
                      <ProgressCircle
                        style={{
                          height: 160,
                          width: 160,
                          shadowColor: "#000000",
                          shadowOffset: {
                            width: 0,
                            height: 3,
                          },
                          shadowOpacity: 0.45,
                          elevation: 5,
                        }}
                        strokeWidth={15}
                        progress={prcIncome / 100}
                        cornerRadius={0}
                        backgroundColor={"#c3e1fd"}
                        progressColor={"#022258"}>
                        <View
                          style={{
                            marginTop: 65,
                            alignSelf: "center",
                            zIndex: 9,
                          }}>
                          <Text
                            style={{
                              textAlign: "center",
                              color: "#022258",
                              fontFamily: fonts.regular,
                              fontSize: 31,
                              lineHeight: 31,
                            }}>
                            {prcIncome < 0 ? "0%" : `${Math.round(prcIncome)}%`}
                          </Text>
                        </View>
                      </ProgressCircle>

                      {/*<View style={{*/}
                      {/*  height: 87,*/}
                      {/*  width: 87,*/}
                      {/*  alignSelf: "center",*/}
                      {/*  flex: 195,*/}
                      {/*}}>*/}
                      {/*  <PieChart*/}
                      {/*    spacing={0}*/}
                      {/*    style={{*/}
                      {/*      zIndex: 2,*/}
                      {/*      top: 0,*/}
                      {/*      height: 87,*/}
                      {/*      width: 87,*/}
                      {/*      position: "absolute",*/}
                      {/*      left: 0,*/}
                      {/*    }}*/}
                      {/*    outerRadius={"100%"}*/}
                      {/*    innerRadius={"90%"}*/}
                      {/*    data={*/}
                      {/*      prcIncomesArr.map((key, index) => {*/}
                      {/*        return {*/}
                      {/*          value: key.prc,*/}
                      {/*          key: `pie-${index}`,*/}
                      {/*          svg: {*/}
                      {/*            fill: key.active*/}
                      {/*              ? "#229f88"*/}
                      {/*              : "#bbf6eb",*/}
                      {/*          },*/}
                      {/*          arc: {*/}
                      {/*            outerRadius: "100%",*/}
                      {/*            padAngle: 0,*/}
                      {/*          },*/}
                      {/*        };*/}
                      {/*      })*/}
                      {/*    }*/}
                      {/*  />*/}
                      {/*  <View style={{*/}
                      {/*    position: "absolute",*/}
                      {/*    width: 87,*/}
                      {/*    left: 0,*/}
                      {/*    top: 24,*/}
                      {/*    zIndex: 9,*/}
                      {/*  }}>*/}
                      {/*    <Text*/}
                      {/*      style={{*/}
                      {/*        textAlign: "center",*/}
                      {/*        color: "#022258",*/}
                      {/*        fontFamily: fonts.semiBold,*/}
                      {/*        fontSize: 18,*/}
                      {/*        lineHeight: 18,*/}
                      {/*      }}>*/}
                      {/*      {prcIncome < 0 ? "0%" : `${Math.round(prcIncome)}%`}*/}
                      {/*    </Text>*/}
                      {/*  </View>*/}
                      {/*</View>*/}
                    </View>
                  </Fragment>
                )}

              {step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                ((appTokenStatus.tokenStatus === "VALIDPOALIMBAASAKIM" && finishedSuc === true) || appTokenStatus.tokenStatus === "UP_TO_DATE") && (
                  <Fragment>
                    <View>
                      <Text
                        style={[
                          styles.titleStep3_COMPLETED,
                          {
                            marginBottom: 70,
                          },
                        ]}>
                        החשבון נטען בהצלחה
                      </Text>
                    </View>
                    <View style={styles.checkStyle}>
                      <Icon name="check" size={200} color={"#6cbae7"} />
                    </View>
                    <View>
                      <Text style={styles.bottomText_VALIDPOALIMBAASAKIM}>
                        ניתן לבצע
                        <Text
                          style={styles.bottomText_VALIDPOALIMBAASAKIM_link}
                          onPress={() => {
                            this.setState({
                              tryAgain: true,
                            }, () => {
                              this.hashTokenStatus();

                              // if (this.getStatus !== null) {
                              //   this.hashTokenStatus();
                              // }
                            });
                          }}>
                          {" טעינה חוזרת "}
                        </Text>
                        של החשבון
                      </Text>
                    </View>
                  </Fragment>
                )}

              {step === 3 && modalVisible === true && (
                <View style={styles.modalVisibleView}>
                  <View
                    style={[
                      styles.topHeaderUpdatePass,
                      {
                        justifyContent: "center",
                      },
                    ]}>
                    {/*<View>*/}
                    {/*  <TouchableOpacity*/}
                    {/*    onPress={() => {*/}
                    {/*      this.setState({ modalVisible: false });*/}
                    {/*    }}>*/}
                    {/*    <Text style={styles.topHeaderUpdatePassRight}>*/}
                    {/*      ביטול*/}
                    {/*    </Text>*/}
                    {/*  </TouchableOpacity>*/}
                    {/*</View>*/}
                    <View>
                      <Text style={styles.topHeaderUpdatePassCenter}>
                        טעינת פועלים בעסקים
                      </Text>
                    </View>
                    {/*<View>*/}
                    {/*  <Text style={styles.topHeaderUpdatePassLeft}>*/}
                    {/*    {"    "}*/}
                    {/*  </Text>*/}
                    {/*</View>*/}
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 24,
                    }}>
                    {/*<View*/}
                    {/*  style={{*/}
                    {/*    marginTop: 20,*/}
                    {/*  }}>*/}
                    {/*  <Image*/}
                    {/*    style={styles.loader}*/}
                    {/*    source={require("../assets/loader.gif")}*/}
                    {/*  />*/}
                    {/*  <Text*/}
                    {/*    style={[*/}
                    {/*      styles.titleStep3,*/}
                    {/*      {*/}
                    {/*        textAlign: "center",*/}
                    {/*        marginTop: 30,*/}
                    {/*        marginBottom: 10,*/}
                    {/*      },*/}
                    {/*    ]}>*/}
                    {/*    ממתין לחיבור*/}
                    {/*  </Text>*/}
                    {/*</View>*/}

                    {smsRemainedOTP <= 2 ? (
                      <Fragment>
                        <View
                          style={{
                            marginTop: 20,
                          }}>
                          <Text
                            style={[
                              styles.titleStep2,
                              {
                                fontSize: 18,
                                textAlign: "center",
                              },
                            ]}>
                            יש להזין את הקוד שקיבלתם מאתר הבנק
                          </Text>
                        </View>
                        <View
                          style={{
                            marginTop: 20,
                            width: "100%",
                            marginVertical: 5,
                            borderBottomWidth: 1,
                            borderBottomColor:
                              otpCodeValid && !errStep2
                                ? colors.blue32
                                : colors.red,
                          }}>
                          <Animated.View
                            style={[styles.animatedStyle, animStyle_otpCode]}>
                            <Text style={styles.textLable}>מספר הקוד</Text>
                          </Animated.View>
                          <TextInput
                            placeholder={""}
                            placeholderTextColor="#202020"
                            editable={true}
                            maxLength={6}
                            autoCorrect={false}
                            textContentType="oneTimeCode"
                            autoFocus={true}
                            autoCapitalize="none"
                            returnKeyType="done"
                            keyboardType={!IS_IOS ? "numeric" : "number-pad"}
                            underlineColorAndroid="rgba(255,255,255,0)"
                            // secureTextEntry={secureTextEntry}
                            style={[
                              styles.input,
                              {
                                borderBottomColor: "rgba(255,255,255,0)",
                                borderBottomWidth: 0,
                                paddingLeft: 30,
                                textAlign:
                                  !otpCode || (otpCode && otpCode.length === 0)
                                    ? "right"
                                    : otpCodeSide,
                              },
                            ]}
                            onEndEditing={e => {
                              e.persist();
                              this.setState(
                                {
                                  otpCode: e.nativeEvent.text
                                    .toString()
                                    .replace(/[^\d-]/g, ""),
                                },
                                () => {
                                  if (this.state.otpCode.length > 0) {
                                    this.moveTextTop("otpCode");
                                  } else {
                                    this.moveTextBottom("otpCode");
                                  }
                                  this.handleUpdateFieldValid("otpCodeValid")(
                                    e,
                                  );
                                },
                              );
                            }}
                            onFocus={this.onFocusInput("otpCodeSide")}
                            onChangeText={this.handleUpdateField("otpCode")}
                            onSubmitEditing={this.hashAppTokenOtp}
                            value={otpCode}
                          />
                          {/*<TouchableOpacity*/}
                          {/*  style={{*/}
                          {/*    position: "absolute",*/}
                          {/*    backgroundColor: "transparent",*/}
                          {/*    height: "100%",*/}
                          {/*    left: 0,*/}
                          {/*    top: 1,*/}
                          {/*    alignItems: "center",*/}
                          {/*    justifyContent: "center",*/}
                          {/*  }}*/}
                          {/*  onPress={this.handleTogglePasswordVisibility}>*/}
                          {/*  {this.state.secureTextEntry ? (*/}
                          {/*    <Icon*/}
                          {/*      name="eye-outline"*/}
                          {/*      size={19}*/}
                          {/*      color={colors.blue29}*/}
                          {/*    />*/}
                          {/*  ) : (*/}
                          {/*    <Icon*/}
                          {/*      name="eye-off-outline"*/}
                          {/*      size={19}*/}
                          {/*      color={colors.blue29}*/}
                          {/*    />*/}
                          {/*  )}*/}
                          {/*</TouchableOpacity>*/}
                        </View>
                        <View
                          style={{
                            height: 20,
                          }}>
                          {!otpCodeValid && (
                            <Text
                              style={{
                                color: "#ef3636",
                                fontFamily: fonts.regular,
                                fontSize: 14,
                                lineHeight: 14,
                                textAlign: "left",
                              }}>
                              יש להזין את הקוד שנשלח לנייד
                            </Text>
                          )}
                        </View>
                        {errStep2 !== false && (
                          <View
                            style={{
                              height: 20,
                            }}>
                            <Text
                              style={{
                                color: "#ef3636",
                                fontFamily: fonts.regular,
                                fontSize: 14,
                                lineHeight: 14,
                                textAlign: "center",
                              }}>
                              {errStep2}
                            </Text>
                          </View>
                        )}

                        {appTokenStatus &&
                          appTokenStatus.tokenStatus === "WRONG_OTP_CODE" && (
                            <View
                              style={{
                                height: "auto",
                              }}>
                              <Text
                                style={{
                                  color: "#ef3636",
                                  fontFamily: fonts.regular,
                                  fontSize: 14,
                                  lineHeight: 14,
                                  textAlign: "center",
                                }}>
                                קוד הזיהוי החד פעמי לא תואם
                                {"\n"}
                                {"לקוד שנשלח, אנא "}
                                <Text
                                  onPress={() => {
                                    this.setState({
                                      tryAgain: true,
                                    }, () => {
                                      this.hashTokenStatus();

                                      // if (this.getStatus !== null) {
                                      //   this.hashTokenStatus();
                                      // }
                                    });
                                  }}
                                  style={{
                                    fontFamily: fonts.regular,
                                    fontSize: 14,
                                    lineHeight: 14,
                                    color: colors.blueLink,
                                  }}>
                                  {"נסו שוב"}
                                </Text>
                              </Text>
                            </View>
                          )}

                        <Pressable
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          onPress={this.hashAppTokenOtp}
                          disabled={
                            inProgress ||
                            (appTokenStatus &&
                              appTokenStatus.tokenStatus === "WRONG_OTP_CODE")
                          }
                          style={({ pressed }) => [
                            styles.btnContainer,
                            {
                              width: 163,
                              alignSelf: "center",
                              height: 33,
                              marginTop: 20,
                              backgroundColor: pressed
                                ? colors.blue
                                : colors.blue32,
                            },
                          ]}>
                          {({ pressed }) => (
                            <Fragment>
                              {inProgress ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#ffffff"
                                />
                              ) : (
                                <Text
                                  style={[
                                    styles.textBtn,
                                    {
                                      fontSize: 15,
                                    },
                                  ]}>
                                  אישור
                                </Text>
                              )}
                            </Fragment>
                          )}
                        </Pressable>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <View
                          style={{
                            marginTop: 20,
                          }}>
                          <Text
                            style={{
                              fontFamily: fonts.regular,
                              textAlign: "center",
                              fontSize: 22,
                              color: colors.blue32,
                            }}>
                            נעשו 3 ניסיונות כניסה לא נכונים.
                            {"\n"}
                            לא ניתן להמשיך בתהליך ההזדהות
                          </Text>
                        </View>
                      </Fragment>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/*{step === 3 &&*/}
            {/*  appTokenStatus &&*/}
            {/*  (appTokenStatus.description === "WRONG OTP CODE" ||*/}
            {/*    (appTokenStatus.description === "OK" &&*/}
            {/*      (!appTokenStatus.connectionStatus ||*/}
            {/*        appTokenStatus.connectionStatus !== "Completed"))) && (*/}
            {/*    <Fragment>*/}
            {/*      <View>*/}
            {/*        <Text style={styles.titleStep3}>*/}
            {/*          יש ללחוץ על כפתור ״הפעלה״ כדי שנבצע*/}
            {/*          {"\n"}*/}
            {/*          בדיקת תקינות לחשבון*/}
            {/*        </Text>*/}
            {/*      </View>*/}

            {/*      <Pressable*/}
            {/*        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}*/}
            {/*        onPress={() => {*/}
            {/*          this.hashAppTokenWork();*/}
            {/*          this.setState({ showLoader: true });*/}
            {/*        }}*/}
            {/*        style={({ pressed }) => [*/}
            {/*          {*/}
            {/*            backgroundColor: pressed*/}
            {/*              ? colors.blue*/}
            {/*              : colors.blue32,*/}
            {/*          },*/}
            {/*          styles.btnCircleContainer,*/}
            {/*        ]}>*/}
            {/*        {({ pressed }) => (*/}
            {/*          <Fragment>*/}
            {/*            <Text style={styles.textCircleBtn}>הפעלה</Text>*/}
            {/*          </Fragment>*/}
            {/*        )}*/}
            {/*      </Pressable>*/}
            {/*    </Fragment>*/}
            {/*  )}*/}

            {/*{step === 3 &&*/}
            {/*  appTokenStatus &&*/}
            {/*  (appTokenStatus.description === "WRONG PASS" ||*/}
            {/*    appTokenStatus.description === "SHOW_OTP_POPUP" ||*/}
            {/*    appTokenStatus.description === "WRONG OTP CODE1" ||*/}
            {/*    appTokenStatus.description === "WRONG OTP CODE2") && (*/}
            {/*    <Fragment>*/}
            {/*      {(appTokenStatus.description === "WRONG PASS" ||*/}
            {/*        appTokenStatus.description === "SHOW_OTP_POPUP") && (*/}
            {/*        <View>*/}
            {/*          <View>*/}
            {/*            <Text style={styles.titleStep3Err}>הסיסמה שגויה</Text>*/}
            {/*          </View>*/}
            {/*          <View>*/}
            {/*            <Text style={styles.titleStep3}>*/}
            {/*              יש לגשת למסך ״ניהול חשבונות״ במחשב*/}
            {/*              {"\n"}*/}
            {/*              על מנת לפתור את השגיאה*/}
            {/*            </Text>*/}
            {/*          </View>*/}
            {/*        </View>*/}
            {/*      )}*/}

            {/*      <Pressable*/}
            {/*        onPress={null}*/}
            {/*        disabled={true}*/}
            {/*        style={({ pressed }) => [*/}
            {/*          {*/}
            {/*            backgroundColor: colors.blue32,*/}
            {/*            opacity: 0.4,*/}
            {/*          },*/}
            {/*          styles.btnCircleContainer,*/}
            {/*        ]}>*/}
            {/*        {({ pressed }) => (*/}
            {/*          <Fragment>*/}
            {/*            <Text style={styles.textCircleBtn}>הפעלה</Text>*/}
            {/*          </Fragment>*/}
            {/*        )}*/}
            {/*      </Pressable>*/}
            {/*    </Fragment>*/}
            {/*  )}*/}

            {((step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                appTokenStatus.tokenStatus !== "BLOCKED" && (
                  // (appTokenStatus.tokenStatus === "INPROGRESS" ||
                  //   appTokenStatus.tokenStatus === "SPIDER_TAKE" ||
                  //   appTokenStatus.tokenStatus === "NEW" ||
                  //   appTokenStatus.tokenStatus === "BANKTRANSLOAD" ||
                  //   appTokenStatus.tokenStatus === "CREDITCARDLOAD" ||
                  //   appTokenStatus.tokenStatus === "CHECKSLOAD" ||
                  //   appTokenStatus.tokenStatus === "DEPOSITLOAD" ||
                  //   appTokenStatus.tokenStatus === "LOANLOAD" ||
                  //   appTokenStatus.tokenStatus === "FOREIGNTRANSLOAD") &&
                  (appTokenStatus.tokenStatus === "LOADING"
                    &&
                    (appTokenStatus.tokenType === "BANKTRANSLOAD" ||
                      appTokenStatus.tokenType === "CREDITCARDLOAD" ||
                      appTokenStatus.tokenType === "CHECKSLOAD" ||
                      appTokenStatus.tokenType === "DEPOSITLOAD" ||
                      appTokenStatus.tokenType === "LOANLOAD" ||
                      appTokenStatus.tokenType === "FOREIGNTRANSLOAD"))
                  ||
                  appTokenStatus.tokenType === "STANDINGORDERSLOAD" ||
                  (appTokenStatus.tokenStatus === "VALIDPOALIMBAASAKIM" &&
                    finishedSuc === false))) ||
              (step === 3 &&
                modalVisible === false &&
                appTokenStatus &&
                appTokenStatus.tokenStatus === "NOT_UP_TO_DATE")) && (
              <View style={styles.barInfo}>
                <Text style={styles.barInfoText}>
                  <Text style={styles.barInfoTextBold}>מומלץ! </Text>
                  ללחוץ על כפתור ״הפעלה״ פעם ביום
                  {"\n"}
                  כדי שהנתונים יהיו מעודכנים
                </Text>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>

        {/*{showLoader && modalVisible === false && (*/}
        {/*  <View style={styles.centeredView}>*/}
        {/*    <Modal*/}
        {/*      animationType="fade"*/}
        {/*      transparent={true}*/}
        {/*      visible={showLoader}*/}
        {/*      onRequestClose={() => {*/}
        {/*        this.setState({ showLoader: false });*/}
        {/*      }}>*/}
        {/*      <View style={styles.centeredView}>*/}
        {/*        <View style={styles.modalView}>*/}
        {/*          <TouchableOpacity*/}
        {/*            style={{*/}
        {/*              position: "absolute",*/}
        {/*              backgroundColor: "transparent",*/}
        {/*              left: 20,*/}
        {/*              top: 15,*/}
        {/*            }}*/}
        {/*            onPress={() => {*/}
        {/*              this.setState({ showLoader: false });*/}
        {/*            }}>*/}
        {/*            <Icon name="window-close" size={20} color={colors.blue32} />*/}
        {/*          </TouchableOpacity>*/}
        {/*          <View*/}
        {/*            style={{*/}
        {/*              marginTop: 20,*/}
        {/*            }}>*/}
        {/*            <Image*/}
        {/*              style={styles.loader}*/}
        {/*              source={require("../assets/loader.gif")}*/}
        {/*            />*/}
        {/*            <Text*/}
        {/*              style={[*/}
        {/*                styles.titleStep3,*/}
        {/*                {*/}
        {/*                  textAlign: "center",*/}
        {/*                  marginTop: 30,*/}
        {/*                  marginBottom: 10,*/}
        {/*                },*/}
        {/*              ]}>*/}
        {/*              ממתין לחיבור*/}
        {/*            </Text>*/}
        {/*          </View>*/}
        {/*        </View>*/}
        {/*      </View>*/}
        {/*    </Modal>*/}
        {/*  </View>*/}
        {/*)}*/}

        <Text style={{
          textAlign: "center",
          color: colors.blue32,
          position: "absolute",
          bottom: 3,
          left: "49%",
          fontSize: 14,
          fontFamily: fonts.regular,
        }}>{VERSION}</Text>
      </Fragment>
    );
  }
}

export default Login;
