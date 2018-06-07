export default (state = false, payload) => {
  switch (payload.type) {
    case 'TOGGLE_MUTE_ALL':
      return state ? false : true;
      break;
    default:
      return state;
  }
}
