import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Track } from 'react-native-track-player';
import TrackPlayer, {
  useTrackPlayerEvents,
  usePlaybackState,
  useProgress,
  Event,
  State
} from 'react-native-track-player';

export const TrackInfo = () => {

  const [track, setInfo] = useState({});
  useEffect(() => {
    setTrackInfo();
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], (event) => {
    if (event.state == State.nextTrack) {
      setTrackInfo();
    }
  });

  async function setTrackInfo() {
    const tracks = await TrackPlayer.getCurrentTrack();
    const info = await TrackPlayer.getTrack(tracks);
    setInfo(info);
  }

  console.log(track)

  return (
    <View style={styles.container}>
      <Image style={styles.artwork} source={{ uri: `${track?.artwork}` }} />
      <Text style={styles.titleText}>{track?.title}</Text>
      <Text style={styles.artistText}>{track?.artist}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    width: 240,
    height: 240,
    marginTop: 30,
    backgroundColor: 'grey',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 30,
  },
  artistText: {
    fontSize: 16,
    fontWeight: '200',
    color: 'white',
  },
});
