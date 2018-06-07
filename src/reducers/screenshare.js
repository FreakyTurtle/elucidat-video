export default (state = false, payload) => {
  switch (payload.type) {
    case 'TOGGLE_SCREENSHARE':
      return state ? false : true;
      break;
    default:
      return state;
  }
}
