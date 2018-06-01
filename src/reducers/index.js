import example from './example';
import navigation from './navigate';
import checkedUpdates from './updates.js';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  example,
  navigation,
  checkedUpdates
});

export default rootReducer;
