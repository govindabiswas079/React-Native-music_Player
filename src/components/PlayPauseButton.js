import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import TrackPlayer, {
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from '../hooks';
import { Button } from './Button';

export const PlayPauseButton = ({ playerState }) => {

  async function handlePlayPress() {
    if (await TrackPlayer.getState() == State.Playing) {
      TrackPlayer.pause();
    }
    else {
      TrackPlayer.play();
    }
  }


  const showBuffering = false
  return showBuffering ? (
    <View style={styles.statusContainer}>
      <ActivityIndicator />
    </View>
  ) : (
    <Button
      title={playerState == State.Playing ? 'pause' : 'play'}
      onPress={() => handlePlayPress()}
      type="primary"
      style={styles.playPause}
    />
  );
};

const styles = StyleSheet.create({
  playPause: {
    width: 120,
    textAlign: 'center',
  },
  statusContainer: {
    height: 40,
    width: 120,
    marginTop: 20,
    marginBottom: 60,
  },
});
