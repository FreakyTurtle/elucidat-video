export default (state = false, payload) => {
  switch (payload.type) {
    case 'TOGGLE_MUTE_VIDEO':
      return state ? false : true;
      break;
    default:
      return state;
  }
}
