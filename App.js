import type {Node} from 'react';
import React from 'react';
import {ImageBackground, SafeAreaView, StatusBar, View} from 'react-native';
import Login from './src/Login';
import styles from './src/CommonStyle';
import {IS_IOS} from './src/vars';

const App: () => Node = () => {
  return (
    <View style={[styles.container, styles.containerBg]}>
      <StatusBar barStyle={'dark-content'} />
      <ImageBackground
        source={require('./assets/bg.png')}
        resizeMode={IS_IOS ? 'cover' : 'stretch'}
        style={styles.image}>
        <SafeAreaView style={styles.container}>
          <Login />
        </SafeAreaView>
      </ImageBackground>
      <View style={styles.bottomSpace} />
    </View>
  );
};

export default App;
