export default (state = "local", payload) => {
  switch (payload.type) {
    case 'CHANGE_ACTIVE':
      return payload.item;
      break;
    default:
      return state;
  }
}
