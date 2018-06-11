export default (state = "", payload) => {
  switch (payload.type) {
    case 'CHANGE_SELECTED':
      return payload.item;
      break;
    default:
      return state;
  }
}
