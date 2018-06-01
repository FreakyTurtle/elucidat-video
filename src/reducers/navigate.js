// const navigate = (state = [], action) => {
//   switch (action.type) {
//     case 'NAV_OPEN_PROJECTS':
//       return 'OPEN_PROJECTS';
//     case 'NAV_OPEN_PROJECTS':
//       return 'WELCOME';
//     default:
//       return state;
//   }
// }
export default (state = {page:'WELCOME', room:''}, action) => {
  console.log("navigate reducer", state);
  console.log("navigate reducer", action);
  switch (action.type) {
    case 'WELCOME':
      return {page:'WELCOME', room: '' };
    case 'IN_ROOM':
      return {page:'IN_ROOM',room:action.item };
    default:
      return state;
  }
}
