export default (state = false, action) => {
  switch (action.type) {
    case 'CHECKED_UPDATES':
      return true;
    default:
      return state;
  }
}
