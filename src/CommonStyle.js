import { StyleSheet } from "react-native";
import { colors, fonts } from "./vars";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  nav: {
    flexDirection: "row-reverse",
    height: 30,
    marginBottom: 20,
    justifyContent: "space-around",
  },
  textLable: {
    color: colors.blue32,
    fontFamily: fonts.regular,
    textAlign: "right",
    fontSize: 18,
  },
  animatedStyle: {
    top: "50%",
    marginTop: -20,
    right: 0,
    position: "absolute",
  },
  barInfo: {
    height: 58,
    backgroundColor: "#c9e3fa",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  barInfoText: {
    color: "#6d6b6b",
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 18,
    alignSelf: "center",
  },
  barInfoTextBold: {
    color: "#6d6b6b",
    fontFamily: fonts.semiBold,
    textAlign: "center",
    fontSize: 18,
    alignSelf: "center",
  },
  textNavBtn: {
    color: colors.blue32,
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 20.5,
    alignSelf: "center",
  },
  titleStep1Tab2: {
    color: colors.blue32,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "right",
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  containerBg: {
    backgroundColor: "#ffffff",
  },
  bottomSpace: {
    height: 14,
    backgroundColor: "#eaf4fd",
  },
  logo: {
    width: 169,
    height: 39.5,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 80,
  },
  problem: {
    marginTop: 40,
    marginBottom: 20,
    width: 99,
    height: 99,
    alignSelf: "center",
  },
  loader: {
    width: 153,
    height: 132.5,
    alignSelf: "center",
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 60,
    textAlign: "center",
  },
  inner: {
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: "space-around",
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: "#000000",
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    marginTop: 30,
    height: 50,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  textBtn: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: "center",
    fontSize: 22,
    alignSelf: "center",
  },
  input: {
    color: colors.blue32,
    height: 39,
    fontSize: 14,
    width: "100%",
    direction: "ltr",
    fontFamily: fonts.regular,
    textAlign: "right",
  },
  backToMainStep: {
    fontFamily: fonts.semiBold,
    textAlign: "center",
    fontSize: 14,
    color: colors.blue30,
    marginTop: 10,
  },
  titleStep2: {
    fontFamily: fonts.regular,
    textAlign: "right",
    fontSize: 17,
    color: colors.blue32,
    marginBottom: 25,
  },
  titleStep2Blocked: {
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 17,
    color: colors.blue32,
    marginTop: 100,
    marginBottom: 160,
  },
  titleStep3: {
    fontFamily: fonts.regular,
    textAlign: "right",
    fontSize: 17,
    color: colors.blue32,
    marginTop: 0,
  },
  linkUpdatePassword: {
    fontFamily: fonts.regular,
    textAlign: "right",
    fontSize: 17,
    color: colors.blueLink,
    marginTop: 0,
  },
  topHeaderUpdatePass: {
    height: 60,
    backgroundColor: colors.blue32,
    flexDirection: "row-reverse",
    alignContent: "center",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: -40,
  },
  topHeaderUpdatePassCenter: {
    fontFamily: fonts.semiBold,
    fontSize: 19,
    color: colors.white,
  },
  topHeaderUpdatePassRight: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  topHeaderUpdatePassLeft: {
    fontFamily: fonts.light,
    fontSize: 13.5,
    color: colors.white,
  },
  titleViewUpdatePass: {
    marginTop: 30,
    marginBottom: 35,
  },
  titleUpdatePass: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.blue32,
    textAlign: "center",
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  titleUpdatePassLink: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.blueLink,
  },
  progressCircle: {
    marginTop: 70,
    alignSelf: "center",
  },
  titleStep3Err: {
    fontFamily: fonts.semiBold,
    textAlign: "right",
    fontSize: 17,
    color: colors.red,
    marginTop: 0,
  },
  titleStep3_COMPLETED: {
    fontFamily: fonts.semiBold,
    textAlign: "center",
    fontSize: 22,
    color: colors.blue32,
    marginTop: 60,
    marginBottom: 100,
  },
  titleStep_TECHNICALPROBLEM: {
    fontFamily: fonts.semiBold,
    textAlign: "center",
    fontSize: 23.5,
    color: colors.blue32,
  },
  text_blocked: {
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 18,
    color: colors.blue32,
    lineHeight:30,
    marginTop:30,
    marginBottom:30,
  },
  titleStep_TECHNICALPROBLEM_link: {
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 23.5,
    color: colors.blueLink,
  },
  checkStyle: {
    alignSelf: "center",
  },
  bottomText_VALIDPOALIMBAASAKIM: {
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 16,
    color: colors.blue32,
  },
  bottomText_VALIDPOALIMBAASAKIM_link: {
    fontFamily: fonts.regular,
    textAlign: "center",
    fontSize: 16,
    color: colors.blueLink,
  },
  btnCircleContainer: {
    marginTop: 70,
    height: 160,
    width: 160,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 80,
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    elevation: 5,
  },
  textCircleBtn: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: "center",
    fontSize: 30,
    alignSelf: "center",
  },
  centeredView: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    flex: 1,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  centeredModalOtpView: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    flex: 1,
    zIndex: 99,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  modalView: {
    margin: 0,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: 320,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalVisibleView: {},
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  // centerLoader: {
  //   flex: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   padding: 8,
  // },
  //
  // overlay: {
  //   position: "absolute",
  //   left: 0,
  //   right: 0,
  //   top: 0,
  //   bottom: 0,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#ffffff",
  //   zIndex: 100,
  //   opacity: 0.8,
  // },
  //
  // customLoaderWrapper: {
  //   flex: 1,
  //   height: "100%",
  //   width: "100%",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  //
  // biziboxAnimation: {
  //   width: 256,
  //   height: 256,
  // },
  //
  // simpleLoaderWrapper: {
  //   flex: 1,
  //   width: "100%",
  //   backgroundColor: "transparent",
  // },

  mainContainer: {
    flex: 1,
    height: "100%",
    position: "relative",
    backgroundColor: colors.white,
  },

  mainBgImg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  headerFakeBgImg: {
    top: 140,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  verticalCenterContainer: {
    flex: 1,
    justifyContent: "center",
  },

  horizontalCenterContainer: {
    flex: 1,
    alignItems: "center",
  },

  textCenter: {
    textAlign: "center",
  },

  textLeft: {
    textAlign: "left",
  },

  textRight: {
    textAlign: "right",
  },

  fill: {
    width: "100%",
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  column: {
    flexDirection: "column",
  },

  row: {
    flexDirection: "row",
  },

  justifyCenter: {
    justifyContent: "center",
  },

  justifyEnd: {
    justifyContent: "flex-end",
  },

  spaceBetween: {
    justifyContent: "space-between",
  },

  alignItemsCenter: {
    alignItems: "center",
  },

  boldFont: {
    fontFamily: fonts.bold,
  },

  extraBoldFont: {
    fontFamily: fonts.extraBold,
  },

  extraLightFont: {
    fontFamily: fonts.extraLight,
  },

  regularFont: {
    fontFamily: fonts.regular,
  },

  lightFont: {
    fontFamily: fonts.light,
  },

  semiBoldFont: {
    fontFamily: fonts.semiBold,
  },

  relative: {
    position: "relative",
  },

  spaceDivider: {
    paddingHorizontal: 2,
  },

  spaceDividerDouble: {
    paddingHorizontal: 4,
  },

  blueBtn: {
    backgroundColor: "#022258",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 100,
  },

  bgWhite: {
    backgroundColor: colors.white,
  },

  textWhite: {
    color: colors.white,
  },
});
