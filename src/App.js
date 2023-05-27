import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import { Button, PlayerControls, Progress, TrackInfo } from './components';
import { QueueInitialTracksService, SetupService } from './services';

const App = () => {
  // const track = useActiveTrack();
  const isPlayerReady = useSetupPlayer();

  useEffect(() => {
    function deepLinkHandler(data) {
      // console.log('deepLinkHandler', data.url);
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    // When you launch the closed app from the notification or any other link
    Linking.getInitialURL().then((url) => console.log('getInitialURL', url));

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.contentContainer}>
        <View style={styles.topBarContainer}>
          <Button
            title="Queue"
            onPress={() => console.log('TODO: implement queue interface')}
            type="primary"
          />
        </View>
        <TrackInfo
        // track={track}
        />
        <Progress
        // live={track?.isLiveStream}
        />
      </View>
      <View style={styles.actionRowContainer}>
        <PlayerControls />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 3,
    alignItems: 'center',
  },
  topBarContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
  },
  actionRowContainer: {
    flex: 1,
    flexDirection: 'row',
  },
});

function useSetupPlayer() {
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      await SetupService();
      if (unmounted) return;
      setPlayerReady(true);
      const queue = await TrackPlayer.getQueue();
      if (unmounted) return;
      if (queue.length <= 0) {
        await QueueInitialTracksService();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}

export default App;


/* 
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import TrackPlayer, {
  useTrackPlayerEvents,
  usePlaybackState,
  useProgress,
  Event,
  State
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import { setupPlayer, addTracks } from './services/trackPlayerServices';

// import { QueueInitialTracksService, SetupService } from './services';

function Header() {
  const [info, setInfo] = useState({});
  useEffect(() => {
    setTrackInfo();
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], (event) => {
    if (event.state == State.nextTrack) {
      setTrackInfo();
    }
  });

  async function setTrackInfo() {
    const track = await TrackPlayer.getCurrentTrack();
    const info = await TrackPlayer.getTrack(track);

    console.log(info)
    setInfo(info);
  }

  return (
    <View>
      <Text style={styles.songTitle}>{info.title}</Text>
      <Text style={styles.artistName}>{info.artist}</Text>
    </View>
  );
}

function TrackProgress() {
  const { position, duration } = useProgress(200);

  function format(seconds) {
    let mins = (parseInt(seconds / 60)).toString().padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <View>
      <Text style={styles.trackProgress}>
        {format(position)} / {format(duration)}
      </Text>
    </View>
  );
}

function Playlist() {
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);

  async function loadPlaylist() {
    const queue = await TrackPlayer.getQueue();
    setQueue(queue);
  }

  useEffect(() => {
    loadPlaylist();
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], (event) => {
    if (event.state == State.nextTrack) {
      TrackPlayer.getCurrentTrack().then((index) => setCurrentTrack(index));
    }
  });

  function PlaylistItem({ index, title, isCurrent }) {

    function handleItemPress() {
      TrackPlayer.skip(index);
    }

    return (
      <TouchableOpacity onPress={handleItemPress}>
        <Text
          style={{
            ...styles.playlistItem,
            ...{ backgroundColor: isCurrent ? '#666' : 'transparent' }
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  async function handleShuffle() {
    let queue = await TrackPlayer.getQueue();
    await TrackPlayer.reset();
    queue.sort(() => Math.random() - 0.5);
    await TrackPlayer.add(queue);

    loadPlaylist()
  }

  return (
    <View>
      <View style={styles.playlist}>
        <FlatList
          data={queue}
          renderItem={({ item, index }) => <PlaylistItem
            index={index}
            title={item.title}
            isCurrent={currentTrack == index} />
          }
        />
      </View>
      <Controls onShuffle={handleShuffle} />
    </View>
  );
}

function Controls({ onShuffle }) {
  const playerState = usePlaybackState();

  async function handlePlayPress() {
    if (await TrackPlayer.getState() == State.Playing) {
      TrackPlayer.pause();
    }
    else {
      TrackPlayer.play();
    }
  }

  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap', alignItems: 'center'
    }}>
      <Icon.Button
        name="arrow-left"
        size={28}
        backgroundColor="transparent"
        onPress={() => TrackPlayer.skipToPrevious()} />
      <Icon.Button
        name={playerState == State.Playing ? 'pause' : 'play'}
        size={28}
        backgroundColor="transparent"
        onPress={handlePlayPress} />
      <Icon.Button
        name="arrow-right"
        size={28}
        backgroundColor="transparent"
        onPress={() => TrackPlayer.skipToNext()} />
      <Icon.Button
        name="random"
        size={28}
        backgroundColor="transparent"
        onPress={onShuffle} />
    </View>
  );
}

function App() {

  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      let isSetup = await setupPlayer(); // SetupService(); //setupPlayer()

      const queue = await TrackPlayer.getQueue();
      if (isSetup && queue.length <= 0) {
        await addTracks(); // QueueInitialTracksService(); // addTracks();
      }

      setIsPlayerReady(isSetup);
    }

    setup();
  }, []);

  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#bbb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <TrackProgress />
      <Playlist />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#112'
  },
  songTitle: {
    fontSize: 32,
    marginTop: 50,
    color: '#ccc'
  },
  artistName: {
    fontSize: 24,
    color: '#888'
  },
  playlist: {
    marginTop: 40,
    marginBottom: 40
  },
  playlistItem: {
    fontSize: 16,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4
  },
  trackProgress: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 24,
    color: '#eee'
  },
});

export default App; */