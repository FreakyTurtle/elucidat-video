export default (state = 'cover', payload) => {
  switch (payload.type) {
    case 'TOGGLE_ZOOM':
      return state === 'cover' ? 'contain' : 'cover';
      break;
    default:
      return state;
  }
}
