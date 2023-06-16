/**
 * @format
 */
import {AppRegistry, I18nManager, LogBox, Text, TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import GlobalFont from 'react-native-global-font';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = Text.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
GlobalFont.applyGlobal('Assistant-Regular');
I18nManager.forceRTL(false);
I18nManager.allowRTL(false);
LogBox.ignoreAllLogs(true);
AppRegistry.registerComponent(appName, () => App);
