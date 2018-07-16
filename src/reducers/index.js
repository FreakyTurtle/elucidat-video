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
import activeStream from './activeStream';
import selectedStream from './selectedStream';
import zoom from './toggleZoom';
import messages from './messages.js';

const rootReducer = combineReducers({
  example,
  navigation,
  checkedUpdates,
  streams,
  muteVideo,
  muteAll,
  muteMic,
  screensharing,
  streamIds,
  selectedStream,
  activeStream,
  messages,
  zoom
});

export default rootReducer;
