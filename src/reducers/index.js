import example from './example';
import navigation from './navigate';
import checkedUpdates from './updates.js';
import streams from './streams.js';
import { combineReducers } from 'redux';
import muteVideo from './muteVideo';
import muteAll from './muteAll';
import muteMic from './muteMic';
import screensharing from './screenshare';
import streamIds from './streams';
import zoom from './toggleZoom';

const rootReducer = combineReducers({
  example,
  navigation,
  checkedUpdates,
  streams,
  mutedVideo,
  mutedAll,
  mutedMic,
  screensharing,
  streamIds,
  zoom
});

export default rootReducer;
